from flask import Flask, request, jsonify, render_template
from openai import OpenAI
from flask_sock import Sock
import asyncio
import os
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import sqlite3
import json
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
from agents import AgentFactory, SpecializedAgent
from voice_handler import VoiceCallHandler, RealTimeVoiceHandler
from twilio_integration import TwilioCallHandler, WebRTCHandler
from crm_integration import CRMManager
from knowledge_base import KnowledgeBaseManager
from ticketing_integration import TicketingManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
sock = Sock(app)

# Configuração para produção
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', '16777216'))  # 16MB
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-change-in-production')

# Configuração de porta para Cloud Run
PORT = int(os.getenv('PORT', 5001))

class ConversationManager:
    """Manages conversation sessions and persistence."""

    def __init__(self, db_path: str = "conversations.db"):
        self.db_path = db_path
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database for conversation storage."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    user_input TEXT,
                    agent_response TEXT,
                    active_agent TEXT,
                    context TEXT
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    phone_number TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
                    current_agent TEXT DEFAULT 'triage',
                    context TEXT
                )
            """)

    def get_session_context(self, session_id: str) -> Dict[str, Any]:
        """Retrieve session context from database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT current_agent, context FROM sessions WHERE session_id = ?",
                (session_id,)
            )
            result = cursor.fetchone()

            if result:
                current_agent, context = result
                return {
                    'current_agent': current_agent,
                    'context': json.loads(context) if context else {}
                }
            else:
                # Create new session
                conn.execute(
                    "INSERT INTO sessions (session_id, current_agent, context) VALUES (?, ?, ?)",
                    (session_id, 'triage', '{}')
                )
                return {'current_agent': 'triage', 'context': {}}

    def save_conversation(self, session_id: str, user_input: str, agent_response: str,
                         active_agent: str, context: Dict[str, Any]):
        """Save conversation turn to database."""
        conversation_id = str(uuid.uuid4())

        with sqlite3.connect(self.db_path) as conn:
            # Save conversation turn
            conn.execute("""
                INSERT INTO conversations
                (id, session_id, user_input, agent_response, active_agent, context)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (conversation_id, session_id, user_input, agent_response,
                  active_agent, json.dumps(context)))

            # Update session
            conn.execute("""
                UPDATE sessions
                SET last_activity = CURRENT_TIMESTAMP, current_agent = ?, context = ?
                WHERE session_id = ?
            """, (active_agent, json.dumps(context), session_id))

# AIAgent class has been moved to agents.py and replaced with SpecializedAgent

class CallCenterAgentSystem:
    """Complete call center automation system with 6 specialized agents."""

    def __init__(self):
        self.conversation_manager = ConversationManager()
        self.crm_manager = CRMManager()
        self.knowledge_base = KnowledgeBaseManager()
        self.ticketing_manager = TicketingManager()
        self.agents = self._create_agent_network()
        self.voice_handler = VoiceCallHandler(self)
        self.twilio_handler = TwilioCallHandler(self)
        self.webrtc_handler = WebRTCHandler(self)
        logger.info("Call Center Agent System initialized with full enterprise capabilities")

    async def initialize_system(self):
        """Initialize all system components."""
        # Initialize default knowledge base content
        await self.knowledge_base.initialize_default_content()
        logger.info("System initialization complete")

    def _create_agent_network(self) -> Dict[str, SpecializedAgent]:
        """Initialize the 6 specialized AI agents using the AgentFactory."""
        return AgentFactory.create_all_agents(
            self.crm_manager,
            self.knowledge_base,
            self.ticketing_manager
        )

    async def handle_conversation(self, session_id: str, user_input: str, phone_number: str = None) -> Dict[str, Any]:
        """Main conversation handler supporting multiple agent interactions."""

        try:
            # Get session context
            session_context = self.conversation_manager.get_session_context(session_id)
            current_agent_name = session_context.get('current_agent', 'triage')
            context = session_context.get('context', {})

            # Add user input to context
            context['phone_number'] = phone_number
            context['last_user_input'] = user_input
            context['conversation_history'] = context.get('conversation_history', [])

            # Get current agent
            current_agent = self.agents.get(current_agent_name, self.agents['triage'])

            # Process message with current agent
            result = await current_agent.process_message(user_input, context)

            # Handle agent handoff if needed
            if result.get('handoff_needed') and result.get('target_agent') in self.agents:
                new_agent_name = result['target_agent']
                new_agent = self.agents[new_agent_name]

                # Create handoff message
                handoff_message = f"I'm transferring you to our {new_agent.role} for better assistance with your inquiry."

                # Process with new agent
                handoff_context = context.copy()
                handoff_context['handoff_reason'] = result.get('reason', 'Specialized assistance needed')
                handoff_context['previous_agent'] = current_agent_name

                new_result = await new_agent.process_message(user_input, handoff_context)

                # Update context and result
                current_agent_name = new_agent_name
                result = new_result
                result['handoff_message'] = handoff_message
                context = handoff_context

            # Update conversation history
            context['conversation_history'].append({
                'user': user_input,
                'agent': result['response'],
                'agent_name': current_agent_name,
                'timestamp': datetime.now().isoformat()
            })

            # Keep only last 10 interactions to manage context size
            if len(context['conversation_history']) > 10:
                context['conversation_history'] = context['conversation_history'][-10:]

            # Save conversation
            self.conversation_manager.save_conversation(
                session_id, user_input, result['response'],
                current_agent_name, context
            )

            return {
                'session_id': session_id,
                'response': result['response'],
                'active_agent': current_agent_name,
                'status': 'success',
                'confidence_score': result.get('confidence', 0.9),
                'handoff_message': result.get('handoff_message')
            }

        except Exception as e:
            logger.error(f"Conversation handling error: {str(e)}")
            return await self._handle_error(session_id, str(e), user_input)

    async def _handle_error(self, session_id: str, error: str, user_input: str) -> Dict[str, Any]:
        """Handle system errors gracefully."""
        error_response = {
            'session_id': session_id,
            'response': "I apologize for the technical difficulty. Let me connect you with a human agent for immediate assistance.",
            'active_agent': 'human_escalation',
            'status': 'error',
            'confidence_score': 0.0,
            'error': error
        }

        logger.error(f"System error for session {session_id}: {error}")
        return error_response

# Initialize the call center system
call_center = CallCenterAgentSystem()

# Flask API Endpoints
@app.route('/api/chat', methods=['POST'])
async def handle_chat():
    """Primary chat endpoint supporting text conversations."""
    try:
        data = request.get_json()

        # Validate required fields
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Missing required field: message',
                'status': 'error'
            }), 400

        # Generate session ID if not provided
        session_id = data.get('session_id', str(uuid.uuid4()))

        result = await call_center.handle_conversation(
            session_id=session_id,
            user_input=data.get('message', ''),
            phone_number=data.get('phone_number')
        )

        return jsonify(result)

    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/session/<session_id>/history', methods=['GET'])
def get_conversation_history(session_id):
    """Retrieve conversation history for a session."""
    try:
        with sqlite3.connect(call_center.conversation_manager.db_path) as conn:
            cursor = conn.execute("""
                SELECT timestamp, user_input, agent_response, active_agent
                FROM conversations
                WHERE session_id = ?
                ORDER BY timestamp ASC
            """, (session_id,))

            history = []
            for row in cursor.fetchall():
                timestamp, user_input, agent_response, active_agent = row
                history.append({
                    'timestamp': timestamp,
                    'user_input': user_input,
                    'agent_response': agent_response,
                    'active_agent': active_agent
                })

            return jsonify({
                'session_id': session_id,
                'history': history,
                'status': 'success'
            })

    except Exception as e:
        logger.error(f"History retrieval error: {str(e)}")
        return jsonify({
            'error': 'Failed to retrieve conversation history',
            'status': 'error'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'agents_available': list(call_center.agents.keys())
    })

@app.route('/api/agents/performance', methods=['GET'])
def get_agent_performance():
    """Get performance metrics for all agents."""
    try:
        performance_data = {}
        for agent_name, agent in call_center.agents.items():
            performance_data[agent_name] = agent.get_performance_metrics()

        return jsonify({
            'status': 'success',
            'timestamp': datetime.now().isoformat(),
            'agent_performance': performance_data
        })

    except Exception as e:
        logger.error(f"Performance metrics error: {str(e)}")
        return jsonify({
            'error': 'Failed to retrieve performance metrics',
            'status': 'error'
        }), 500

@app.route('/api/agents/<agent_name>/performance', methods=['GET'])
def get_specific_agent_performance(agent_name):
    """Get performance metrics for a specific agent."""
    try:
        if agent_name not in call_center.agents:
            return jsonify({
                'error': f'Agent {agent_name} not found',
                'status': 'error'
            }), 404

        agent = call_center.agents[agent_name]
        performance_data = agent.get_performance_metrics()

        return jsonify({
            'status': 'success',
            'agent_name': agent_name,
            'timestamp': datetime.now().isoformat(),
            'performance_metrics': performance_data
        })

    except Exception as e:
        logger.error(f"Agent performance error: {str(e)}")
        return jsonify({
            'error': 'Failed to retrieve agent performance metrics',
            'status': 'error'
    }), 500

# Voice API Endpoints
@app.route('/api/voice/start', methods=['POST'])
async def start_voice_call():
    """Start a voice conversation session."""
    try:
        data = request.get_json()
        session_id = data.get('session_id', str(uuid.uuid4()))
        agent_name = data.get('agent', 'triage')
        call_type = data.get('type', 'webrtc')  # webrtc or realtime

        if call_type == 'webrtc':
            result = await call_center.webrtc_handler.start_webrtc_session(session_id, agent_name)
        else:
            result = await call_center.voice_handler.start_voice_call(session_id, agent_name)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Voice start error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to start voice session'
        }), 500

@app.route('/api/voice/audio', methods=['POST'])
async def handle_voice_audio():
    """Handle audio data from voice calls."""
    try:
        session_id = request.form.get('session_id')
        if not session_id:
            return jsonify({'error': 'Session ID required'}), 400

        # Handle audio file upload
        if 'audio' in request.files:
            audio_file = request.files['audio']
            audio_data = audio_file.read()

            result = await call_center.webrtc_handler.handle_webrtc_audio(session_id, audio_data)
            return jsonify(result)

        return jsonify({'error': 'No audio data provided'}), 400

    except Exception as e:
        logger.error(f"Voice audio error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process audio'
        }), 500

@app.route('/api/voice/text', methods=['POST'])
async def send_voice_text():
    """Send text message to voice session (will be converted to speech)."""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        text = data.get('text')

        if not all([session_id, text]):
            return jsonify({'error': 'Session ID and text required'}), 400

        await call_center.voice_handler.send_text_to_call(session_id, text)

        return jsonify({
            'success': True,
            'message': 'Text sent to voice session'
        })

    except Exception as e:
        logger.error(f"Voice text error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to send text to voice session'
        }), 500

@app.route('/api/voice/end', methods=['POST'])
async def end_voice_call():
    """End a voice conversation session."""
    try:
        data = request.get_json()
        session_id = data.get('session_id')

        if not session_id:
            return jsonify({'error': 'Session ID required'}), 400

        # Try both handlers
        webrtc_result = await call_center.webrtc_handler.end_webrtc_session(session_id)
        voice_result = await call_center.voice_handler.end_voice_call(session_id)

        return jsonify({
            'success': True,
            'webrtc_result': webrtc_result,
            'voice_result': voice_result
        })

    except Exception as e:
        logger.error(f"Voice end error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to end voice session'
        }), 500

# Twilio Webhook Endpoints
@app.route('/api/twilio/incoming', methods=['POST'])
def handle_twilio_incoming():
    """Handle incoming Twilio calls."""
    try:
        call_sid = request.form.get('CallSid')
        from_number = request.form.get('From')
        to_number = request.form.get('To')

        twiml_response = call_center.twilio_handler.handle_incoming_call(
            call_sid, from_number, to_number
        )

        return twiml_response, 200, {'Content-Type': 'text/xml'}

    except Exception as e:
        logger.error(f"Twilio incoming error: {str(e)}")
        error_twiml = call_center.twilio_handler.create_twiml_response(
            message="We're experiencing technical difficulties. Please try again later."
        )
        return error_twiml, 500, {'Content-Type': 'text/xml'}

@app.route('/api/twilio/process', methods=['POST'])
def handle_twilio_process():
    """Process voice input from Twilio calls."""
    try:
        call_sid = request.form.get('CallSid')
        recording_url = request.form.get('RecordingUrl')
        transcription = request.form.get('TranscriptionText')

        twiml_response = call_center.twilio_handler.process_voice_input(
            call_sid, recording_url, transcription
        )

        return twiml_response, 200, {'Content-Type': 'text/xml'}

    except Exception as e:
        logger.error(f"Twilio process error: {str(e)}")
        error_twiml = call_center.twilio_handler.create_twiml_response(
            message="I'm having trouble processing your request. Let me transfer you to a human agent."
        )
        return error_twiml, 500, {'Content-Type': 'text/xml'}

@app.route('/api/twilio/status', methods=['POST'])
def handle_twilio_status():
    """Handle call status updates from Twilio."""
    try:
        call_sid = request.form.get('CallSid')
        call_status = request.form.get('CallStatus')

        result = call_center.twilio_handler.handle_call_status(call_sid, call_status)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Twilio status error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/voice/calls/active', methods=['GET'])
def get_active_voice_calls():
    """Get status of active voice calls."""
    try:
        status = call_center.twilio_handler.get_active_calls_status()
        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'call_status': status
        })

    except Exception as e:
        logger.error(f"Active calls error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get active calls status'
        }), 500

# Enterprise Integration Endpoints
@app.route('/api/crm/customer', methods=['GET'])
async def get_customer_data():
    """Get customer data from CRM system."""
    try:
        identifier = request.args.get('identifier')
        identifier_type = request.args.get('type', 'phone')
        crm_system = request.args.get('system')

        if not identifier:
            return jsonify({'error': 'Customer identifier required'}), 400

        result = await call_center.crm_manager.get_customer_data(
            identifier, identifier_type, crm_system
        )

        return jsonify(result)

    except Exception as e:
        logger.error(f"CRM customer lookup error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve customer data'
        }), 500

# WebSocket proxy for real-time voice (speech-to-speech) events
@sock.route('/ws/voice/<session_id>')
def ws_voice(ws, session_id):
    """WebSocket endpoint to send/receive raw audio/text and proxy OpenAI events to the browser."""
    import asyncio
    import threading

    def run_async_handler():
        """Run the async WebSocket handler in a new event loop."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        async def handle_websocket():
            # Start a voice session if one doesn't exist
            handler = call_center.voice_handler.active_calls.get(session_id)
            if not handler:
                # Start a new voice call session
                result = await call_center.voice_handler.start_voice_call(session_id, 'triage')
                if not result.get('success'):
                    ws.send(json.dumps({"error": "Failed to start voice session"}))
                    return
                handler = call_center.voice_handler.active_calls.get(session_id)

            # Register this ws client for event proxy
            handler._gui_sockets.add(ws)

            try:
                while True:
                    msg = ws.receive()
                    if msg is None:
                        break
                    # Binary audio chunk from client
                    if isinstance(msg, (bytes, bytearray)):
                        await handler.send_audio_chunk(msg)
                        await handler.commit_audio_buffer()
                    else:
                        # Try parse as JSON control message
                        try:
                            data = json.loads(msg)
                            # e.g., text message
                            if data.get("type") == "text" and "text" in data:
                                await handler.send_text_message(data["text"])
                        except Exception:
                            # ignore invalid
                            pass
            finally:
                # Clean up websocket registration
                if handler:
                    handler._gui_sockets.discard(ws)

        try:
            loop.run_until_complete(handle_websocket())
        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}")
            try:
                ws.send(json.dumps({"error": str(e)}))
            except:
                pass
        finally:
            loop.close()

    # Create a thread to handle the async operations
    thread = threading.Thread(target=run_async_handler)
    thread.daemon = True
    thread.start()
    thread.join()

@app.route('/demo', methods=['GET'])
def gui_demo():
    """Render the speech-to-speech demo GUI."""
    return render_template('index.html')

@app.route('/chatbot', methods=['GET'])
def chatbot():
    """Render the chatbot interface."""
    return render_template('chatbot.html')
@app.route('/api/crm/case', methods=['POST'])
async def create_crm_case():
    """Create a new case in CRM system."""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        case_data = data.get('case_data', {})
        crm_system = data.get('system')

        if not customer_id:
            return jsonify({'error': 'Customer ID required'}), 400

        result = await call_center.crm_manager.create_case(
            customer_id, case_data, crm_system
        )

        return jsonify(result)

    except Exception as e:
        logger.error(f"CRM case creation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create case'
        }), 500

@app.route('/api/crm/interaction', methods=['POST'])
async def log_crm_interaction():
    """Log customer interaction in CRM."""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        interaction_data = data.get('interaction_data', {})
        crm_system = data.get('system')

        if not customer_id:
            return jsonify({'error': 'Customer ID required'}), 400

        result = await call_center.crm_manager.log_interaction(
            customer_id, interaction_data, crm_system
        )

        return jsonify(result)

    except Exception as e:
        logger.error(f"CRM interaction logging error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to log interaction'
        }), 500

@app.route('/api/knowledge/search', methods=['POST'])
async def search_knowledge():
    """Search the knowledge base."""
    try:
        data = request.get_json()
        query = data.get('query')
        doc_type = data.get('doc_type')

        if not query:
            return jsonify({'error': 'Search query required'}), 400

        result = await call_center.knowledge_base.search_knowledge(query, doc_type)

        return jsonify({
            'success': True,
            'result': result
        })

    except Exception as e:
        logger.error(f"Knowledge search error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to search knowledge base'
        }), 500

@app.route('/api/knowledge/add', methods=['POST'])
async def add_knowledge():
    """Add content to the knowledge base."""
    try:
        data = request.get_json()
        title = data.get('title')
        content = data.get('content')
        doc_type = data.get('doc_type', 'general')
        source = data.get('source', 'user')

        if not all([title, content]):
            return jsonify({'error': 'Title and content required'}), 400

        result = await call_center.knowledge_base.add_content(
            title, content, doc_type, source
        )

        return jsonify({
            'success': result,
            'message': 'Content added successfully' if result else 'Failed to add content'
        })

    except Exception as e:
        logger.error(f"Knowledge addition error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to add knowledge content'
        }), 500

@app.route('/api/knowledge/types', methods=['GET'])
def get_knowledge_types():
    """Get available knowledge content types."""
    try:
        types = call_center.knowledge_base.get_content_types()
        return jsonify({
            'success': True,
            'content_types': types
        })

    except Exception as e:
        logger.error(f"Knowledge types error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get content types'
        }), 500

@app.route('/api/tickets/create', methods=['POST'])
async def create_ticket():
    """Create a new support ticket."""
    try:
        data = request.get_json()
        ticket_data = data.get('ticket_data', {})
        system = data.get('system')

        result = await call_center.ticketing_manager.create_ticket(ticket_data, system)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Ticket creation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create ticket'
        }), 500

@app.route('/api/tickets/<ticket_id>', methods=['GET'])
async def get_ticket(ticket_id):
    """Get ticket details."""
    try:
        system = request.args.get('system')
        result = await call_center.ticketing_manager.get_ticket(ticket_id, system)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Ticket retrieval error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve ticket'
        }), 500

@app.route('/api/tickets/<ticket_id>/update', methods=['PUT'])
async def update_ticket(ticket_id):
    """Update a ticket."""
    try:
        data = request.get_json()
        updates = data.get('updates', {})
        system = data.get('system')

        result = await call_center.ticketing_manager.update_ticket(ticket_id, updates, system)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Ticket update error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update ticket'
        }), 500

@app.route('/api/tickets/<ticket_id>/comment', methods=['POST'])
async def add_ticket_comment(ticket_id):
    """Add comment to a ticket."""
    try:
        data = request.get_json()
        comment = data.get('comment')
        system = data.get('system')
        is_public = data.get('is_public', True)

        if not comment:
            return jsonify({'error': 'Comment text required'}), 400

        result = await call_center.ticketing_manager.add_comment(
            ticket_id, comment, system, is_public
        )

        return jsonify(result)

    except Exception as e:
        logger.error(f"Ticket comment error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to add comment'
        }), 500

@app.route('/api/tickets/<ticket_id>/close', methods=['POST'])
async def close_ticket(ticket_id):
    """Close a ticket."""
    try:
        data = request.get_json()
        resolution = data.get('resolution')
        system = data.get('system')

        result = await call_center.ticketing_manager.close_ticket(
            ticket_id, resolution, system
        )

        return jsonify(result)

    except Exception as e:
        logger.error(f"Ticket close error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to close ticket'
        }), 500

@app.route('/api/system/status', methods=['GET'])
def get_system_status():
    """Get comprehensive system status."""
    try:
        status = {
            'timestamp': datetime.now().isoformat(),
            'agents': {
                'available': list(call_center.agents.keys()),
                'total': len(call_center.agents)
            },
            'crm_systems': call_center.crm_manager.get_system_status(),
            'ticketing_systems': call_center.ticketing_manager.get_system_status(),
            'knowledge_base': call_center.knowledge_base.get_system_stats(),
            'voice_calls': call_center.twilio_handler.get_active_calls_status()
        }

        return jsonify({
            'success': True,
            'status': status
        })

    except Exception as e:
        logger.error(f"System status error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get system status'
        }), 500

# Speech-to-Speech Endpoints
@app.route('/api/speech/chat', methods=['POST'])
async def speech_to_speech_chat():
    """Handle speech-to-speech conversation using standard OpenAI APIs."""
    try:
        # Check if audio file is uploaded
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        session_id = request.form.get('session_id', str(uuid.uuid4()))
        agent_name = request.form.get('agent', 'triage')

        # Step 1: Convert speech to text
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )

        user_text = transcript.text
        logger.info(f"Speech-to-Text: {user_text}")

        # Step 2: Process with AI agent
        chat_result = await call_center.handle_conversation(
            session_id=session_id,
            user_input=user_text,
            phone_number=request.form.get('phone_number')
        )

        ai_response = chat_result.get('response', 'I apologize, I had trouble processing your request.')

        # Step 3: Convert AI response to speech
        speech_response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=ai_response
        )

        # Return the complete result
        return jsonify({
            'success': True,
            'session_id': session_id,
            'transcription': user_text,
            'ai_response_text': ai_response,
            'ai_response_audio_base64': base64.b64encode(speech_response.content).decode('utf-8'),
            'active_agent': chat_result.get('active_agent'),
            'confidence_score': chat_result.get('confidence_score'),
            'handoff_message': chat_result.get('handoff_message')
        })

    except Exception as e:
        logger.error(f"Speech-to-speech error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process speech conversation'
        }), 500

@app.route('/api/speech/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech."""
    try:
        logger.info("Text-to-speech request received")

        # Get request data
        data = request.get_json()
        if not data:
            logger.error("No JSON data received")
            return jsonify({'error': 'No JSON data provided'}), 400

        logger.info(f"Request data: {data}")

        text = data.get('text')
        # Usar vozes mais femininas e naturais como padrão
        voice = data.get('voice', 'nova')  # nova é mais feminina e natural que alloy

        if not text:
            logger.error("No text provided")
            return jsonify({'error': 'Text required'}), 400

        logger.info(f"Creating TTS for text: '{text}' with voice: '{voice}'")

        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        # Usar modelo HD para qualidade superior
        response = client.audio.speech.create(
            model="tts-1-hd",  # Modelo HD para voz mais natural
            voice=voice,
            input=text,
            speed=0.9  # Ligeiramente mais devagar para soar mais natural
        )

        logger.info(f"TTS response received, content length: {len(response.content)}")

        audio_base64 = base64.b64encode(response.content).decode('utf-8')
        logger.info(f"Base64 encoding complete, length: {len(audio_base64)}")

        return jsonify({
            'success': True,
            'audio_base64': audio_base64,
            'text': text,
            'voice': voice
        })

    except Exception as e:
        logger.error(f"Text-to-speech error: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': f'Failed to convert text to speech: {str(e)}'
        }), 500

@app.route('/api/speech/speech-to-text', methods=['POST'])
def speech_to_text():
    """Convert speech to text using OpenAI Whisper."""
    try:
        # Check if audio file is uploaded
        if 'audio' not in request.files:
            logger.error("No audio file in request")
            return jsonify({'error': 'No audio file provided', 'success': False}), 400

        audio_file = request.files['audio']

        if audio_file.filename == '':
            logger.error("Empty filename")
            return jsonify({'error': 'No audio file selected', 'success': False}), 400

        # Log audio file info
        logger.info(f"Processing audio file: {audio_file.filename}, "
                   f"Content-Type: {audio_file.mimetype}, "
                   f"Size: {len(audio_file.read())} bytes")

        # Create OpenAI client
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        # Reset file pointer and process
        audio_file.seek(0)
        audio_content = audio_file.read()

        if len(audio_content) == 0:
            logger.error("Audio file is empty")
            return jsonify({'error': 'Audio file is empty', 'success': False}), 400

        # Determine appropriate filename and mimetype
        filename = audio_file.filename or "recording.webm"
        mimetype = audio_file.mimetype or "audio/webm"

        # Convert speech to text using Whisper
        logger.info(f"Sending {len(audio_content)} bytes to Whisper API")
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=(filename, audio_content, mimetype),
            language="pt"  # Portuguese language hint
        )

        logger.info(f"Transcription successful: '{transcript.text}'")

        return jsonify({
            'success': True,
            'text': transcript.text
        })

    except Exception as e:
        logger.error(f"Speech-to-text error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to convert speech to text: {str(e)}'
        }), 500

@app.route('/api/speech/demo', methods=['GET'])
def speech_demo():
    """Create a demo speech file for testing."""
    try:
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        demo_text = "Hello! Welcome to our AI-powered call center. I'm your virtual assistant, ready to help you with any questions or concerns you may have. How can I assist you today?"

        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=demo_text
        )

        return response.content, 200, {
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': 'attachment; filename="demo.mp3"'
        }

    except Exception as e:
        logger.error(f"Demo speech error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create demo speech'
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Basic endpoint for testing."""
    return jsonify({
        'message': 'AI Call Center System - Enterprise Edition',
        'version': '3.0.0',
        'capabilities': [
            '6 Specialized AI Agents with GPT-5',
            'OpenAI Realtime API Voice Integration',
            'CRM Integration (Salesforce, ServiceNow)',
            'RAG Knowledge Base System',
            'Ticketing System Integration (Zendesk, Jira)',
            'Twilio Telephony Support',
            'WebRTC Voice Calls'
        ],
        'endpoints': {
            'chat': '/api/chat - POST - Send messages to AI agents',
            'voice': '/api/voice/* - Voice conversation endpoints',
            'crm': '/api/crm/* - CRM integration endpoints',
            'knowledge': '/api/knowledge/* - Knowledge base endpoints',
            'tickets': '/api/tickets/* - Ticketing system endpoints',
            'system': '/api/system/status - GET - Comprehensive system status',
            'agents': '/api/agents/performance - GET - Agent performance metrics'
        },
        'agents': list(call_center.agents.keys()),
        'integrations': {
            'crm_systems': call_center.crm_manager.get_available_systems(),
            'ticketing_systems': call_center.ticketing_manager.get_available_systems(),
            'knowledge_types': list(call_center.knowledge_base.get_content_types().keys())
        }
    })

async def initialize_on_startup():
    """Initialize the system components asynchronously."""
    await call_center.initialize_system()

# Health check endpoint para Cloud Run
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'environment': os.getenv('ENVIRONMENT', 'development')
    })

if __name__ == '__main__':
    # Check for OpenAI API key
    if not os.getenv('OPENAI_API_KEY'):
        logger.warning("OpenAI API key not found. Please set OPENAI_API_KEY environment variable.")

    # Initialize system components
    logger.info("Initializing knowledge base and enterprise systems...")
    try:
        asyncio.run(initialize_on_startup())
        logger.info("System initialization complete")
    except Exception as e:
        logger.error(f"System initialization failed: {str(e)}")

    # Run Flask app - configuração para desenvolvimento e produção
    debug_mode = os.getenv('ENVIRONMENT', 'development') != 'production'
    app.run(host='0.0.0.0', port=PORT, debug=debug_mode)
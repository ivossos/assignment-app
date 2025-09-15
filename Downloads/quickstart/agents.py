from openai import OpenAI
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import re
from ticket_workflow import TicketWorkflow

logger = logging.getLogger(__name__)

class AgentTool:
    """Base class for agent-specific tools and functions."""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    async def execute(self, context: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Execute the tool with given context and parameters."""
        raise NotImplementedError

class CustomerLookupTool(AgentTool):
    """Tool for looking up customer information."""

    def __init__(self, crm_manager=None):
        super().__init__("customer_lookup", "Look up customer account information")
        self.crm_manager = crm_manager

    async def execute(self, context: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        phone_number = context.get('phone_number') or kwargs.get('phone_number')
        account_id = kwargs.get('account_id')
        email = kwargs.get('email')

        # Try CRM lookup first if available
        if self.crm_manager:
            try:
                if phone_number:
                    result = await self.crm_manager.get_customer_data(phone_number, 'phone')
                elif email:
                    result = await self.crm_manager.get_customer_data(email, 'email')
                elif account_id:
                    result = await self.crm_manager.get_customer_data(account_id, 'id')
                else:
                    result = {'success': False, 'error': 'No identifier provided'}

                if result.get('success'):
                    return result
            except Exception as e:
                logger.error(f"CRM lookup failed: {str(e)}")

        # Fallback to simulated data
        if phone_number or account_id or email:
            return {
                'success': True,
                'customer_data': {
                    'account_id': account_id or 'ACC' + (phone_number[-6:] if phone_number else '123456'),
                    'name': 'John Customer',
                    'phone': phone_number or '+1234567890',
                    'email': email or 'customer@example.com',
                    'plan': 'Premium',
                    'account_status': 'Active',
                    'last_payment': '2024-01-15',
                    'outstanding_balance': 0.00
                }
            }
        return {'success': False, 'error': 'No customer identifier provided'}

class TechnicalDiagnosticTool(AgentTool):
    """Tool for technical diagnostics and troubleshooting."""

    def __init__(self):
        super().__init__("technical_diagnostic", "Perform technical diagnostics")

    async def execute(self, context: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        issue_type = kwargs.get('issue_type', 'general')
        symptoms = kwargs.get('symptoms', [])

        # Simulate diagnostic process
        diagnostics = {
            'connectivity': {
                'status': 'Good',
                'signal_strength': '85%',
                'suggested_actions': ['Check cable connections', 'Restart router']
            },
            'performance': {
                'status': 'Degraded',
                'bottleneck': 'Network congestion',
                'suggested_actions': ['Update firmware', 'Change WiFi channel']
            }
        }

        return {
            'success': True,
            'diagnostic_results': diagnostics.get(issue_type, diagnostics['connectivity']),
            'timestamp': datetime.now().isoformat()
        }

class BillingProcessorTool(AgentTool):
    """Tool for processing billing and payment operations."""

    def __init__(self):
        super().__init__("billing_processor", "Process billing operations")

    async def execute(self, context: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        operation = kwargs.get('operation', 'inquiry')
        amount = kwargs.get('amount', 0.0)

        operations = {
            'inquiry': {
                'current_balance': 45.99,
                'due_date': '2024-02-15',
                'last_payment': '2024-01-15',
                'payment_method': 'Credit Card (*1234)'
            },
            'payment': {
                'status': 'processed',
                'amount': amount,
                'confirmation_number': 'PAY' + str(datetime.now().timestamp())[:8],
                'new_balance': max(0, 45.99 - amount)
            },
            'refund': {
                'status': 'initiated',
                'amount': amount,
                'processing_time': '3-5 business days',
                'reference_number': 'REF' + str(datetime.now().timestamp())[:8]
            }
        }

        return {
            'success': True,
            'result': operations.get(operation, operations['inquiry'])
        }

class KnowledgeSearchTool(AgentTool):
    """Tool for searching the knowledge base."""

    def __init__(self, knowledge_base=None):
        super().__init__("knowledge_search", "Search knowledge base for information")
        self.knowledge_base = knowledge_base

    async def execute(self, context: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        query = kwargs.get('query') or context.get('last_user_input', '')
        doc_type = kwargs.get('doc_type')

        if not query:
            return {'success': False, 'error': 'No search query provided'}

        try:
            if self.knowledge_base:
                result = await self.knowledge_base.search_knowledge(query, doc_type)
                return {
                    'success': True,
                    'knowledge_result': result
                }
            else:
                return {
                    'success': False,
                    'error': 'Knowledge base not available'
                }
        except Exception as e:
            logger.error(f"Knowledge search error: {str(e)}")
            return {'success': False, 'error': str(e)}

class TicketCreationTool(AgentTool):
    """Tool for creating support tickets."""

    def __init__(self, ticketing_manager=None):
        super().__init__("ticket_creation", "Create support tickets")
        self.ticketing_manager = ticketing_manager

    async def execute(self, context: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        ticket_data = kwargs.get('ticket_data', {})
        system = kwargs.get('system')

        # Extract ticket data from context if not provided
        if not ticket_data:
            ticket_data = {
                'subject': context.get('issue_subject', 'Customer Inquiry'),
                'description': context.get('issue_description', 'Customer contacted support'),
                'priority': context.get('priority', 'normal'),
                'requester_email': context.get('customer_email', 'customer@example.com'),
                'requester_name': context.get('customer_name', 'Customer')
            }

        try:
            if self.ticketing_manager:
                result = await self.ticketing_manager.create_ticket(ticket_data, system)
                return result
            else:
                return {
                    'success': False,
                    'error': 'Ticketing system not available'
                }
        except Exception as e:
            logger.error(f"Ticket creation error: {str(e)}")
            return {'success': False, 'error': str(e)}

class TicketWorkflowTool(AgentTool):
    """Tool for handling the complete ticket workflow with CPF validation."""

    def __init__(self):
        super().__init__("ticket_workflow", "Handle complete ticket workflow with CPF validation")
        self.workflow = TicketWorkflow()

    async def execute(self, context: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Execute ticket workflow operations."""
        try:
            session_id = context.get('session_id', 'default')
            action = kwargs.get('action', 'start')

            if action == 'start' and 'cpf' in kwargs:
                return self.workflow.iniciar_fluxo(session_id, kwargs['cpf'])

            elif action == 'select_pedido' and 'pedido_id' in kwargs:
                return self.workflow.processar_selecao_pedido(session_id, kwargs['pedido_id'])

            elif action == 'continuity' and 'continuar' in kwargs:
                return self.workflow.processar_continuidade(session_id, kwargs['continuar'])

            elif action == 'contact_info':
                return self.workflow.processar_contato(
                    session_id,
                    kwargs.get('info_type'),
                    kwargs.get('value')
                )

            else:
                return {
                    'status': 'erro',
                    'message': 'Ação não reconhecida ou parâmetros faltando',
                    'next_action': 'request_cpf'
                }

        except Exception as e:
            logger.error(f"Error in ticket workflow: {str(e)}")
            return {
                'status': 'erro',
                'message': f'Erro interno: {str(e)}',
                'next_action': 'human_transfer'
            }

class SpecializedAgent:
    """Enhanced AI agent with specialized capabilities and tools."""

    def __init__(self, name: str, role: str, instructions: str, tools: List[AgentTool] = None,
                 handoff_triggers: List[str] = None):
        self.name = name
        self.role = role
        self.instructions = instructions
        self.tools = tools or []
        self.handoff_triggers = handoff_triggers or []
        self.client = OpenAI()
        self.performance_metrics = {
            'conversations_handled': 0,
            'successful_resolutions': 0,
            'handoffs_initiated': 0,
            'average_confidence': 0.0
        }

    async def process_message(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced message processing with tool integration."""
        try:
            # Update metrics
            self.performance_metrics['conversations_handled'] += 1

            # Identify if tools need to be used
            tool_usage = await self._identify_tool_usage(message, context)

            # Execute tools if needed
            tool_results = {}
            if tool_usage['tools_needed']:
                for tool_name in tool_usage['tools_needed']:
                    tool = next((t for t in self.tools if t.name == tool_name), None)
                    if tool:
                        tool_results[tool_name] = await tool.execute(context, **tool_usage.get('parameters', {}))

            # Build enhanced system prompt
            system_prompt = self._build_system_prompt(context, tool_results)

            # Generate response
            response = self.client.chat.completions.create(
                model="gpt-5",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                # temperature=0.7,  # GPT-5 doesn't support custom temperature values
                max_completion_tokens=600
            )

            agent_response = response.choices[0].message.content

            # Analyze response quality and handoff needs
            analysis = await self._analyze_response_quality(message, agent_response, context)

            # Update performance metrics
            if analysis['confidence'] > 0.8:
                self.performance_metrics['successful_resolutions'] += 1

            if analysis['handoff_needed']:
                self.performance_metrics['handoffs_initiated'] += 1

            return {
                'response': agent_response,
                'agent': self.name,
                'handoff_needed': analysis['handoff_needed'],
                'target_agent': analysis.get('target_agent'),
                'confidence': analysis['confidence'],
                'tool_results': tool_results,
                'reasoning': analysis.get('reasoning', '')
            }

        except Exception as e:
            logger.error(f"Error in {self.name}: {str(e)}")
            return {
                'response': "I apologize for the technical difficulty. Let me transfer you to a specialist for immediate assistance.",
                'agent': self.name,
                'handoff_needed': True,
                'target_agent': 'escalation',
                'confidence': 0.1,
                'error': str(e)
            }

    async def _identify_tool_usage(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Identify which tools should be used for the current message."""
        if not self.tools:
            return {'tools_needed': []}

        tool_analysis_prompt = f"""
        Analyze this customer message and determine which tools should be used.

        Available tools: {[tool.name for tool in self.tools]}
        Customer message: {message}
        Context: {json.dumps(context, indent=2)}

        Respond with JSON only:
        {{
            "tools_needed": ["tool1", "tool2"],
            "parameters": {{"param1": "value1"}},
            "reasoning": "explanation"
        }}
        """

        # Análise simplificada baseada em palavras-chave para evitar erros JSON
        tools_needed = []
        message_lower = message.lower()

        # Detecta necessidade de ferramenta de workflow de tickets
        ticket_keywords = ['pedido', 'entrega', 'rastreamento', 'cpf', 'transportadora', 'onde está', 'não chegou']
        if any(keyword in message_lower for keyword in ticket_keywords):
            tools_needed.append('ticket_workflow')

        # Detecta necessidade de busca de conhecimento
        knowledge_keywords = ['como', 'o que é', 'explicar', 'ajuda', 'informação']
        if any(keyword in message_lower for keyword in knowledge_keywords):
            tools_needed.append('knowledge_search')

        # Detecta necessidade de criação de ticket
        if 'problema' in message_lower or 'erro' in message_lower:
            tools_needed.append('ticket_creation')

        return {
            'tools_needed': tools_needed,
            'parameters': {},
            'reasoning': f"Detectou palavras-chave relevantes para: {tools_needed}"
        }

    def _build_system_prompt(self, context: Dict[str, Any], tool_results: Dict[str, Any]) -> str:
        """Build enhanced system prompt with context and tool results."""
        base_prompt = f"""
        You are {self.name}, a {self.role}.

        Core Instructions: {self.instructions}

        Current Context: {json.dumps(context, indent=2)}
        """

        if tool_results:
            base_prompt += f"\n\nTool Results: {json.dumps(tool_results, indent=2)}"

        base_prompt += """

        Diretrizes:
        - Seja profissional, empático e focado em soluções
        - Use os resultados das ferramentas para fornecer informações precisas e específicas
        - Mantenha-se dentro dos limites de especialização da sua função
        - Indique claramente quando é necessário transferir para outro agente
        - Mantenha a continuidade da conversa
        - Forneça próximos passos claros quando possível
        - SEMPRE responda em português brasileiro claro e natural
        """

        return base_prompt

    async def _analyze_response_quality(self, user_message: str, agent_response: str,
                                      context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze response quality and determine handoff needs."""
        analysis_prompt = f"""
        Analyze this conversation turn for quality and handoff requirements.

        Agent: {self.name} ({self.role})
        User message: {user_message}
        Agent response: {agent_response}
        Context: {json.dumps(context)}

        Handoff triggers for this agent: {self.handoff_triggers}

        Available target agents:
        - triage: General routing and simple inquiries
        - technical: Technical issues and troubleshooting
        - billing: Billing, payments, and account management
        - sales: Product information and purchases
        - escalation: Complex issues requiring senior support
        - quality: Quality assurance and compliance

        Evaluate:
        1. Response quality and confidence (0.0-1.0)
        2. Whether handoff is needed
        3. Best target agent if handoff needed
        4. Reasoning for decision

        Respond with JSON only:
        {{
            "confidence": 0.85,
            "handoff_needed": false,
            "target_agent": "agent_name",
            "reasoning": "explanation",
            "quality_score": 0.9
        }}
        """

        # Análise simplificada baseada em regras para evitar erros JSON
        handoff_needed = False
        target_agent = None
        confidence = 0.8  # Padrão alto

        # Verifica se é necessário transferir baseado em triggers
        user_message_lower = user_message.lower()
        agent_response_lower = agent_response.lower()

        for trigger in self.handoff_triggers:
            if trigger in user_message_lower or trigger in agent_response_lower:
                handoff_needed = True
                # Determina agente alvo baseado no trigger
                if 'technical' in trigger or 'problem' in trigger:
                    target_agent = 'technical'
                elif 'billing' in trigger or 'payment' in trigger:
                    target_agent = 'billing'
                elif 'product' in trigger or 'sales' in trigger:
                    target_agent = 'sales'
                elif 'escalation' in trigger or 'complex' in trigger:
                    target_agent = 'escalation'
                break

        # Ajusta confiança baseado na resposta
        if 'desculpe' in agent_response_lower or 'não sei' in agent_response_lower:
            confidence = 0.3
            handoff_needed = True
            target_agent = target_agent or 'escalation'

        # Atualiza métricas
        current_avg = self.performance_metrics['average_confidence']
        total_conversations = self.performance_metrics['conversations_handled']

        if total_conversations > 0:
            self.performance_metrics['average_confidence'] = (
                (current_avg * (total_conversations - 1) + confidence) / total_conversations
            )

        return {
            'confidence': confidence,
            'handoff_needed': handoff_needed,
            'target_agent': target_agent,
            'reasoning': f"Análise baseada em regras. Trigger encontrado: {handoff_needed}",
            'quality_score': confidence
        }

    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics for this agent."""
        return self.performance_metrics.copy()

class AgentFactory:
    """Factory class for creating specialized agents with their tools."""

    @staticmethod
    def create_triage_agent(crm_manager=None, knowledge_base=None, ticketing_manager=None) -> SpecializedAgent:
        """Create the triage agent with routing capabilities."""
        tools = [
            CustomerLookupTool(crm_manager),
            KnowledgeSearchTool(knowledge_base),
            TicketCreationTool(ticketing_manager),
            TicketWorkflowTool()
        ]
        handoff_triggers = [
            "technical problem", "billing issue", "payment", "product information",
            "complex issue", "complaint", "escalation"
        ]

        return SpecializedAgent(
            name="Agente de Triagem",
            role="Especialista em Triagem de Atendimento ao Cliente",
            instructions="""
            Você é o primeiro ponto de contato para todos os clientes. Sua função principal é:
            - Cumprimentar calorosamente os clientes e fazê-los se sentirem bem-vindos
            - Entender rapidamente suas necessidades através de escuta ativa
            - Coletar informações essenciais (detalhes da conta, informações de contato, resumo do problema)
            - Direcionar os clientes para o agente especialista mais apropriado
            - Lidar com consultas simples e gerais que não requerem conhecimento especializado
            - Fornecer informações básicas da empresa e políticas
            - Garantir que os clientes entendam os próximos passos em sua jornada

            FLUXO ESPECIAL DE TICKETS:
            Quando o cliente mencionar pedido, entrega, rastreamento, ou questões relacionadas a compras:
            1. Solicite o CPF do cliente
            2. Use a ferramenta ticket_workflow para iniciar o fluxo (action='start', cpf=CPF_INFORMADO)
            3. Siga as orientações retornadas pela ferramenta:
               - Se encontrar pedidos: ajude o cliente a selecionar o pedido relevante
               - Se não encontrar: peça para verificar o CPF ou ofereça alternativas
               - Continue o fluxo conforme as instruções da ferramenta

            RECONHECIMENTO DE PADRÕES PARA TICKET WORKFLOW:
            - "meu pedido", "rastreamento", "entrega", "transportadora"
            - "não chegou", "atraso", "previsão"
            - "código de rastreamento", "onde está"
            - CPF mencionado: 000.000.000-00 ou similar

            IMPORTANTE: Sempre responda em português brasileiro de forma amigável, eficiente e profissional, coletando o mínimo de informações necessárias para o direcionamento adequado.
            """,
            tools=tools,
            handoff_triggers=handoff_triggers
        )

    @staticmethod
    def create_technical_agent(crm_manager=None, knowledge_base=None, ticketing_manager=None) -> SpecializedAgent:
        """Create the technical support agent."""
        tools = [
            CustomerLookupTool(crm_manager),
            TechnicalDiagnosticTool(),
            KnowledgeSearchTool(knowledge_base),
            TicketCreationTool(ticketing_manager)
        ]
        handoff_triggers = [
            "billing question", "account change", "sales inquiry", "extremely complex technical issue"
        ]

        return SpecializedAgent(
            name="Technical Support Agent",
            role="Technical Support Specialist",
            instructions="""
            You are a technical support expert specializing in troubleshooting and problem resolution. Your role includes:
            - Systematically diagnose technical issues using proven methodologies
            - Provide clear, step-by-step solutions that customers can follow
            - Verify solutions work before ending interactions
            - Escalate complex technical issues that exceed your capabilities
            - Document technical resolutions for knowledge base improvement
            - Guide customers through technical processes with patience
            - Recommend preventive measures to avoid future issues

            Use technical diagnostics tools when appropriate and always confirm customer understanding.
            """,
            tools=tools,
            handoff_triggers=handoff_triggers
        )

    @staticmethod
    def create_billing_agent(crm_manager=None, knowledge_base=None, ticketing_manager=None) -> SpecializedAgent:
        """Create the billing and account management agent."""
        tools = [
            CustomerLookupTool(crm_manager),
            BillingProcessorTool(),
            KnowledgeSearchTool(knowledge_base),
            TicketCreationTool(ticketing_manager)
        ]
        handoff_triggers = [
            "technical issue", "product question", "complex dispute", "sales inquiry"
        ]

        return SpecializedAgent(
            name="Billing Agent",
            role="Billing and Account Management Specialist",
            instructions="""
            You handle all billing, payment, and account-related inquiries with expertise in:
            - Processing payment inquiries and resolving billing disputes
            - Explaining charges, fees, and billing statements clearly
            - Handling account modifications, upgrades, and downgrades
            - Processing refunds within company policy guidelines
            - Managing payment method updates and authorization issues
            - Ensuring compliance with financial regulations and security protocols
            - Providing payment arrangement options for customers in need

            Always verify customer identity before discussing account details and maintain strict confidentiality.
            """,
            tools=tools,
            handoff_triggers=handoff_triggers
        )

    @staticmethod
    def create_sales_agent(crm_manager=None, knowledge_base=None, ticketing_manager=None) -> SpecializedAgent:
        """Create the sales and information agent."""
        tools = [
            CustomerLookupTool(crm_manager),
            KnowledgeSearchTool(knowledge_base),
            TicketCreationTool(ticketing_manager)
        ]
        handoff_triggers = [
            "technical support needed", "billing issue", "complaint", "complex account change"
        ]

        return SpecializedAgent(
            name="Sales Agent",
            role="Sales and Information Specialist",
            instructions="""
            You provide comprehensive product information and sales support, focusing on:
            - Sharing detailed product features, benefits, and specifications
            - Assisting customers with purchase decisions through consultative selling
            - Processing orders, upgrades, and service additions
            - Providing accurate pricing information and available promotions
            - Identifying upselling and cross-selling opportunities naturally
            - Answering pre-sales questions and addressing concerns
            - Connecting product features to customer needs and use cases

            Maintain a helpful, consultative approach rather than pushy sales tactics.
            """,
            tools=tools,
            handoff_triggers=handoff_triggers
        )

    @staticmethod
    def create_escalation_agent(crm_manager=None, knowledge_base=None, ticketing_manager=None) -> SpecializedAgent:
        """Create the escalation and resolution specialist."""
        tools = [
            CustomerLookupTool(crm_manager),
            BillingProcessorTool(),
            TechnicalDiagnosticTool(),
            KnowledgeSearchTool(knowledge_base),
            TicketCreationTool(ticketing_manager)
        ]
        handoff_triggers = ["require human supervisor", "legal matter", "executive escalation"]

        return SpecializedAgent(
            name="Agente de Escalação",
            role="Especialista em Escalação e Resolução",
            instructions="""
            Você lida com questões complexas que requerem suporte avançado e expertise em resolução:
            - Gerenciar reclamações escaladas de clientes com empatia e foco em soluções
            - Coordenar com múltiplos departamentos para resolver questões complexas
            - Fornecer resolução abrangente de problemas com planos de acompanhamento
            - Lidar com situações sensíveis de clientes que requerem discrição
            - Garantir satisfação e retenção do cliente através de resolução eficaz
            - Documentar padrões de questões complexas para melhoria de processos
            - Autorizar acomodações especiais dentro das diretrizes de política
            - Fornecer comunicação de nível executivo quando apropriado

            IMPORTANTE: Você tem autoridade mais ampla para resolver questões e deve usá-la criteriosamente para garantir a satisfação do cliente. Sempre responda em português brasileiro claro e natural.
            """,
            tools=tools,
            handoff_triggers=handoff_triggers
        )

    @staticmethod
    def create_quality_monitor(crm_manager=None, knowledge_base=None, ticketing_manager=None) -> SpecializedAgent:
        """Create the quality assurance and monitoring agent."""
        tools = [
            KnowledgeSearchTool(knowledge_base),
            TicketCreationTool(ticketing_manager)
        ]
        handoff_triggers = ["direct customer service needed"]

        return SpecializedAgent(
            name="Quality Monitor",
            role="Quality Assurance and Compliance Monitor",
            instructions="""
            You monitor conversation quality and ensure compliance across all interactions:
            - Monitor ongoing conversations for adherence to quality standards
            - Ensure compliance with company policies and regulatory requirements
            - Flag potential issues for immediate attention
            - Provide real-time guidance to other agents when needed
            - Maintain conversation quality metrics and reporting
            - Identify training opportunities and process improvements
            - Ensure customer satisfaction standards are maintained
            - Monitor for compliance violations or security concerns

            You typically operate in the background but can interact directly when quality issues arise.
            """,
            tools=tools,
            handoff_triggers=handoff_triggers
        )

    @staticmethod
    def create_all_agents(crm_manager=None, knowledge_base=None, ticketing_manager=None) -> Dict[str, SpecializedAgent]:
        """Create all six specialized agents with enterprise integrations."""
        return {
            'triage': AgentFactory.create_triage_agent(crm_manager, knowledge_base, ticketing_manager),
            'technical': AgentFactory.create_technical_agent(crm_manager, knowledge_base, ticketing_manager),
            'billing': AgentFactory.create_billing_agent(crm_manager, knowledge_base, ticketing_manager),
            'sales': AgentFactory.create_sales_agent(crm_manager, knowledge_base, ticketing_manager),
            'escalation': AgentFactory.create_escalation_agent(crm_manager, knowledge_base, ticketing_manager),
            'quality': AgentFactory.create_quality_monitor(crm_manager, knowledge_base, ticketing_manager)
        }
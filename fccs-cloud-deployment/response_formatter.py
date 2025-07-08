"""
Response Formatter for FCCS AI System
Converts agent responses to HTML format with enhanced styling
"""
import re
import html
from typing import Dict, List, Optional
from datetime import datetime

class FCCSResponseFormatter:
    """Format AI agent responses to HTML with FCCS-specific styling"""
    
    def __init__(self):
        self.fccs_keywords = [
            'consolidation', 'fccs', 'oracle', 'intercompany', 'elimination',
            'fx rate', 'currency', 'materiality', 'sox', 'audit', 'close',
            'groovy', 'smartview', 'workflow', 'period', 'entity', 'account'
        ]
    
    def format_response(self, response: str, agent_name: str = None, context: Dict = None) -> str:
        """
        Convert plain text response to formatted HTML
        
        Args:
            response: Plain text response from agent
            agent_name: Name of the responding agent
            context: Additional context for formatting
            
        Returns:
            Formatted HTML string
        """
        if not response:
            return "<p class='error'>No response received</p>"
        
        # Clean up response for better quality
        cleaned_response = self._clean_response(response)
        
        # Apply formatting first, then escape only what needs escaping
        html_response = self._apply_formatting(cleaned_response)
        
        # Add agent-specific styling
        if agent_name:
            html_response = self._add_agent_context(html_response, agent_name)
        
        # Wrap in container
        html_response = self._wrap_response(html_response, agent_name, context)
        
        return html_response
    
    def _clean_response(self, response: str) -> str:
        """Clean and optimize response for better quality"""
        # Remove excessive disclaimers and warnings
        response = re.sub(r'This information is for general guidance only\..*?consult with qualified professionals.*?\.', '', response, flags=re.IGNORECASE | re.DOTALL)
        response = re.sub(r'Please note that this is general information.*?specific advice.*?\.', '', response, flags=re.IGNORECASE | re.DOTALL)
        response = re.sub(r'It\'s recommended to consult.*?implementation.*?\.', '', response, flags=re.IGNORECASE | re.DOTALL)
        response = re.sub(r'Always consult.*?professional.*?\.', '', response, flags=re.IGNORECASE | re.DOTALL)
        
        # Remove excessive filler phrases
        response = re.sub(r'I hope this helps!?\s*', '', response, flags=re.IGNORECASE)
        response = re.sub(r'Let me know if you need.*?assistance.*?\.?\s*', '', response, flags=re.IGNORECASE)
        response = re.sub(r'Feel free to ask.*?questions.*?\.?\s*', '', response, flags=re.IGNORECASE)
        
        # Remove redundant introductions for simple questions
        response = re.sub(r'^To answer your question about.*?,\s*', '', response, flags=re.IGNORECASE)
        response = re.sub(r'^Regarding your question.*?,\s*', '', response, flags=re.IGNORECASE)
        
        # Clean up excessive whitespace
        response = re.sub(r'\n{3,}', '\n\n', response)
        response = re.sub(r'\s{3,}', ' ', response)
        
        return response.strip()
    
    def _apply_formatting(self, text: str) -> str:
        """Apply various formatting rules to convert text to HTML"""
        
        # 1. First handle numbered headers specifically (before general bold formatting)
        text = re.sub(r'^\d+\.\s+\*\*([^*]+?)\*\*:?\s*$', r'<h4 class="fccs-subheader">\1</h4>', text, flags=re.MULTILINE)
        
        # 2. Handle standalone headers
        text = re.sub(r'^\*\*([^*]+?):\*\*\s*$', r'<h3 class="fccs-header">\1</h3>', text, flags=re.MULTILINE)
        
        # 3. Handle all caps headers
        text = re.sub(r'^([A-Z][A-Z\s]{2,}):?\s*$', r'<h3 class="fccs-header">\1</h3>', text, flags=re.MULTILINE)
        
        # 4. Convert numbered lists
        text = self._format_numbered_lists(text)
        
        # 5. Convert bullet points
        text = self._format_bullet_points(text)
        
        # 6. Convert remaining bold text (not headers)
        text = re.sub(r'\*\*([^*]+?)\*\*', r'<strong class="fccs-bold">\1</strong>', text)
        
        # 7. Convert code blocks
        text = self._format_code_blocks(text)
        
        # 8. Convert line breaks to paragraphs
        text = self._format_paragraphs(text)
        
        return text
    
    def _format_numbered_lists(self, text: str) -> str:
        """Convert numbered lists to HTML ordered lists"""
        # Pattern: 1. Item\n2. Item\n3. Item
        lines = text.split('\n')
        result = []
        in_list = False
        
        for line in lines:
            stripped = line.strip()
            if re.match(r'^\d+\.\s+', stripped):
                if not in_list:
                    result.append('<ol class="fccs-list">')
                    in_list = True
                item_text = re.sub(r'^\d+\.\s+', '', stripped).strip()
                if item_text:  # Only add non-empty list items
                    result.append(f'<li>{item_text}</li>')
            else:
                if in_list:
                    result.append('</ol>')
                    in_list = False
                # Only add non-empty lines
                if stripped:
                    result.append(line)
        
        if in_list:
            result.append('</ol>')
        
        return '\n'.join(result)
    
    def _format_bullet_points(self, text: str) -> str:
        """Convert bullet points to HTML unordered lists"""
        # Pattern: - Item\n- Item\n- Item or • Item
        lines = text.split('\n')
        result = []
        in_list = False
        
        for line in lines:
            stripped = line.strip()
            if re.match(r'^[-•*]\s+', stripped):
                if not in_list:
                    result.append('<ul class="fccs-list">')
                    in_list = True
                item_text = re.sub(r'^[-•*]\s+', '', stripped).strip()
                if item_text:  # Only add non-empty list items
                    result.append(f'<li>{item_text}</li>')
            else:
                if in_list:
                    result.append('</ul>')
                    in_list = False
                # Only add non-empty lines
                if stripped:
                    result.append(line)
        
        if in_list:
            result.append('</ul>')
        
        return '\n'.join(result)
    
    def _format_code_blocks(self, text: str) -> str:
        """Format code blocks and inline code"""
        # ```code block```
        text = re.sub(r'```(.*?)```', r'<pre class="fccs-code-block"><code>\1</code></pre>', text, flags=re.DOTALL)
        
        # `inline code`
        text = re.sub(r'`([^`]+)`', r'<code class="fccs-inline-code">\1</code>', text)
        
        return text
    
    def _format_paragraphs(self, text: str) -> str:
        """Convert line breaks to proper paragraphs while removing excessive whitespace"""
        # Remove excessive empty lines (more than 2 consecutive newlines)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Split by double line breaks for paragraphs
        paragraphs = re.split(r'\n\s*\n', text)
        formatted_paragraphs = []
        
        for para in paragraphs:
            para = para.strip()
            if para:
                # Don't wrap if already has HTML tags
                if not re.search(r'<(h[1-6]|ul|ol|pre|div)', para):
                    # Remove excessive spaces within lines
                    para = re.sub(r'\s+', ' ', para)
                    # Replace single line breaks with <br> within paragraphs, but avoid excessive breaks
                    para = re.sub(r'\n+', '<br>', para)
                    para = f'<p class="fccs-paragraph">{para}</p>'
                formatted_paragraphs.append(para)
        
        return ''.join(formatted_paragraphs)
    
    def _add_agent_context(self, html_response: str, agent_name: str) -> str:
        """Add agent-specific context and styling"""
        agent_info = self._get_agent_info(agent_name)
        
        if agent_info:
            agent_header = f"""
            <div class="agent-context">
                <div class="agent-badge {agent_info['category']}">{agent_info['icon']} {agent_info['name']}</div>
                <div class="agent-role">{agent_info['role']}</div>
            </div>
            """
            html_response = agent_header + html_response
        
        return html_response
    
    def _get_agent_info(self, agent_name: str) -> Optional[Dict]:
        """Get agent information for context"""
        agent_map = {
            'fccs_expert': {
                'name': 'FCCS Expert',
                'role': 'Oracle FCCS Specialist',
                'icon': '🏢',
                'category': 'core'
            },
            'orchestrator': {
                'name': 'Workflow Orchestrator',
                'role': 'Master Controller',
                'icon': '🎭',
                'category': 'orchestrator'
            },
            'groovy_validator': {
                'name': 'Groovy Validator',
                'role': 'Business Rules Expert',
                'icon': '🔧',
                'category': 'technical'
            },
            'smartview_designer': {
                'name': 'SmartView Designer',
                'role': 'Reporting Specialist',
                'icon': '📊',
                'category': 'reporting'
            },
            'sox_compliance': {
                'name': 'SOX Compliance',
                'role': 'Audit & Controls',
                'icon': '🛡️',
                'category': 'compliance'
            },
            'consolidation_validator': {
                'name': 'Consolidation Validator',
                'role': 'Data Quality Expert',
                'icon': '✅',
                'category': 'validation'
            },
            'document_intelligence': {
                'name': 'Document Intelligence',
                'role': 'Knowledge Extraction',
                'icon': '📋',
                'category': 'intelligence'
            },
            'pdf_converter': {
                'name': 'PDF Converter',
                'role': 'Document Processing',
                'icon': '📄',
                'category': 'utility'
            }
        }
        
        return agent_map.get(agent_name)
    
    def _wrap_response(self, html_response: str, agent_name: str = None, context: Dict = None) -> str:
        """Wrap response in container with metadata"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        metadata = ""
        if context:
            confidence = context.get('confidence', 0)
            confidence_class = 'high' if confidence > 0.7 else 'medium' if confidence > 0.4 else 'low'
            
            metadata = f"""
            <div class="response-metadata">
                <span class="timestamp">{timestamp}</span>
                <span class="confidence confidence-{confidence_class}">
                    Confidence: {confidence:.0%}
                </span>
            </div>
            """
        
        # Remove any disclaimer messages
        html_response = re.sub(r'This information is for general guidance only\. Please consult with qualified professionals for specific advice\.?\s*', '', html_response, flags=re.IGNORECASE)
        
        return f"""
        <div class="fccs-response-container">
            {metadata}
            <div class="fccs-response-content">
                {html_response}
            </div>
        </div>
        """

# Global formatter instance
fccs_formatter = FCCSResponseFormatter()
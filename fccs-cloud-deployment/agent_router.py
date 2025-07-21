"""
Intelligent Agent Router for CrewAI FCCS Project
Routes user queries to the most appropriate single agent based on intent analysis
"""
from crewai import Agent, Crew, Task
from typing import Dict, List, Tuple, Optional
import re
import os
try:
    from langchain_anthropic import ChatAnthropic
    anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
    if not anthropic_api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set")

    llm = ChatAnthropic(
        model="claude-sonnet-4-20250514",
        api_key=anthropic_api_key,
        temperature=0.3,  # Consistent across all agents
        max_tokens=800,   # Much shorter responses
        timeout=30  # Consistent timeout
    )
    print(f"✅ ChatAnthropic initialized with Claude Sonnet 4")
except ImportError as e:
    llm = None
    print(f"❌ Failed to import ChatAnthropic: {e}")
except Exception as e:
    llm = None
    print(f"❌ Failed to initialize Claude: {e}")
try:
    from pinecone_rag_system import PineconeRAGSystem as RAGSystem
    print("✅ Using PineconeRAGSystem for enhanced knowledge retrieval")
except ImportError:
    try:
        from rag_system import SimpleRAGSystem as RAGSystem
        print("⚠️ Using SimpleRAGSystem (fallback)")
    except ImportError:
        # Create OpenAI-powered RAG fallback system
        try:
            from openai import OpenAI

            class OpenAIRAGSystem:
                def __init__(self, openai_api_key=None):
                    self.openai_client = OpenAI(api_key=openai_api_key) if openai_api_key else None

                def retrieve_relevant_context(self, query, prioritize_uploads=False):
                    if not self.openai_client:
                        return [f"Context for: {query[:50]}..."]

                    try:
                        # Use OpenAI to generate contextual information
                        response = self.openai_client.chat.completions.create(
                            model="gpt-3.5-turbo",
                            messages=[
                                {"role": "system", "content": "You are an Oracle FCCS expert. Provide relevant context for the user's query."},
                                {"role": "user", "content": f"Provide relevant FCCS context for: {query}"}
                            ],
                            max_tokens=200,
                            temperature=0.1
                        )
                        return [response.choices[0].message.content]
                    except Exception as e:
                        print(f"OpenAI RAG fallback error: {e}")
                        return [f"FCCS context for: {query[:50]}..."]

            RAGSystem = OpenAIRAGSystem
            print("✅ Using OpenAI RAG System fallback")
        except ImportError:
            # Final minimal fallback
            class RAGSystem:
                def __init__(self, openai_api_key=None):
                    pass
                def retrieve_relevant_context(self, query, prioritize_uploads=False):
                    return [f"Context for: {query[:50]}..."]
            print("⚠️ Using minimal RAG system")

# Import Enhanced RL optimizer
try:
    from enhanced_rl_system import get_rl_optimizer, AgentInteraction
    RL_ENABLED = True
    print("✅ Enhanced RL System with Random Forest and Q-Learning available")
except ImportError:
    try:
        from rl_agent_optimizer import get_rl_optimizer, AgentInteraction
        RL_ENABLED = True
        print("✅ Fallback RL Agent Optimizer available")
    except ImportError:
        RL_ENABLED = False
        print("⚠️ No RL Agent Optimizer available")

import time
import uuid
from datetime import datetime

# Import enhanced orchestrator configuration
try:
    from orchestrator_config import orchestrator_config
    ORCHESTRATOR_ENHANCED = True
    print("✅ Enhanced Orchestrator Configuration loaded")
except ImportError:
    ORCHESTRATOR_ENHANCED = False
    print("⚠️ Enhanced Orchestrator Configuration not available")

class AgentRouter:
    """Routes user queries to the most appropriate agent based on intent analysis"""

    def __init__(self):
        # Initialize RAG system with OpenAI key (still needed for embeddings)
        openai_key = os.getenv('OPENAI_API_KEY')
        if openai_key:
            self.rag_system = RAGSystem(openai_api_key=openai_key)
        else:
            print("⚠️ OPENAI_API_KEY not set - RAG system may not work properly")
            self.rag_system = RAGSystem()
        self.agents = self._initialize_agents()
        self.routing_rules = self._define_routing_rules()

        # Initialize RL optimizer
        if RL_ENABLED:
            self.rl_optimizer = get_rl_optimizer()
        else:
            self.rl_optimizer = None

    def _initialize_agents(self) -> Dict[str, Agent]:
        """Initialize all available agents"""

        # Professional user context for all agents
        professional_context = """
        IMPORTANT: All system users are qualified financial professionals, senior consultants, and responsible technical experts. 
        They do not require disclaimers, warnings about consulting professionals, or basic cautionary statements.
        Provide direct, actionable, technical responses without legal disclaimers or suggestions to "consult with professionals."
        Focus on practical solutions and expert-level guidance.
        """

        return {
            'fccs_expert': Agent(
                role="Oracle FCCS Expert",
                goal="Provide precise technical answers to Oracle FCCS questions, using exclusively the content provided in the context.",
                backstory=f"Senior Oracle EPM Cloud consultant specialized in FCCS. Technical support for operational and functional questions. {professional_context}",
                verbose=True,
                allow_delegation=False,
                tools=[],
                llm=llm
            ),
            'pdf_converter': Agent(
                role="Technical PDF Converter for FCCS",
                goal="Extract useful technical content from PDF documents to feed the main FCCS agent knowledge base.",
                backstory=f"Processes Oracle FCCS manuals and technical guides, converting them into useful text for analysis. {professional_context}",
                allow_delegation=False,
                tools=[],
                llm=llm
            ),
            'groovy_validator': Agent(
                role="Groovy Rules Validator for FCCS",
                goal="Review and validate Groovy rules applied in Oracle FCCS, identifying errors and suggesting improvements.",
                backstory=f"Expert in Groovy applied to Oracle FCCS. Validates and optimizes consolidation scripts. {professional_context}",
                allow_delegation=False,
                tools=[],
                llm=llm
            ),
            'smartview_designer': Agent(
                role="Smart View Report Designer",
                goal="Design ideal FCCS report layouts for Smart View visualization based on user-defined criteria.",
                backstory=f"EPM Reporting specialist focused on Smart View for Oracle FCCS. {professional_context}",
                allow_delegation=False,
                tools=[],
                llm=llm
            ),
            'consolidation_validator': Agent(
                role="FCCS Consolidation Error Detector",
                goal="Detect, analyze, and provide solutions for consolidation errors in Oracle FCCS, including elimination posting errors, intercompany mismatches, and account mapping issues.",
                backstory=f"Expert in FCCS consolidation processes with deep knowledge of elimination rules, intercompany transactions, and financial data validation. Specializes in identifying posting errors and suggesting corrective actions. {professional_context}",
                allow_delegation=False,
                tools=[],
                llm=llm
            ),
            'document_intelligence': Agent(
                role="Document Intelligence Specialist",
                goal="Analyze uploaded PDF documents to extract specific company procedures, dates, and organizational details. Provide precise answers based on document content rather than general best practices.",
                backstory=f"Expert in document analysis and information extraction. Specializes in finding specific company information, procedural details, dates, and workflows from uploaded organizational documents. Focuses on providing document-sourced answers rather than generic guidance. {professional_context}",
                allow_delegation=False,
                tools=[],
                llm=llm
            ),
            'sox_compliance': Agent(
                role="SOX Compliance & Internal Controls Specialist",
                goal="Provide expert guidance on SOX compliance requirements, internal controls design, audit preparation, and regulatory compliance for FCCS environments. Ensure financial reporting controls meet SOX standards.",
                backstory=f"Senior SOX compliance expert with deep knowledge of Sarbanes-Oxley requirements, internal controls frameworks (COSO), audit procedures, and financial reporting controls. Specializes in FCCS-specific SOX controls, segregation of duties, access controls, and evidence documentation for external audits. {professional_context}",
                allow_delegation=False,
                tools=[],
                llm=llm
            ),
            'orchestrator': Agent(
                role="FCCS Workflow Orchestrator & Master Controller",
                goal="Coordinate complex multi-agent FCCS workflows and manage end-to-end consolidation processes with intelligent workflow orchestration",
                backstory=f"Senior FCCS process manager with expertise in orchestrating complex financial close operations. Specializes in workflow automation, decision making, and coordinating multiple teams for monthly, quarterly, and year-end close processes. Expert in SOX compliance coordination, deadline management, and escalation procedures. {professional_context}",
                allow_delegation=True,
                tools=[],
                llm=llm
            )
        }

    def _define_routing_rules(self) -> Dict[str, Dict]:
        """Define routing rules based on keywords and patterns"""
        return {
            'fccs_expert': {
                'keywords': [
                    'consolidação', 'consolidation', 'fccs', 'close', 'fechamento',
                    'eliminação', 'elimination', 'intercompany', 'entity',
                    'scenario', 'período', 'period', 'workflow', 'processo',
                    'dimensão', 'dimension', 'como fazer', 'how to', 'dúvida',
                    'problema', 'error', 'erro', 'configuração', 'setup'
                ],
                'patterns': [
                    r'como\s+.*fccs',
                    r'o\s+que\s+é',
                    r'para\s+que\s+serve',
                    r'onde\s+.*encontrar',
                    r'erro\s+.*fccs',
                    r'problema\s+com'
                ],
                'priority': 1
            },
            'groovy_validator': {
                'keywords': [
                    'groovy', 'script', 'regra', 'rule', 'business rule',
                    'código', 'code', 'syntax', 'erro de sintaxe', 'validar',
                    'validate', 'revisar', 'review', 'calculation', 'cálculo',
                    'formula', 'fórmula', 'function', 'função'
                ],
                'patterns': [
                    r'groovy.*erro',
                    r'validar.*groovy',
                    r'revisar.*script',
                    r'business\s+rule.*erro',
                    r'código.*fccs',
                    r'fix.*groovy'
                ],
                'priority': 2
            },
            'smartview_designer': {
                'keywords': [
                    'smart view', 'smartview', 'relatório', 'report', 'reporting',
                    'layout', 'design', 'visualização', 'visualization',
                    'dashboard', 'tabela', 'table', 'gráfico', 'chart',
                    'formato', 'format', 'excel', 'export'
                ],
                'patterns': [
                    r'smart\s+view.*layout',
                    r'relatório.*fccs',
                    r'criar.*relatório',
                    r'design.*report',
                    r'formato.*smart\s+view'
                ],
                'priority': 3
            },
            'pdf_converter': {
                'keywords': [
                    'pdf', 'documento', 'document', 'manual', 'guide',
                    'guia', 'extrair', 'extract', 'converter', 'convert',
                    'processar', 'process', 'arquivo', 'file'
                ],
                'patterns': [
                    r'pdf.*fccs',
                    r'extrair.*pdf',
                    r'converter.*documento',
                    r'processar.*manual'
                ],
                'priority': 4
            },
            'consolidation_validator': {
                'keywords': [
                    'error', 'erro', 'posting', 'elimination', 'eliminação',
                    'equity pickup', 'intercompany', 'consolidation', 'consolidação',
                    'wrong account', 'conta errada', 'mismatch', 'divergência',
                    'validate', 'validar', 'detect', 'detectar', 'check',
                    'revenue instead', 'investment', 'balance', 'saldo'
                ],
                'patterns': [
                    r'elimination.*posting.*wrong',
                    r'equity.*pickup.*revenue',
                    r'intercompany.*mismatch',
                    r'consolidation.*error',
                    r'posting.*wrong.*account',
                    r'detect.*error',
                    r'validate.*consolidation',
                    r'wrong.*account.*elimination'
                ],
                'priority': 1
            },
            'document_intelligence': {
                'keywords': [
                    'target date', 'data alvo', 'deadline', 'prazo', 'schedule', 'cronograma',
                    'procedure', 'procedimento', 'company', 'empresa',
                    'organization', 'organização', 'specific', 'específico', 'according to',
                    'conforme', 'wiseclose', 'closewise', 'at wiseclose', 'na wiseclose', 
                    'our company', 'nossa empresa', 'our organization', 'nossa organização', 
                    'company specific', 'document says', 'documento diz', 'uploaded', 'carregado', 
                    'based on', 'baseado em', 'by which date', 'what date', 'when must'
                ],
                'patterns': [
                    r'wiseclose.*date',
                    r'closewise.*date',
                    r'by\s+which\s+date.*wiseclose',
                    r'target\s+date.*at\s+\w+',
                    r'deadline.*at\s+\w+',
                    r'when.*\w+.*complete',
                    r'schedule.*at\s+\w+',
                    r'procedure.*at\s+\w+',
                    r'according\s+to.*document',
                    r'based\s+on.*uploaded',
                    r'company.*specific.*date',
                    r'organization.*specific'
                ],
                'priority': 1
            },
            'sox_compliance': {
                'keywords': [
                    'sox', 'sarbanes oxley', 'sarbanes-oxley', 'compliance', 'conformidade',
                    'internal control', 'controle interno', 'audit', 'auditoria', 'pcaob',
                    'control deficiency', 'deficiência', 'material weakness', 'fraqueza material',
                    'significant deficiency', 'coso', 'itgc', 'application control',
                    'segregation of duties', 'segregação', 'access control', 'controle acesso',
                    'evidence', 'evidência', 'documentation', 'documentação', 'testing',
                    'teste', 'walkthrough', 'monitoring', 'monitoramento', 'remediation',
                    'remediação', 'control activities', 'atividades controle', 'risk assessment',
                    'avaliação risco', 'control environment', 'ambiente controle', 'entity level',
                    'fraud', 'fraude', 'authorization', 'autorização', 'approval', 'aprovação'
                ],
                'patterns': [
                    r'sox.*control',
                    r'sarbanes.*oxley',
                    r'internal.*control.*\w+',
                    r'audit.*requirement',
                    r'control.*deficiency',
                    r'material.*weakness',
                    r'significant.*deficiency',
                    r'segregation.*duties',
                    r'access.*control.*fccs',
                    r'control.*testing',
                    r'evidence.*audit',
                    r'documentation.*control',
                    r'compliance.*requirement',
                    r'regulatory.*audit',
                    r'control.*framework'
                ],
                'priority': 1
            },
            'orchestrator': {
                'keywords': [
                    'workflow', 'process', 'end-to-end', 'complete', 'full', 'comprehensive',
                    'month-end', 'quarter-end', 'year-end', 'close process', 'prepare',
                    'coordinate', 'manage', 'orchestrate', 'multiple', 'all agents',
                    'entire process', 'full consolidation', 'complete close', 'step by step',
                    'beginning to end', 'start to finish', 'overall', 'holistic'
                ],
                'patterns': [
                    r'month.*end.*close',
                    r'quarter.*end.*close',
                    r'year.*end.*close',
                    r'prepare.*close',
                    r'complete.*consolidation',
                    r'entire.*process',
                    r'full.*workflow',
                    r'end.*to.*end',
                    r'coordinate.*agents',
                    r'manage.*process',
                    r'orchestrate.*workflow',
                    r'step.*by.*step.*process'
                ],
                'priority': 1
            },
            'orchestrator_agent': {
                'keywords': [
                    'master control', 'controle mestre', 'workflow master', 'coordinate all',
                    'complex workflow', 'multiple processes', 'advanced orchestration',
                    'full automation', 'complete automation', 'enterprise workflow'
                ],
                'patterns': [
                    r'master.*control',
                    r'complex.*workflow',
                    r'advanced.*orchestration',
                    r'full.*automation',
                    r'enterprise.*workflow'
                ],
                'priority': 1
            },
            'data_integration_agent': {
                'keywords': [
                    'data integration', 'integração dados', 'erp integration', 'source data',
                    'data loader', 'extract data', 'extrair dados', 'integration', 'integração',
                    'source system', 'sistema origem', 'load data', 'carregar dados',
                    'data mapping', 'mapeamento dados', 'etl', 'data pipeline'
                ],
                'patterns': [
                    r'data.*integration',
                    r'erp.*integration',
                    r'source.*data.*load',
                    r'extract.*data.*fccs',
                    r'integration.*erp',
                    r'load.*data.*source'
                ],
                'priority': 2
            },
            'data_load_agent': {
                'keywords': [
                    'trial balance', 'balancete', 'data load', 'carregar dados', 'load trial',
                    'balance load', 'tb load', 'trial balance load', 'data loading',
                    'carregamento dados', 'load process', 'processo carga'
                ],
                'patterns': [
                    r'trial.*balance.*load',
                    r'load.*trial.*balance',
                    r'tb.*load',
                    r'balance.*load',
                    r'data.*load.*process',
                    r'load.*data.*fccs'
                ],
                'priority': 2
            },
            'data_validation_agent': {
                'keywords': [
                    'data validation', 'validação dados', 'data completeness', 'completude dados',
                    'data integrity', 'integridade dados', 'validate data', 'validar dados',
                    'data quality', 'qualidade dados', 'completeness check', 'data check'
                ],
                'patterns': [
                    r'data.*validation',
                    r'validate.*data',
                    r'data.*completeness',
                    r'data.*integrity',
                    r'data.*quality',
                    r'completeness.*check'
                ],
                'priority': 2
            },
            'fx_rate_agent': {
                'keywords': [
                    'fx rate', 'taxa câmbio', 'currency', 'moeda', 'exchange rate',
                    'taxa câmbio', 'currency translation', 'tradução moeda', 'foreign exchange',
                    'câmbio', 'translation', 'tradução', 'currency conversion', 'conversão moeda'
                ],
                'patterns': [
                    r'fx.*rate',
                    r'currency.*translation',
                    r'exchange.*rate',
                    r'foreign.*exchange',
                    r'currency.*conversion',
                    r'translation.*currency'
                ],
                'priority': 2
            },
            'intercompany_recon_agent': {
                'keywords': [
                    'intercompany reconciliation', 'reconciliação intercompany', 'ic recon',
                    'intercompany recon', 'reconciliation', 'reconciliação', 'ic reconciliation',
                    'intercompany matching', 'match intercompany', 'ic matching'
                ],
                'patterns': [
                    r'intercompany.*reconciliation',
                    r'ic.*recon',
                    r'intercompany.*recon',
                    r'reconciliation.*intercompany',
                    r'intercompany.*matching',
                    r'ic.*matching'
                ],
                'priority': 2
            },
            'intercompany_elimination_agent': {
                'keywords': [
                    'intercompany elimination', 'eliminação intercompany', 'ic elimination',
                    'elimination', 'eliminação', 'intercompany entries', 'lançamentos intercompany',
                    'elimination entries', 'lançamentos eliminação', 'ic entries'
                ],
                'patterns': [
                    r'intercompany.*elimination',
                    r'ic.*elimination',
                    r'elimination.*intercompany',
                    r'intercompany.*entries',
                    r'elimination.*entries',
                    r'ic.*entries'
                ],
                'priority': 2
            },
            'journal_monitoring_agent': {
                'keywords': [
                    'journal workflow', 'workflow journal', 'journal monitoring', 'monitor journal',
                    'journal approval', 'aprovação journal', 'journal entry workflow',
                    'workflow lançamento', 'journal process', 'processo journal'
                ],
                'patterns': [
                    r'journal.*workflow',
                    r'workflow.*journal',
                    r'journal.*monitoring',
                    r'monitor.*journal',
                    r'journal.*approval',
                    r'journal.*process'
                ],
                'priority': 2
            },
            'variance_analysis_agent': {
                'keywords': [
                    'variance analysis', 'análise variação', 'variance', 'variação',
                    'trend analysis', 'análise tendência', 'financial analysis', 'análise financeira',
                    'performance analysis', 'análise desempenho', 'variance report'
                ],
                'patterns': [
                    r'variance.*analysis',
                    r'analysis.*variance',
                    r'trend.*analysis',
                    r'financial.*analysis',
                    r'performance.*analysis',
                    r'variance.*report'
                ],
                'priority': 2
            },
            'sox_compliance_agent': {
                'keywords': [
                    'sox control', 'controle sox', 'sox validation', 'validação sox',
                    'control validation', 'validação controle', 'sox compliance',
                    'conformidade sox', 'internal control validation', 'sox audit'
                ],
                'patterns': [
                    r'sox.*control',
                    r'sox.*validation',
                    r'control.*validation',
                    r'sox.*compliance',
                    r'sox.*audit',
                    r'internal.*control.*validation'
                ],
                'priority': 2
            },
            'audit_trail_agent': {
                'keywords': [
                    'audit trail', 'trilha auditoria', 'audit documentation', 'documentação auditoria',
                    'audit report', 'relatório auditoria', 'trail extraction', 'extração trilha',
                    'audit evidence', 'evidência auditoria', 'audit log'
                ],
                'patterns': [
                    r'audit.*trail',
                    r'audit.*documentation',
                    r'audit.*report',
                    r'trail.*extraction',
                    r'audit.*evidence',
                    r'audit.*log'
                ],
                'priority': 2
            }
        }

    def analyze_intent(self, query: str) -> Tuple[str, float]:
        """Analyze user query and determine the best agent with orchestrator bypass option"""
        query_lower = query.lower()

        # Check for orchestrator bypass keywords (garbled input, simple technical queries)
        bypass_patterns = [
            r'[a-z]{20,}',  # Long strings of repeated characters
            r'[;]{3,}',      # Multiple semicolons
            r'[i]{10,}',     # Long repeated characters
            r'^[a-z]{1,3}\s*$',  # Very short queries
            r'[-]{3,}',      # Multiple dashes
            r'[a-z]+\s+r[-]+',  # Patterns like "sdeau r-------"
            r'[^\w\s]{3,}',  # Multiple special characters
            r'\w+\s*[-]{2,}\w+',  # Words with dashes
            r'[a-z]+\s+[a-z][-]+[a-z]+',  # Garbled text patterns
        ]

        for pattern in bypass_patterns:
            if re.search(pattern, query_lower):
                # Bypass orchestrator for garbled/simple inputs
                return self._direct_agent_routing(query_lower)

        # For normal queries, use orchestrator-first approach
        return 'orchestrator', 0.95

    def _direct_agent_routing(self, query_lower: str) -> Tuple[str, float]:
        """Direct routing bypassing orchestrator for simple/garbled queries"""
        scores = {}

        for agent_name, rules in self.routing_rules.items():
            if agent_name == 'orchestrator':  # Skip orchestrator
                continue

            score = 0

            # Check keywords
            for keyword in rules['keywords']:
                if keyword in query_lower:
                    score += 1

            # Check patterns
            for pattern in rules['patterns']:
                if re.search(pattern, query_lower):
                    score += 2  # Patterns get higher weight

            # Apply priority weighting (lower priority number = higher weight)
            priority_weight = 1 / rules['priority']
            scores[agent_name] = score * priority_weight

        # Find the agent with highest score
        if not scores or max(scores.values()) == 0:
            # Default to fccs_expert if no clear match
            return 'fccs_expert', 0.5

        best_agent = max(scores, key=scores.get)
        confidence = min(scores[best_agent] / sum(scores.values()), 1.0)

        return best_agent, confidence

    def detect_language(self, query: str) -> str:
        """Detect if query is in Portuguese or English"""
        portuguese_indicators = [
            'como', 'fazer', 'onde', 'quando', 'porque', 'qual', 'quais', 'para', 'com', 'sem',
            'consolidação', 'relatório', 'regra', 'erro', 'problema', 'configuração', 'validar',
            'criar', 'gerar', 'extrair', 'processar', 'analisar', 'revisar', 'desenhar'
        ]

        query_lower = query.lower()
        portuguese_count = sum(1 for word in portuguese_indicators if word in query_lower)

        # If 2 or more Portuguese indicators, assume Portuguese
        return 'pt' if portuguese_count >= 2 else 'en'

    def route_query(self, query: str, context: str = "") -> Dict:
        """Route query to appropriate agent and execute"""
        start_time = time.time()
        session_id = str(uuid.uuid4())

        # Get traditional confidence scores for all agents
        traditional_scores = {}
        for agent_name in self.agents.keys():
            if agent_name == 'orchestrator':
                traditional_scores[agent_name] = 0.95  # Default orchestrator confidence
            else:
                score = self._calculate_agent_confidence(query, agent_name)
                traditional_scores[agent_name] = score

        # Use RL optimizer if available
        if self.rl_optimizer:
            selected_agent, confidence = self.rl_optimizer.get_optimized_agent_recommendation(
                query, traditional_scores
            )
        else:
            # Fallback to traditional routing
            selected_agent, confidence = self.analyze_intent(query)

        # Detect language
        language = self.detect_language(query)

        # Get relevant context from RAG system
        prioritize_uploads = selected_agent == 'document_intelligence'
        rag_context = self.rag_system.retrieve_relevant_context(query, prioritize_uploads=prioritize_uploads)

        # Create task for selected agent
        task = self._create_task_for_agent(selected_agent, query, context, rag_context, language)

        # Create crew with only the selected agent
        crew = Crew(
            agents=[self.agents[selected_agent]],
            tasks=[task],
            verbose=True,
            memory=False,
            process="sequential"
        )

        # Execute and return result
        try:
            result = crew.kickoff()
            response_time = time.time() - start_time

            # Record interaction for RL training
            if self.rl_optimizer:
                complexity = self._assess_query_complexity(query)
                interaction = AgentInteraction(
                    session_id=session_id,
                    query=query,
                    selected_agent=selected_agent,
                    confidence=confidence,
                    user_rating=None,  # Will be updated via feedback
                    response_time=response_time,
                    rag_context_used=len(rag_context) > 0,
                    timestamp=datetime.now(),
                    query_complexity=complexity,
                    user_satisfaction=None,
                    task_completion=None
                )
                self.rl_optimizer.record_interaction(interaction)

            return {
                'success': True,
                'result': str(result),
                'selected_agent': selected_agent,
                'confidence': confidence,
                'rag_context_used': len(rag_context) > 0,
                'session_id': session_id,
                'response_time': response_time
            }
        except Exception as e:
            response_time = time.time() - start_time

            # Record failed interaction
            if self.rl_optimizer:
                complexity = self._assess_query_complexity(query)
                interaction = AgentInteraction(
                    session_id=session_id,
                    query=query,
                    selected_agent=selected_agent,
                    confidence=confidence,
                    user_rating=1.0,  # Low rating for failures
                    response_time=response_time,
                    rag_context_used=len(rag_context) > 0,
                    timestamp=datetime.now(),
                    query_complexity=complexity,
                    user_satisfaction=1.0,
                    task_completion=False
                )
                self.rl_optimizer.record_interaction(interaction)

            return {
                'success': False,
                'error': str(e),
                'selected_agent': selected_agent,
                'confidence': confidence,
                'session_id': session_id,
                'response_time': response_time
            }

    def _calculate_agent_confidence(self, query: str, agent_name: str) -> float:
        """Calculate confidence score for specific agent based on routing rules"""
        if agent_name not in self.routing_rules:
            return 0.1

        rules = self.routing_rules[agent_name]
        query_lower = query.lower()
        score = 0

        # Check keywords
        for keyword in rules['keywords']:
            if keyword in query_lower:
                score += 1

        # Check patterns
        for pattern in rules['patterns']:
            if re.search(pattern, query_lower):
                score += 2

        # Apply priority weighting
        priority_weight = 1 / rules['priority']
        return min(1.0, (score * priority_weight) / 10)

    def _assess_query_complexity(self, query: str) -> str:
        """Assess query complexity for RL training"""
        query_lower = query.lower()
        word_count = len(query.split())

        # Complex indicators
        complex_indicators = [
            'workflow', 'process', 'end-to-end', 'complete', 'comprehensive',
            'multiple', 'coordinate', 'orchestrate', 'step by step'
        ]

        # Moderate indicators
        moderate_indicators = [
            'how to', 'explain', 'implement', 'configure', 'setup',
            'troubleshoot', 'optimize', 'validate'
        ]

        complex_count = sum(1 for indicator in complex_indicators if indicator in query_lower)
        moderate_count = sum(1 for indicator in moderate_indicators if indicator in query_lower)

        if word_count > 20 or complex_count >= 2:
            return 'complex'
        elif word_count > 10 or moderate_count >= 1 or complex_count >= 1:
            return 'moderate'
        else:
            return 'simple'

    def _create_task_for_agent(self, agent_name: str, query: str, context: str, rag_context: List[str], language: str = 'en') -> Task:
        """Create appropriate task based on agent type"""

        # Enhance context with RAG information
        enhanced_context = context
        if rag_context:
            rag_context_str = "\n".join([f"- {item}" for item in rag_context])
            enhanced_context = f"{context}\n\nRELEVANT KNOWLEDGE BASE:\n{rag_context_str}"

        # Define language-specific prompts
        if language == 'pt':
            language_instruction = "Responda em português brasileiro com linguagem técnica e detalhada."
            lang_suffix = "em português brasileiro"
        else:
            language_instruction = "Respond in English with technical and detailed language."
            lang_suffix = "in English"

        task_configs = {
            'fccs_expert': {
                'description': f"""
                You are an Oracle FCCS expert focused on giving EXACTLY what the user needs.

                CRITICAL INSTRUCTIONS:
                - For CONFIGURATION questions: Give navigation steps and settings only
                - For SCRIPTING questions: Provide code only when specifically requested
                - Keep responses under 3 sentences for simple questions
                - Never provide scripts unless explicitly asked for code/script/groovy
                - Ask for clarification if unsure whether they want configuration steps or code

                QUESTION TYPE DETECTION:
                - "How do I set up..." = Configuration (give menu steps)
                - "Where do I find..." = Configuration (give navigation)
                - "What settings..." = Configuration (list settings)
                - "Create a script..." = Scripting (provide code)
                - "Write groovy..." = Scripting (provide code)

                User Question: {query}

                Enhanced Context: {enhanced_context}

                Respond with EXACTLY what they need - configuration steps OR code - not both {lang_suffix}
                """,
                'expected_output': f"Precise, concise answer matching the question type (configuration steps OR code) {lang_suffix}"
            },
            'groovy_validator': {
                'description': f"""
                Analyze and validate the following Groovy code/rule for FCCS:

                CODE/RULE: {query}

                CONTEXT: {enhanced_context}

                {language_instruction}
                Check for syntax errors, logic issues, and performance problems.
                Suggest specific improvements and best practices.
                """,
                'expected_output': f"Technical validation with improvement suggestions {lang_suffix}"
            },
            'smartview_designer': {
                'description': f"""
                Design a Smart View report layout for FCCS based on the following requirements:

                REQUIREMENTS: {query}

                CONTEXT: {enhanced_context}

                {language_instruction}
                Include POV setup, dimensions, member selections, and formatting recommendations.
                """,
                'expected_output': f"Smart View report model with detailed layout {lang_suffix}"
            },
            'pdf_converter': {
                'description': f"""
                Extract and process technical content from the provided document:

                DOCUMENT: {query}

                CONTEXT: {enhanced_context}

                {language_instruction}
                Focus on technical FCCS information, procedures, and configuration details.
                """,
                'expected_output': f"Extracted and processed technical content {lang_suffix}"
            },
            'consolidation_validator': {
                'description': f"""
                Analyze and detect consolidation errors in Oracle FCCS:

                ISSUE/QUERY: {query}

                CONTEXT: {enhanced_context}

                {language_instruction}

                Perform the following analysis:
                1. Identify the type of consolidation error (elimination posting, intercompany mismatch, account mapping, etc.)
                2. Explain the root cause of the error
                3. Assess the impact on financial statements
                4. Provide step-by-step correction procedures
                5. Suggest preventive measures for future occurrences
                6. Include relevant Groovy rules or Data Management corrections if applicable

                Focus on practical, actionable solutions for FCCS consolidation issues.
                """,
                'expected_output': f"Comprehensive consolidation error analysis with correction steps {lang_suffix}"
            },
            'document_intelligence': {
                'description': f"""
                Analyze uploaded documents to extract specific company information and answer the question:

                QUESTION: {query}

                CONTEXT: {enhanced_context}

                {language_instruction}

                Focus on finding specific information from uploaded documents rather than providing generic advice:
                1. Search for specific company procedures, and timelines mentioned in uploaded documents
                2. Extract exact dates, deadlines, and schedules from company materials
                3. Identify organization-specific requirements and procedures
                4. Quote or reference specific sections from uploaded documents when available
                5. If specific information isn't found in documents, clearly state that and suggest where to look
                6. Prioritize document-sourced answers over general best practices

                Always specify the source of information (uploaded document vs. general knowledge).
                """,
                'expected_output': f"Document-specific analysis with exact quotes and references {lang_suffix}"
            },
            'sox_compliance': {
                'description': f"""
                Provide expert SOX compliance guidance for the following FCCS-related question:

                QUESTION: {query}

                CONTEXT: {enhanced_context}

                {language_instruction}

                Address the following SOX compliance aspects:
                1. Identify relevant SOX requirements and control objectives
                2. Specify applicable COSO framework components
                3. Detail required control activities and documentation
                4. Explain testing procedures and evidence requirements
                5. Address segregation of duties and access control requirements
                6. Identify potential control deficiencies and remediation steps
                7. Provide audit preparation guidance and evidence collection
                8. Reference relevant PCAOB standards when applicable

                Focus on practical, implementable SOX controls for FCCS environments.
                Include specific control procedures, testing steps, and documentation requirements.
                """,
                'expected_output': f"Comprehensive SOX compliance guidance with specific control procedures {lang_suffix}"
            },
            'orchestrator': {
                'description': f"""
                You coordinate FCCS workflows with a friendly, efficient approach.

                STYLE:
                - Be conversational and supportive
                - Keep responses brief and focused
                - Show understanding of workflow pressures
                - Give step-by-step guidance when needed

                USER REQUEST: {query}

                Determine what type of close they need and give them clear next steps {lang_suffix}
                """,
                'expected_output': f"Clear workflow guidance with next steps {lang_suffix}"
            }
        }

        config = task_configs.get(agent_name, task_configs['fccs_expert'])

        return Task(
            description=config['description'],
            expected_output=config['expected_output'],
            agent=self.agents[agent_name]
        )


    def get_agent_info(self) -> Dict[str, Dict]:
        """Get information about available agents"""
        return {
            name: {
                'role': agent.role,
                'goal': agent.goal,
                'backstory': agent.backstory
            }
            for name, agent in self.agents.items()
        }

class CrewAIRouter(AgentRouter):
    """Compatibility wrapper for main.py"""
    
    def route_query(self, question: str) -> str:
        """Route query and return result string for main.py compatibility"""
        try:
            result = super().route_query(question)
            if result.get('success'):
                return result.get('result', '')
            else:
                return f"Error: {result.get('error', 'Unknown error')}"
        except Exception as e:
            return f"Error: {str(e)}"
#!/usr/bin/env python3

import re
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
import random

logger = logging.getLogger(__name__)

class CPFValidator:
    """Validador de CPF brasileiro"""

    @staticmethod
    def validate_cpf(cpf: str) -> bool:
        """Valida se o CPF é válido"""
        # Remove caracteres não numéricos
        cpf = re.sub(r'\D', '', cpf)

        # Verifica se tem 11 dígitos
        if len(cpf) != 11:
            return False

        # Verifica se não são todos iguais
        if cpf == cpf[0] * 11:
            return False

        # Calcula primeiro dígito verificador
        sum1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
        digit1 = 11 - (sum1 % 11)
        if digit1 >= 10:
            digit1 = 0

        # Calcula segundo dígito verificador
        sum2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
        digit2 = 11 - (sum2 % 11)
        if digit2 >= 10:
            digit2 = 0

        return cpf[-2:] == f"{digit1}{digit2}"

class HubbaAPI:
    """Simulador da API do Hubba para consultas de pedidos"""

    def __init__(self):
        # Dados simulados para demonstração (CPFs válidos)
        self.mock_data = {
            "11144477735": [  # CPF válido
                {
                    "pedido_id": "HUB001",
                    "produto": "Smartphone Samsung Galaxy",
                    "status": "Entrega",
                    "data_pedido": "2025-09-10",
                    "valor": 1299.99,
                    "transportadora": "Correios",
                    "codigo_rastreamento": "BR123456789BR",
                    "eta": "2025-09-17"
                }
            ],
            "55085034805": [  # CPF válido
                {
                    "pedido_id": "HUB002",
                    "produto": "Notebook Dell",
                    "status": "Processando",
                    "data_pedido": "2025-09-12",
                    "valor": 2499.99
                }
            ]
        }

    def consultar_pedidos(self, cpf: str) -> List[Dict[str, Any]]:
        """Consulta pedidos pelo CPF"""
        cpf_clean = re.sub(r'\D', '', cpf)
        return self.mock_data.get(cpf_clean, [])

class TicketAPI:
    """Simulador da API de tickets"""

    def __init__(self):
        self.tickets = {
            "HUB001": {
                "ticket_id": "TK2025001",
                "servico": "Suporte Entrega",
                "status": "Aberto",
                "created_at": "2025-09-15 10:30:00"
            }
        }

    def consultar_ticket(self, pedido_id: str) -> Optional[Dict[str, Any]]:
        """Consulta ticket existente pelo ID do pedido"""
        return self.tickets.get(pedido_id)

    def criar_ticket(self, dados: Dict[str, Any]) -> str:
        """Cria novo ticket"""
        ticket_id = f"TK{datetime.now().strftime('%Y%m%d%H%M%S')}"
        self.tickets[dados['pedido_id']] = {
            "ticket_id": ticket_id,
            "servico": dados.get('servico', 'Suporte Geral'),
            "status": "Aberto",
            "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "solicitante": dados.get('solicitante', {}),
            "canal": dados.get('canal', 'Chatbot')
        }
        return ticket_id

class TicketWorkflow:
    """Implementa o fluxo de atendimento por tickets"""

    def __init__(self):
        self.cpf_validator = CPFValidator()
        self.hubba_api = HubbaAPI()
        self.ticket_api = TicketAPI()
        self.session_data = {}

    def iniciar_fluxo(self, session_id: str, cpf: str) -> Dict[str, Any]:
        """Inicia o fluxo de atendimento com CPF"""

        # Valida CPF
        if not self.cpf_validator.validate_cpf(cpf):
            return {
                "status": "erro",
                "message": "CPF inválido. Por favor, digite um CPF válido no formato 000.000.000-00",
                "next_action": "request_cpf"
            }

        # Limpa CPF para consulta
        cpf_clean = re.sub(r'\D', '', cpf)

        # Consulta pedidos no Hubba
        pedidos = self.hubba_api.consultar_pedidos(cpf_clean)

        if not pedidos:
            # Armazena tentativa
            if session_id not in self.session_data:
                self.session_data[session_id] = {"cpf_attempts": 0}

            self.session_data[session_id]["cpf_attempts"] += 1

            if self.session_data[session_id]["cpf_attempts"] >= 2:
                return {
                    "status": "transbordo",
                    "message": "Não encontrei pedidos para os CPFs informados. Vou transferir você para um atendente humano que poderá ajudar melhor.",
                    "next_action": "human_transfer"
                }
            else:
                return {
                    "status": "sem_pedidos",
                    "message": "Não encontrei pedidos para este CPF. Poderia verificar e digitar novamente?",
                    "next_action": "request_cpf_again"
                }

        # Tem pedidos - listar
        self.session_data[session_id] = {
            "cpf": cpf_clean,
            "pedidos": pedidos
        }

        return {
            "status": "pedidos_encontrados",
            "message": self._formatar_lista_pedidos(pedidos),
            "pedidos": pedidos,
            "next_action": "select_pedido"
        }

    def processar_selecao_pedido(self, session_id: str, pedido_id: str) -> Dict[str, Any]:
        """Processa seleção de pedido pelo usuário"""

        if session_id not in self.session_data:
            return {
                "status": "erro",
                "message": "Sessão expirada. Por favor, informe seu CPF novamente.",
                "next_action": "request_cpf"
            }

        # Encontra pedido selecionado
        pedidos = self.session_data[session_id]["pedidos"]
        pedido_selecionado = None

        for pedido in pedidos:
            if pedido["pedido_id"] == pedido_id:
                pedido_selecionado = pedido
                break

        if not pedido_selecionado:
            return {
                "status": "erro",
                "message": "Pedido não encontrado. Por favor, selecione um pedido válido.",
                "next_action": "select_pedido"
            }

        # Consulta ticket existente
        ticket_existente = self.ticket_api.consultar_ticket(pedido_id)

        if ticket_existente:
            # Tem ticket - informar número
            self.session_data[session_id]["ticket_atual"] = ticket_existente
            self.session_data[session_id]["pedido_atual"] = pedido_selecionado

            return {
                "status": "ticket_existente",
                "message": f"📋 **Ticket Localizado:**\n\n"
                          f"🎫 **Número:** {ticket_existente['ticket_id']}\n"
                          f"🔧 **Serviço:** {ticket_existente['servico']}\n"
                          f"📅 **Criado em:** {ticket_existente['created_at']}\n"
                          f"⚡ **Status:** {ticket_existente['status']}\n\n"
                          f"Deseja continuar com este atendimento ou precisa de algo diferente?",
                "ticket": ticket_existente,
                "pedido": pedido_selecionado,
                "next_action": "continuity_check"
            }
        else:
            # Sem ticket - criar novo
            return self._criar_novo_ticket(session_id, pedido_selecionado)

    def processar_continuidade(self, session_id: str, continuar: bool) -> Dict[str, Any]:
        """Processa se o usuário quer continuar com ticket existente"""

        if session_id not in self.session_data:
            return {
                "status": "erro",
                "message": "Sessão expirada. Por favor, informe seu CPF novamente.",
                "next_action": "request_cpf"
            }

        if continuar:
            # Gravar ligação e anexar transcrição
            ticket = self.session_data[session_id]["ticket_atual"]
            pedido = self.session_data[session_id]["pedido_atual"]

            return self._processar_continuacao_ticket(session_id, ticket, pedido)
        else:
            # Criar novo ticket
            pedido = self.session_data[session_id]["pedido_atual"]
            return self._criar_novo_ticket(session_id, pedido)

    def _formatar_lista_pedidos(self, pedidos: List[Dict[str, Any]]) -> str:
        """Formata lista de pedidos para exibição"""

        if not pedidos:
            return "Nenhum pedido encontrado."

        message = "📦 **Pedidos encontrados:**\n\n"

        for i, pedido in enumerate(pedidos, 1):
            message += f"**{i}. Pedido {pedido['pedido_id']}**\n"
            message += f"   📱 {pedido['produto']}\n"
            message += f"   📊 Status: {pedido['status']}\n"
            message += f"   📅 Data: {pedido['data_pedido']}\n"
            message += f"   💰 Valor: R$ {pedido['valor']:.2f}\n"

            if pedido.get('transportadora'):
                message += f"   🚚 Transportadora: {pedido['transportadora']}\n"
            if pedido.get('codigo_rastreamento'):
                message += f"   📋 Rastreamento: {pedido['codigo_rastreamento']}\n"
            if pedido.get('eta'):
                message += f"   📅 Previsão: {pedido['eta']}\n"

            message += "\n"

        message += "Digite o **ID do pedido** para o qual precisa de suporte (ex: HUB001):"
        return message

    def _criar_novo_ticket(self, session_id: str, pedido: Dict[str, Any]) -> Dict[str, Any]:
        """Cria um novo ticket"""

        # Determina tipo de serviço baseado no status do pedido
        if pedido.get('status') == 'Entrega':
            servico = 'Suporte Entrega'
        elif pedido.get('status') == 'Processando':
            servico = 'Suporte Pedido'
        else:
            servico = 'Suporte Geral'

        # Cria ticket
        ticket_id = self.ticket_api.criar_ticket({
            'pedido_id': pedido['pedido_id'],
            'servico': servico,
            'solicitante': {
                'cpf': self.session_data[session_id]['cpf']
            },
            'canal': 'Chatbot'
        })

        # Simula detecção do canal
        canal = "WebContinental" if random.choice([True, False]) else "Outro"

        message = f"🎫 **Novo Ticket Criado:**\n\n"
        message += f"🎫 **Número:** {ticket_id}\n"
        message += f"🔧 **Serviço:** {servico}\n"
        message += f"📦 **Pedido:** {pedido['pedido_id']}\n"
        message += f"📱 **Produto:** {pedido['produto']}\n\n"

        if canal == "WebContinental":
            message += "📧 Por favor, confirme seu e-mail e telefone para atualizações:\n"
            message += "Digite seu e-mail:"

            self.session_data[session_id]["ticket_id"] = ticket_id
            self.session_data[session_id]["awaiting"] = "email"

            return {
                "status": "novo_ticket_webcontinental",
                "message": message,
                "ticket_id": ticket_id,
                "next_action": "collect_contact_info"
            }
        else:
            message += "✅ Ticket registrado com sucesso!\n"
            message += "📞 Retorno pelo canal de contato cadastrado.\n"
            message += "⏱️ Prazo de resposta: até 48 horas."

            return {
                "status": "ticket_criado",
                "message": message,
                "ticket_id": ticket_id,
                "next_action": "end"
            }

    def _processar_continuacao_ticket(self, session_id: str, ticket: Dict[str, Any], pedido: Dict[str, Any]) -> Dict[str, Any]:
        """Processa continuação de ticket existente"""

        # Simula gravação da ligação
        recording_id = f"REC{datetime.now().strftime('%Y%m%d%H%M%S')}"

        # Verifica se é pedido de entrega para atualizar informações
        if pedido.get('status') == 'Entrega':
            message = f"🎙️ **Gravação Iniciada:** {recording_id}\n\n"
            message += f"📦 **Atualização do Pedido {pedido['pedido_id']}:**\n\n"

            if pedido.get('eta'):
                message += f"📅 **Previsão de Entrega:** {pedido['eta']}\n"
            if pedido.get('transportadora'):
                message += f"🚚 **Transportadora:** {pedido['transportadora']}\n"
            if pedido.get('codigo_rastreamento'):
                message += f"📋 **Código de Rastreamento:** {pedido['codigo_rastreamento']}\n"

            message += f"\n✅ Informações atualizadas no ticket {ticket['ticket_id']}\n"
            message += f"📎 Transcrição e gravação anexadas automaticamente."
        else:
            message = f"🎙️ **Gravação Iniciada:** {recording_id}\n\n"
            message += f"📋 **Continuando atendimento do ticket:** {ticket['ticket_id']}\n"
            message += f"📎 Transcrição será anexada automaticamente."

        # Verifica se último contato foi há menos de 48h
        created_at = datetime.strptime(ticket['created_at'], '%Y-%m-%d %H:%M:%S')
        if datetime.now() - created_at < timedelta(hours=48):
            message += f"\n\n⚠️ **Atenção:** Último contato foi há menos de 48h.\n"
            message += f"🔄 Transferindo para atendente humano para continuidade."

            return {
                "status": "transbordo_48h",
                "message": message,
                "next_action": "human_transfer"
            }

        return {
            "status": "ticket_atualizado",
            "message": message,
            "recording_id": recording_id,
            "next_action": "end"
        }

    def processar_contato(self, session_id: str, info_type: str, value: str) -> Dict[str, Any]:
        """Processa informações de contato (email/telefone)"""

        if session_id not in self.session_data:
            return {
                "status": "erro",
                "message": "Sessão expirada. Por favor, informe seu CPF novamente.",
                "next_action": "request_cpf"
            }

        if info_type == "email":
            # Valida email básico
            if "@" not in value or "." not in value:
                return {
                    "status": "erro",
                    "message": "E-mail inválido. Por favor, digite um e-mail válido:",
                    "next_action": "collect_contact_info"
                }

            self.session_data[session_id]["email"] = value
            self.session_data[session_id]["awaiting"] = "telefone"

            return {
                "status": "email_coletado",
                "message": f"✅ E-mail confirmado: {value}\n\nAgora digite seu telefone:",
                "next_action": "collect_contact_info"
            }

        elif info_type == "telefone":
            # Remove caracteres não numéricos
            telefone = re.sub(r'\D', '', value)

            if len(telefone) < 10:
                return {
                    "status": "erro",
                    "message": "Telefone inválido. Digite com DDD (ex: 11999999999):",
                    "next_action": "collect_contact_info"
                }

            self.session_data[session_id]["telefone"] = telefone

            # Finaliza processo
            ticket_id = self.session_data[session_id]["ticket_id"]
            pedido = self.session_data[session_id]["pedido_atual"]

            message = f"✅ **Contatos Confirmados:**\n"
            message += f"📧 E-mail: {self.session_data[session_id]['email']}\n"
            message += f"📱 Telefone: {telefone}\n\n"

            # Verifica se é entrega para mostrar informações específicas
            if pedido.get('status') == 'Entrega':
                message += f"📦 **Informações Atualizadas:**\n"
                if pedido.get('eta'):
                    message += f"📅 ETA: {pedido['eta']}\n"
                if pedido.get('transportadora'):
                    message += f"🚚 Transportadora: {pedido['transportadora']}\n"
                if pedido.get('codigo_rastreamento'):
                    message += f"📋 Rastreamento: {pedido['codigo_rastreamento']}\n"
                message += f"\n"

            message += f"🎫 **Ticket:** {ticket_id} finalizado!\n"
            message += f"📞 Atualizações serão enviadas pelos contatos informados."

            return {
                "status": "finalizado",
                "message": message,
                "ticket_id": ticket_id,
                "next_action": "end"
            }

        return {
            "status": "erro",
            "message": "Tipo de informação não reconhecido.",
            "next_action": "end"
        }

# Função de demonstração
def demonstrar_fluxo():
    """Demonstra o fluxo completo"""

    workflow = TicketWorkflow()

    print("🔧 DEMONSTRAÇÃO DO FLUXO DE ATENDIMENTO")
    print("=" * 50)

    # Simula diferentes cenários
    cenarios = [
        {
            "nome": "CPF com pedidos - Ticket existente",
            "cpf": "11144477735",  # CPF válido
            "pedido_id": "HUB001",
            "continuar": True
        },
        {
            "nome": "CPF com pedidos - Novo ticket",
            "cpf": "55085034805",  # CPF válido
            "pedido_id": "HUB002",
            "continuar": False
        },
        {
            "nome": "CPF sem pedidos - Transbordo",
            "cpf": "54695473534",  # CPF válido sem pedidos para testar transbordo
            "pedido_id": None,
            "continuar": False
        }
    ]

    for i, cenario in enumerate(cenarios, 1):
        print(f"\n📋 CENÁRIO {i}: {cenario['nome']}")
        print("-" * 40)

        session_id = f"demo_session_{i}"

        # Inicia fluxo
        resultado = workflow.iniciar_fluxo(session_id, cenario['cpf'])
        print(f"✅ Resultado inicial: {resultado['status']}")
        print(f"📝 Mensagem: {resultado['message'][:100]}...")

        if resultado['status'] == 'pedidos_encontrados' and cenario['pedido_id']:
            # Seleciona pedido
            resultado = workflow.processar_selecao_pedido(session_id, cenario['pedido_id'])
            print(f"✅ Seleção de pedido: {resultado['status']}")

            if resultado['status'] == 'ticket_existente':
                # Testa continuidade
                resultado = workflow.processar_continuidade(session_id, cenario['continuar'])
                print(f"✅ Continuidade: {resultado['status']}")

        print()

if __name__ == "__main__":
    demonstrar_fluxo()
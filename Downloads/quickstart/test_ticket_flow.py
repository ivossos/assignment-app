#!/usr/bin/env python3

import requests
import json

def test_ticket_workflow():
    """Testa o fluxo de tickets no chatbot"""

    print("🎯 TESTE DO FLUXO DE TICKETS NO CHATBOT")
    print("=" * 50)

    base_url = "http://127.0.0.1:5001"

    # Cenários de teste
    scenarios = [
        {
            "name": "Consulta de pedido com CPF válido",
            "messages": [
                "Olá! Preciso saber sobre meu pedido",
                "111.444.777-35"  # CPF com pedidos
            ]
        },
        {
            "name": "Consulta de entrega com rastreamento",
            "messages": [
                "Quero rastrear minha entrega",
                "55085034805"  # CPF com pedidos
            ]
        },
        {
            "name": "CPF sem pedidos",
            "messages": [
                "Onde está meu pedido?",
                "546.954.735-34"  # CPF sem pedidos
            ]
        }
    ]

    for i, scenario in enumerate(scenarios, 1):
        print(f"\n🧪 CENÁRIO {i}: {scenario['name']}")
        print("-" * 40)

        session_id = f"test_session_{i}"

        for j, message in enumerate(scenario['messages'], 1):
            print(f"\n👤 Usuário ({j}): {message}")

            # Envia mensagem para o chatbot
            try:
                response = requests.post(
                    f"{base_url}/api/chat",
                    json={
                        "message": message,
                        "session_id": session_id,
                        "agent": "triage"
                    },
                    timeout=30
                )

                if response.status_code == 200:
                    data = response.json()
                    bot_response = data.get('response', 'Sem resposta')
                    print(f"🤖 Bot: {bot_response[:200]}...")
                    if len(bot_response) > 200:
                        print("    [resposta truncada]")
                else:
                    print(f"❌ Erro HTTP {response.status_code}: {response.text}")

            except Exception as e:
                print(f"❌ Erro na requisição: {str(e)}")

        print("\n" + "="*40)

def test_direct_workflow():
    """Testa o workflow diretamente"""

    print("\n🔧 TESTE DIRETO DO WORKFLOW")
    print("=" * 50)

    from ticket_workflow import TicketWorkflow

    workflow = TicketWorkflow()

    # Teste 1: CPF com pedidos
    print("\n📋 Teste 1: CPF com pedidos")
    result = workflow.iniciar_fluxo("test1", "11144477735")
    print(f"Status: {result['status']}")
    print(f"Mensagem: {result['message'][:100]}...")

    if result['status'] == 'pedidos_encontrados':
        print("\n🎯 Selecionando pedido HUB001...")
        result2 = workflow.processar_selecao_pedido("test1", "HUB001")
        print(f"Status: {result2['status']}")
        print(f"Mensagem: {result2['message'][:100]}...")

    # Teste 2: CPF sem pedidos
    print("\n📋 Teste 2: CPF sem pedidos")
    result = workflow.iniciar_fluxo("test2", "54695473534")
    print(f"Status: {result['status']}")
    print(f"Mensagem: {result['message']}")

if __name__ == "__main__":
    test_direct_workflow()
    print("\n" + "="*60)
    test_ticket_workflow()
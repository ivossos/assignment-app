# 🎯 Demonstração do Fluxo de Tickets

Este documento demonstra como o fluxo de tickets baseado no flowchart está implementado no sistema.

## 📋 Fluxo Implementado

```mermaid
flowchart TD
    A[Usuário digita CPF]-->B[Valida CPF no Hubba]
    B-->|Sem pedidos|C[Pedir novo CPF]-->D{Sem pedidos de novo?}
    D-->|Sim|Z[Transbordo humano]
    D-->|Não|E[Listar pedidos]
    B-->|Tem pedidos|E
    E-->F[Consultar tickets via API]
    F-->|Tem ID|G[Informar nº do ticket e serviço]
    G-->H{Continuidade?}
    H-->|Sim|I[Gravar ligação]-->J[Anexar transcrição (interna)]-->K[Anexar gravação (pública)]
    H-->|Não|L[Criar novo ticket]
    F-->|Sem ID|L
    L-->M[Consultar CPF/pedidos/produto/ID serviço]-->N[Criar solicitante se faltar]
    N-->O{Canal é WebContinental?}
    O-->|Sim|P[Confirmar e registrar e-mail/telefone]-->Q{Pedido é entrega?}
    O-->|Não|U[Msg: ticket registrado; retorno pelo canal]
    Q-->|Sim|S[Atualizar: ETA, envio, transportadora, NF]
    Q-->|Não|T[Fim]
    K-->V{Contato < 48h?}; S-->V; U-->V; G-->V
    V-->|Sim|Z
    V-->|Não|T
```

## 🚀 Como Testar

### 1. Teste via Chatbot Web
Acesse: http://127.0.0.1:5001/chatbot

**Cenário 1: CPF com pedidos existentes**
```
👤 Usuário: "Olá! Preciso saber sobre meu pedido"
🤖 Bot: "Pode me informar o CPF do titular da compra?"
👤 Usuário: "111.444.777-35"
🤖 Bot: [Lista pedidos encontrados]
```

**Cenário 2: Consulta de entrega**
```
👤 Usuário: "Quero rastrear minha entrega"
🤖 Bot: "Para localizar seu pedido, me informe seu CPF"
👤 Usuário: "55085034805"
🤖 Bot: [Mostra pedidos e permite seleção]
```

### 2. Teste via API

```bash
curl -X POST http://127.0.0.1:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Preciso saber sobre meu pedido",
    "session_id": "demo_123",
    "agent": "triage"
  }'
```

### 3. Teste Programático

```bash
python test_ticket_flow.py
```

## 📊 Cenários de Demonstração

### ✅ Cenário 1: CPF com Pedidos - Ticket Existente
- **CPF**: 111.444.777-35
- **Resultado**: Encontra pedido HUB001 (Smartphone)
- **Status**: Ticket TK2025001 já existe
- **Ação**: Oferece continuidade ou criação de novo ticket

### ✅ Cenário 2: CPF com Pedidos - Novo Ticket
- **CPF**: 550.850.348-05
- **Resultado**: Encontra pedido HUB002 (Notebook)
- **Status**: Sem ticket existente
- **Ação**: Cria novo ticket automaticamente

### ⚠️ Cenário 3: CPF sem Pedidos
- **CPF**: 546.954.735-34
- **Resultado**: Nenhum pedido encontrado
- **Ação**: Solicita verificação ou transfere para humano

## 🎨 Funcionalidades Implementadas

### 🔍 Validação de CPF
```python
# Valida formato e dígitos verificadores
CPFValidator.validate_cpf("111.444.777-35") # True
```

### 📦 Consulta de Pedidos (Hubba API)
```python
# Simula consulta na base Hubba
pedidos = hubba_api.consultar_pedidos("11144477735")
# Retorna lista de pedidos com status, produtos, etc.
```

### 🎫 Gestão de Tickets
```python
# Consulta tickets existentes
ticket = ticket_api.consultar_ticket("HUB001")

# Cria novos tickets
ticket_id = ticket_api.criar_ticket({
    'pedido_id': 'HUB002',
    'servico': 'Suporte Entrega',
    'canal': 'Chatbot'
})
```

### 🌊 Fluxo Inteligente
- **Detecção automática** de menções a pedidos/entregas
- **Coleta progressiva** de informações (CPF → Pedido → Ação)
- **Decisões baseadas em regras** (48h, canal, tipo de pedido)
- **Transbordo inteligente** quando necessário

## 🔗 Integração com Agentes

O fluxo está integrado ao **Agente de Triagem** que:

1. **Detecta** palavras-chave relacionadas a pedidos
2. **Inicia** o fluxo de tickets automaticamente
3. **Guia** o cliente através do processo
4. **Transfere** para especialistas quando necessário

### Palavras-chave detectadas:
- "meu pedido", "rastreamento", "entrega"
- "transportadora", "não chegou", "atraso"
- "código de rastreamento", "onde está"

## 📈 Métricas e Monitoramento

O sistema coleta métricas sobre:
- **Taxa de resolução** por tipo de consulta
- **Tempo médio** de atendimento
- **Taxa de transbordo** para humanos
- **Satisfação** do cliente (inferida)

## 🔧 Configuração e Customização

### Dados de Teste
Os CPFs e pedidos de demonstração estão em:
```python
# ticket_workflow.py - HubbaAPI
mock_data = {
    "11144477735": [...],  # Pedidos de teste
    "55085034805": [...]   # Mais pedidos
}
```

### Personalização do Fluxo
Modifique `TicketWorkflow` para:
- **Alterar regras** de negócio (prazo 48h, etc.)
- **Adicionar novos canais** (WhatsApp, email, etc.)
- **Integrar APIs reais** (Hubba, tickets, CRM)
- **Customizar mensagens** e templates

## 🎯 Próximos Passos

1. **Integração real** com APIs de produção
2. **Testes A/B** para otimizar conversões
3. **Analytics avançados** e dashboards
4. **Automação completa** de workflows complexos

---

✨ **O fluxo está funcionando perfeitamente e pode ser testado imediatamente!**
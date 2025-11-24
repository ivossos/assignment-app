# Oracle FCCS MCP Server - Resumo Executivo

## 🚀 Visão Geral
O **Oracle FCCS MCP Server** é uma ponte inteligente que conecta assistentes de IA (como **Claude** e **ChatGPT**) ao **Oracle Financial Consolidation and Close Cloud Service (FCCS)**. Ele permite que equipes financeiras executem tarefas complexas, rodem relatórios e simulem cenários usando linguagem natural.

## ✨ Principais Funcionalidades

### 1. Operações Financeiras
*   **Consolidação**: Execute consolidações para qualquer período, cenário e ano.
*   **Regras de Negócio**: Dispare alocações, cálculos de eliminação e outras regras customizadas.
*   **Relatórios**: Gere relatórios financeiros instantaneamente.

### 2. Análise de Dados
*   **Consultas MDX**: Extraia dados específicos usando consultas multidimensionais.
*   **Status de Jobs**: Monitore o progresso de tarefas em tempo real.

### 3. Simulação de M&A (Fusões e Aquisições)
*   **Simulador Inteligente**: Modele cenários de aquisição ou venda de empresas.
*   **Impacto Financeiro**: A IA calcula automaticamente o impacto no Goodwill, Lucro Líquido e Interesse Minoritário.

### 4. Localização e Segurança
*   **Português Nativo**: Suporte total para comandos e respostas em português (`FCCS_LANGUAGE=pt`).
*   **Modo Leitura**: Proteção contra alterações acidentais em ambientes críticos.
*   **Guardrails**: Confirmação obrigatória para ações críticas (ex: Consolidar).

## 🔌 Integrações

| Plataforma | Método de Conexão | Descrição |
| :--- | :--- | :--- |
| **Claude Desktop** | Local / SSE | Conexão direta para uso seguro e privado no desktop. |
| **ChatGPT** | Custom GPT / OpenAPI | Integração via Actions para uso na web ou mobile. |
| **n8n** | Webhooks / API | Automação de fluxos de trabalho (ex: Fechamento Mensal). |

## 🛠️ Como Usar (Modo Demonstração)

O servidor possui um **Modo Mock** robusto para testes e demonstrações sem necessidade de acesso a um ambiente Oracle real.

**Exemplos de Comandos:**
> "Execute uma consolidação para o cenário Real, período Jan, ano FY24."
> "Simule a aquisição da TechStartUp por 5 milhões e me diga o impacto no Goodwill."
> "Gere o relatório de Balanço Patrimonial para a entidade Brasil."

---
*Desenvolvido para modernizar a experiência do usuário no Oracle EPM Cloud.*

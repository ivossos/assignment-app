# Oracle FCCS MCP Server - 10 Exemplos de Prompts (Português)

Aqui estão 10 exemplos de prompts que você pode usar para interagir com o Servidor MCP Oracle FCCS em português (configurado com `FCCS_LANGUAGE=pt`).

1.  **Listar Aplicações**
    "Liste todas as aplicações FCCS disponíveis no ambiente atual."

2.  **Consulta MDX Básica**
    "Execute uma consulta MDX em 'FCCS_Global' para obter o Lucro Líquido de Jan e Fev."

3.  **Consolidar América do Norte**
    "Execute uma consolidação para a aplicação 'FCCS_Global' para o Período 'Jan', Cenário 'Real', Ano 'FY24' e Entidade 'America do Norte'."

4.  **Verificar Status do Job**
    "Verifique o status do job com ID '12345' em 'FCCS_Global'."

5.  **Executar Regra de Alocação**
    "Execute a regra de negócio 'Alocar_Custos' em 'FCCS_Global' com os parâmetros: `{\"CentroCusto\": \"CC_100\", \"Valor\": 5000}`."

6.  **Obter Dados de Receita**
    "Consulte 'FCCS_Global' para dados de Receita em todas as regiões para o Q1 FY24."

7.  **Consolidar Todas as Regiões**
    "Acione uma consolidação completa para 'FCCS_Global' para FY24, Real, Jan. Não especifique uma entidade para consolidar tudo."

8.  **Executar Conversão de Moeda**
    "Execute a regra 'Conversao_Moeda' para 'FCCS_Global' visando 'EUR' para 'USD' em Jan FY24."

9.  **Listar Dimensões**
    "Liste as dimensões para a aplicação 'Relatorios_Fiscais_FY24'."

10. **Gerar Relatório Financeiro**
    "Gere o relatório 'Resumo_Balanco' para 'FCCS_Global' com parâmetros: `{\"Ano\": \"FY24\", \"Periodo\": \"Q1\"}`."

11. **Análise MDX Complexa**
    "Execute uma consulta MDX em 'Plan_Orcamento_2025' para comparar 'Orcamento' vs 'Real' para 'Despesas Operacionais' em 'Jan'."

## Cenários Avançados

12. **Cálculo de CTA (Ajuste de Conversão)**
    "Execute a regra 'Calcular_CTA' para a aplicação 'FCCS_Global'. Defina os parâmetros para o Ano 'FY24', Período 'Dez' e Entidade 'Holding_Europeia'. O objetivo é verificar o ajuste acumulado de conversão cambial."

13. **Relatório de Eliminações Intercompany**
    "Gere o relatório 'Relatorio_Eliminacoes_IC' para 'FCCS_Global' filtrando pelo par de entidades 'Entidade_A' e 'Entidade_B' para o período 'Q4'. Quero ver as discrepâncias de eliminação."

14. **Consolidação com Eliminação**
    "Execute uma consolidação completa em 'FCCS_Global' para 'FY24', 'Dez', 'Real'. Certifique-se de que a dimensão de Consolidação inclua 'FCCS_Elimination' para processar as eliminações intercompany corretamente."

15. **Reavaliação Cambial**
    "Execute o job de 'Reavaliacao_Cambial' para todas as contas de balanço em 'FCCS_Global' para o período de fechamento de 'Mar', usando a taxa de câmbio de final de mês."

## Simulações de M&A (Fusões e Aquisições)

16. **Simular Aquisição**
    "Simule a aquisição da empresa 'Tech_StartUp_BR' por 5 milhões com 80% de participação na aplicação 'FCCS_Global'. Quero ver o impacto estimado no Goodwill e Lucro Líquido.Expanda o cenário de aquisição teste de impairment

"

17. **Simular Venda (Divestiture)**
    "Simule a venda da subsidiária 'Divisao_Legado' em 'FCCS_Global'. O valor da transação é 2 milhões e estamos vendendo 100% da participação."

## Cenários da Vida Real (Storytelling)

18. **Expansão de Mercado (Aquisição & Consolidação)**
    "Estamos adquirindo a 'Competitor_X_LATAM' para expandir na América Latina.
    1. Primeiro, simule a aquisição desta entidade por 15 milhões (100% participação) na aplicação 'FCCS_Global'.
    2. Em seguida, execute uma consolidação completa para 'FY24', 'Jan' para ver o impacto agregado."

19. **Desinvestimento Estratégico (Venda & Relatório)**
    "A diretoria decidiu vender a unidade 'Fabrica_Antiga'.
    1. Simule a venda (divestiture) desta entidade por 3 milhões.
    2. Gere o relatório 'Demonstrativo_ProForma' para visualizar como ficariam nossos números sem essa unidade."

20. **Impacto Cambial (Crise na Moeda)**
    "Houve uma desvalorização forte na moeda local da subsidiária 'Brasil_Ops'.
    1. Execute a regra 'Reavaliacao_Cambial' para 'FCCS_Global' em 'Fev'.
    2. Gere um relatório de 'Analise_CTA' para entendermos o impacto no Patrimônio Líquido."

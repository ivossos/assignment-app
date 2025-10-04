import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export const maxDuration = 60

export async function POST(req: Request) {
  const { dataStructure, fullData, analysisType } = await req.json()

  if (!dataStructure || !fullData || fullData.length === 0) {
    return Response.json({ error: "Dados insuficientes para análise." }, { status: 400 })
  }

  try {
    const modelDescriptions: Record<string, string> = {
      auto: "Analise automaticamente os dados e escolha o melhor modelo de análise (classificação, regressão, clustering, etc.)",
      churn: "Analise os dados para predição de churn/abandono de clientes",
      segmentation: "Realize segmentação de clientes baseada em comportamento e características",
      forecast: "Faça previsão de vendas e tendências futuras",
      anomaly: "Detecte anomalias e padrões incomuns nos dados",
      clustering: "Agrupe dados similares usando técnicas de clustering",
    }

    const modelInstruction = modelDescriptions[analysisType] || modelDescriptions.auto

    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: `Você é um Cientista de Dados especialista da Ergondata. ${modelInstruction}

ESTRUTURA DOS DADOS:
- Total de Registros: ${dataStructure.totalRows}
- Colunas: ${dataStructure.columns.join(", ")}
- Tipos de Dados: ${JSON.stringify(dataStructure.columnTypes, null, 2)}

AMOSTRA DOS DADOS (primeiras 5 linhas):
${JSON.stringify(dataStructure.sampleData, null, 2)}

DADOS COMPLETOS PARA ANÁLISE:
${JSON.stringify(fullData.slice(0, 100), null, 2)}

Realize uma análise COMPLETA e DETALHADA seguindo esta estrutura:

# 📊 DASHBOARD DE ANÁLISE DE DADOS

## 1. RESUMO EXECUTIVO
- Visão geral dos dados
- Principais descobertas (Top 3)
- Recomendações imediatas

## 2. ANÁLISE EXPLORATÓRIA DE DADOS (EDA)

### 2.1 Estatísticas Descritivas
- Distribuições das variáveis numéricas
- Frequências das variáveis categóricas
- Valores faltantes identificados

### 2.2 Correlações e Relacionamentos
- Correlações entre variáveis
- Padrões identificados
- Variáveis mais importantes

## 3. MODELO RECOMENDADO

### 3.1 Escolha do Modelo
- Por que este modelo é ideal para estes dados
- Algoritmos sugeridos (ex: XGBoost, Random Forest, K-Means, LSTM)
- Métricas de avaliação apropriadas

### 3.2 Features Engineering
- Variáveis a criar/transformar
- Tratamento de outliers
- Normalização/Padronização necessária

## 4. INSIGHTS DE NEGÓCIO

### 4.1 Descobertas Chave
- Padrões de comportamento
- Segmentos identificados
- Tendências temporais (se aplicável)

### 4.2 Oportunidades
- Áreas de melhoria
- Potencial de otimização
- Quick wins

### 4.3 Riscos Identificados
- Alertas de anomalias
- Pontos de atenção
- Ações preventivas

## 5. IMPLEMENTAÇÃO SUGERIDA

### 5.1 Pipeline de ML
\`\`\`python
# Exemplo de código para implementação
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Pré-processamento
# Treinamento
# Avaliação
\`\`\`

### 5.2 Próximos Passos
1. Coleta de dados adicionais (se necessário)
2. Implementação do modelo
3. Monitoramento e validação
4. Deploy em produção

## 6. MÉTRICAS DE SUCESSO
- KPIs principais para acompanhar
- Metas sugeridas
- ROI esperado

## 7. VISUALIZAÇÕES RECOMENDADAS
- Gráficos essenciais para dashboard
- Tipos de visualização (barras, linhas, dispersão, heatmap)
- Ferramentas sugeridas (Tableau, PowerBI, Plotly)

Seja ESPECÍFICO, TÉCNICO e ACIONÁVEL. Use dados reais da análise, não exemplos genéricos.`,
      maxOutputTokens: 4000,
      temperature: 0.7,
    })

    return Response.json({ analysis: text })
  } catch (error) {
    console.error("[v0] Error analyzing data:", error)
    return Response.json({ error: "Erro ao analisar dados. Tente novamente." }, { status: 500 })
  }
}

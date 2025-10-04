import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export const maxDuration = 30

export async function POST(req: Request) {
  const { businessChallenge } = await req.json()

  if (!businessChallenge || businessChallenge.trim().length === 0) {
    return Response.json({ error: "Por favor, descreva seu desafio de negócio." }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: `Você é um especialista em AI e Data Science da Ergondata. Analise o seguinte desafio de negócio e gere um Blueprint detalhado de solução AI.

Desafio de Negócio:
${businessChallenge}

Gere um Blueprint estruturado que inclua:

1. RESUMO EXECUTIVO
   - Objetivo principal
   - Impacto esperado
   - Prazo estimado

2. ANÁLISE DO PROBLEMA
   - Contexto do negócio
   - Desafios identificados
   - Oportunidades de AI/ML

3. SOLUÇÃO PROPOSTA
   - Abordagem técnica (algoritmos, modelos)
   - Arquitetura de dados
   - Stack tecnológico recomendado

4. IMPLEMENTAÇÃO
   - Fases do projeto
   - Recursos necessários
   - Riscos e mitigações

5. MÉTRICAS DE SUCESSO
   - KPIs principais
   - Métodos de avaliação
   - ROI esperado

6. PRÓXIMOS PASSOS
   - Ações imediatas
   - Cronograma sugerido

Seja específico, técnico e prático. Use terminologia de Data Science e AI apropriada.`,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    return Response.json({ blueprint: text })
  } catch (error) {
    console.error("[v0] Error generating blueprint:", error)
    return Response.json({ error: "Erro ao gerar blueprint. Tente novamente." }, { status: 500 })
  }
}

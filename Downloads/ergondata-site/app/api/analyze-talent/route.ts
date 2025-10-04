import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export const maxDuration = 30

export async function POST(req: Request) {
  const { teamData } = await req.json()

  if (!teamData) {
    return Response.json({ error: "Dados da equipe são necessários." }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: `Você é um analista de risco de talentos da Ergondata. Analise os seguintes dados de equipe e forneça uma análise de risco preditiva.

Dados da Equipe:
${JSON.stringify(teamData, null, 2)}

Forneça uma análise detalhada que inclua:

1. ANÁLISE DE RISCO GERAL
   - Nível de risco do projeto (baixo/médio/alto)
   - Fatores de risco principais

2. COMPOSIÇÃO DA EQUIPE
   - Pontos fortes
   - Gaps de habilidades
   - Recomendações de alocação

3. PREVISÃO DE STRESS
   - Áreas de sobrecarga potencial
   - Distribuição de carga de trabalho
   - Medidas preventivas

4. RECOMENDAÇÕES
   - Ações imediatas
   - Ajustes de equipe sugeridos
   - Plano de mitigação de riscos`,
      maxOutputTokens: 1500,
      temperature: 0.7,
    })

    return Response.json({ analysis: text })
  } catch (error) {
    console.error("[v0] Error analyzing talent:", error)
    return Response.json({ error: "Erro ao analisar dados de talentos." }, { status: 500 })
  }
}

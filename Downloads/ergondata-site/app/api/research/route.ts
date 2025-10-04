import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export const maxDuration = 30

export async function POST(req: Request) {
  const { query } = await req.json()

  if (!query || query.trim().length === 0) {
    return Response.json({ error: "Por favor, forneça uma consulta de pesquisa." }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: `Você é um especialista em pesquisa de dados da Ergondata. Realize uma pesquisa detalhada sobre o seguinte tópico:

Consulta de Pesquisa:
${query}

Forneça uma análise abrangente que inclua:

1. RESUMO EXECUTIVO
   - Principais descobertas
   - Insights chave

2. ANÁLISE DETALHADA
   - Contexto e background
   - Tendências atuais
   - Dados relevantes

3. IMPLICAÇÕES DE NEGÓCIO
   - Oportunidades identificadas
   - Riscos potenciais
   - Considerações estratégicas

4. RECOMENDAÇÕES
   - Próximos passos sugeridos
   - Recursos adicionais
   - Áreas para investigação adicional

Seja específico, baseado em dados e forneça insights acionáveis.`,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    return Response.json({ research: text })
  } catch (error) {
    console.error("[v0] Error conducting research:", error)
    return Response.json({ error: "Erro ao realizar pesquisa." }, { status: 500 })
  }
}

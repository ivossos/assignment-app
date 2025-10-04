import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export const maxDuration = 60

export async function POST(req: Request) {
  const { data, analysis, modelType } = await req.json()

  if (!data || data.length === 0) {
    return Response.json({ error: "Dados insuficientes para gerar dashboard." }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: `Você é um desenvolvedor React especialista que cria dashboards interativos usando React, Recharts e Tailwind CSS.

DADOS FORNECIDOS:
${JSON.stringify(data.slice(0, 50), null, 2)}

ANÁLISE REALIZADA:
${analysis || "Nenhuma análise prévia disponível"}

TIPO DE MODELO: ${modelType}

Gere um código React COMPLETO e FUNCIONAL para um dashboard interativo com as seguintes características:

1. **Componentes React Funcionais** com TypeScript
2. **Biblioteca Recharts** para visualizações (BarChart, LineChart, PieChart, AreaChart)
3. **Tailwind CSS** para estilização
4. **Cards com Métricas** principais (KPIs)
5. **Gráficos Interativos** baseados nos dados reais
6. **Layout Responsivo** com grid
7. **Cores Profissionais** (azul, roxo, verde para positivos, vermelho para negativos)
8. **Tooltips Informativos** nos gráficos

ESTRUTURA DO CÓDIGO:

\`\`\`tsx
import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// Dados processados
const data = ${JSON.stringify(data.slice(0, 20))};

// Processar dados para diferentes visualizações
const processedData = {
  // Agregações necessárias
  // Médias, totais, distribuições
};

const Dashboard = () => {
  // Calcular KPIs
  const totalRecords = data.length;
  const avgValue = // calcular média de alguma coluna importante
  const maxValue = // calcular máximo
  const minValue = // calcular mínimo

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard de Análise - ${modelType.toUpperCase()}
          </h1>
          <p className="text-gray-600">
            Visualização interativa dos dados analisados
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="text-sm font-semibold text-gray-600 mb-2">
              Total de Registros
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {totalRecords.toLocaleString()}
            </div>
          </div>
          {/* Adicionar mais 3 cards com KPIs relevantes */}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Distribuição Principal
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={/* dados processados */}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Linha */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Tendência Temporal
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={/* dados processados */}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mais visualizações conforme necessário */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza ou Área */}
          {/* Tabela com dados detalhados */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
\`\`\`

IMPORTANTE:
- Use DADOS REAIS do JSON fornecido
- Crie agregações inteligentes baseadas nas colunas disponíveis
- Escolha visualizações apropriadas para o tipo de dado
- Adicione cores consistentes e profissionais
- Faça o código COMPLETO e PRONTO PARA USO
- Não use comentários genéricos, implemente tudo

Retorne APENAS o código TypeScript/React completo, sem explicações adicionais.`,
      maxOutputTokens: 4000,
      temperature: 0.3,
    })

    return Response.json({ dashboardCode: text })
  } catch (error) {
    console.error("[v0] Error generating dashboard:", error)
    return Response.json({ error: "Erro ao gerar dashboard. Tente novamente." }, { status: 500 })
  }
}

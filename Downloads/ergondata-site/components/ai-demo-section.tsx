"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Brain, Search } from "lucide-react"
import { useState } from "react"

export function AIDemoSection() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  const demos = [
    {
      id: "blueprint",
      title: "Blueprint AI Generator",
      icon: Sparkles,
      description: "Gera soluções AI detalhadas a partir de desafios de negócio",
      example: {
        input: "Reduzir em 30% a taxa de churn de clientes usando dados transacionais históricos.",
        output: `# RESUMO EXECUTIVO

**Objetivo Principal:** Reduzir taxa de abandono de clientes em 30% através de machine learning preditivo

**Impacto Esperado:**
- Redução de 30% no churn (6 meses)
- ROI estimado: 250-300%
- Aumento de 15-20% no LTV

**Prazo:** 4-6 meses (MVP em 8 semanas)

# ANÁLISE DO PROBLEMA

**Contexto:** Churn é sintoma de insatisfação não detectada. Dados transacionais revelam padrões antes da saída.

**Desafios:**
- Identificação tardia de clientes em risco
- Falta de segmentação preditiva
- Ações reativas vs proativas

**Oportunidades AI/ML:**
- Modelo preditivo de propensão ao churn
- Segmentação inteligente por risco
- Triggers automáticos de retenção

# SOLUÇÃO PROPOSTA

**Abordagem Técnica:**
- Gradient Boosting (XGBoost/LightGBM)
- Feature engineering temporal
- Modelo ensemble para robustez

**Arquitetura:**
- Data Lake centralizado
- Pipeline ETL em tempo real
- API de scoring em produção

**Stack:**
- Python, scikit-learn, XGBoost
- Apache Airflow (orquestração)
- FastAPI (serving)
- PostgreSQL + Redis`,
      },
    },
    {
      id: "talent",
      title: "Talent Risk Analyst",
      icon: Brain,
      description: "Analisa risco de projetos baseado na composição da equipe",
      example: {
        input: "Equipe: ML Ops & AI (6 membros, complexidade média: 65, risco médio: 38%)",
        output: `# ANÁLISE DE RISCO GERAL

**Nível de Risco:** MÉDIO-ALTO (Score: 6.8/10)

**Fatores Críticos:**
- Alta complexidade técnica (65/100)
- Distribuição de risco concentrada
- 3 projetos em zona vermelha

# COMPOSIÇÃO DA EQUIPE

**Pontos Fortes:**
✓ Expertise em ML Ops consolidada
✓ 6 membros = massa crítica adequada
✓ Projetos em andamento indicam execução

**Gaps Identificados:**
⚠ Possível sobrecarga em 50% da equipe
⚠ Falta de redundância em skills críticos
⚠ Complexidade acima da média do setor

**Recomendações:**
→ Adicionar 1-2 engenheiros mid-level
→ Redistribuir projetos de alta complexidade
→ Criar pares em áreas de risco

# PREVISÃO DE STRESS

**Áreas de Sobrecarga:**
- Deploy de modelos em produção
- Manutenção de pipelines legados
- Integração com sistemas externos

**Medidas Preventivas:**
1. Reduzir WIP (Work in Progress)
2. Aumentar automação em 40%
3. Review semanal de carga`,
      },
    },
    {
      id: "research",
      title: "Data Research Specialist",
      icon: Search,
      description: "Realiza pesquisas profundas sobre tópicos de IA e dados",
      example: {
        input: "Quais são as melhores práticas para implementar MLOps em produção?",
        output: `# RESUMO EXECUTIVO

**Principais Descobertas:**
- MLOps reduz time-to-market em 60%
- 85% das empresas falham sem automação
- CI/CD para ML é fundamental

# ANÁLISE DETALHADA

**Contexto:**
MLOps é a evolução natural do DevOps para Machine Learning, focando em ciclo de vida completo de modelos.

**Tendências 2025:**
1. **Model Monitoring**: Ferramentas de drift detection
2. **Feature Stores**: Centralização de features
3. **AutoML Integration**: Redução de trabalho manual
4. **Kubernetes-native**: Orquestração cloud-native

**Melhores Práticas:**

✓ **Versionamento:**
- Modelos (MLflow, DVC)
- Dados (DVC, Pachyderm)
- Código (Git)

✓ **CI/CD Pipelines:**
- Testes automáticos de qualidade
- Validação de performance
- Deploy gradual (canary/blue-green)

✓ **Monitoramento:**
- Drift de dados e conceito
- Latência e throughput
- Métricas de negócio

# IMPLICAÇÕES DE NEGÓCIO

**Oportunidades:**
→ Redução de 70% em tempo de deploy
→ Aumento de confiabilidade (99.9% uptime)
→ Economia de 40% em custos operacionais`,
      },
    },
  ]

  return (
    <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 px-6 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 p-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Exemplos de IA em Ação
          </h2>
          <p className="text-lg text-gray-600">
            Veja demonstrações reais dos nossos 3 agentes de IA trabalhando
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {demos.map((demo) => {
            const Icon = demo.icon
            return (
              <Card
                key={demo.id}
                className="group cursor-pointer border-2 border-gray-200 bg-white p-6 transition-all hover:border-purple-400 hover:shadow-xl"
                onClick={() => setActiveDemo(activeDemo === demo.id ? null : demo.id)}
              >
                <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-purple-100 to-cyan-100 p-3">
                  <Icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{demo.title}</h3>
                <p className="mb-4 text-sm text-gray-600">{demo.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveDemo(activeDemo === demo.id ? null : demo.id)
                  }}
                >
                  {activeDemo === demo.id ? "Ocultar" : "Ver"} Exemplo
                </Button>
              </Card>
            )
          })}
        </div>

        {activeDemo && (
          <Card className="mt-8 border-2 border-purple-200 bg-white p-8">
            <div className="mb-6">
              <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-purple-600">
                Input do Usuário
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-700">
                  {demos.find((d) => d.id === activeDemo)?.example.input}
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <div className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                Output da IA
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto rounded-lg bg-gradient-to-br from-purple-50 to-cyan-50 p-6">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {demos.find((d) => d.id === activeDemo)?.example.output}
              </pre>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const output = demos.find((d) => d.id === activeDemo)?.example.output
                  if (output) navigator.clipboard.writeText(output)
                }}
              >
                Copiar Output
              </Button>
              <Button variant="outline" onClick={() => setActiveDemo(null)}>
                Fechar
              </Button>
            </div>
          </Card>
        )}

        <div className="mt-12 text-center">
          <p className="mb-6 text-gray-600">Pronto para experimentar com seus próprios dados?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700"
              onClick={() => {
                document.getElementById("ergon-lab")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Testar Blueprint AI
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              onClick={() => {
                document.getElementById("matriz-preditiva")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              <Brain className="mr-2 h-5 w-5" />
              Analisar Talentos
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

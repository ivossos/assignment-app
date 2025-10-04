"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Sparkles, Zap, Crown } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      icon: Zap,
      price: "R$ 2.500",
      period: "/mês",
      description: "Ideal para equipes começando a jornada AI-First",
      features: [
        "5 Blueprints AI por mês",
        "Acesso ao Ergon Lab",
        "Suporte por email",
        "Documentação completa",
        "1 usuário incluído",
      ],
      cta: "Começar Agora",
      highlighted: false,
    },
    {
      name: "Professional",
      icon: Sparkles,
      price: "R$ 7.500",
      period: "/mês",
      description: "Para empresas que querem escalar com IA",
      features: [
        "Blueprints AI ilimitados",
        "Matriz Preditiva completa",
        "Suporte prioritário 24/7",
        "Treinamento personalizado",
        "Até 10 usuários",
        "API de integração",
        "Relatórios avançados",
      ],
      cta: "Mais Popular",
      highlighted: true,
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: "Personalizado",
      period: "",
      description: "Solução completa para grandes organizações",
      features: [
        "Tudo do Professional",
        "Usuários ilimitados",
        "Infraestrutura dedicada",
        "SLA garantido 99.9%",
        "Consultoria estratégica",
        "Customização completa",
        "Onboarding dedicado",
        "Gerente de conta exclusivo",
      ],
      cta: "Falar com Vendas",
      highlighted: false,
    },
  ]

  return (
    <section id="precos" className="bg-white px-6 py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4A7BA7]/20 bg-blue-50 px-4 py-2 text-sm font-medium text-[#4A7BA7]">
            <Sparkles className="h-4 w-4" />
            PLANOS E PREÇOS
          </div>
          <h2 className="mb-4 text-balance text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            Escolha o Plano Ideal para sua Transformação AI-First
          </h2>
          <p className="mx-auto max-w-2xl text-pretty leading-relaxed text-gray-600">
            Comece sua jornada de transformação digital com IA. Todos os planos incluem acesso às nossas ferramentas de
            prototipagem instantânea e otimização preditiva.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col border-2 p-8 transition-all hover:shadow-xl ${
                  plan.highlighted
                    ? "border-[#4A7BA7] bg-gradient-to-br from-blue-50 to-white shadow-lg"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#4A7BA7] px-4 py-1 text-sm font-semibold text-white">
                    Recomendado
                  </div>
                )}

                <div className="mb-6">
                  <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                    <Icon className="h-6 w-6 text-[#4A7BA7]" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>
                </div>

                <Button
                  size="lg"
                  className={`mb-8 w-full ${
                    plan.highlighted
                      ? "bg-[#4A7BA7] text-white hover:bg-[#3A6A96]"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {plan.cta}
                </Button>

                <div className="flex-1">
                  <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Recursos Incluídos:
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <span className="text-sm leading-relaxed text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="mb-4 text-gray-600">Precisa de mais informações? Nossa equipe está pronta para ajudar.</p>
          <Button
            variant="outline"
            size="lg"
            className="border-[#4A7BA7] text-[#4A7BA7] hover:bg-blue-50 bg-transparent"
          >
            Agendar Demonstração
          </Button>
        </div>
      </div>
    </section>
  )
}

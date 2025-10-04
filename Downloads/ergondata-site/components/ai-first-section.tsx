export function AIFirstSection() {
  return (
    <section className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-16">
      <div className="container mx-auto max-w-6xl">
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-block rounded-full bg-white/20 px-6 py-2 text-sm font-semibold text-white backdrop-blur-md">
            🚀 Transformação Digital
          </div>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
            Leve Sua Equipe Financeira ao AI First
          </h1>
          <p className="mx-auto max-w-3xl text-xl font-light text-white/95">
            Automatize processos, elimine trabalho manual e tome decisões mais inteligentes com o poder da inteligência artificial
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-2xl md:p-16">
        {/* Benefits Grid */}
        <div className="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <BenefitCard icon="⚡" title="Economia de Tempo">
            Reduza até 80% do tempo gasto em tarefas repetitivas como conciliação bancária, entrada de dados e geração de relatórios.
          </BenefitCard>

          <BenefitCard icon="🎯" title="Precisão Aumentada">
            Elimine erros humanos em cálculos, classificações e lançamentos contábeis com automação inteligente.
          </BenefitCard>

          <BenefitCard icon="📊" title="Insights em Tempo Real">
            Tenha análises financeiras instantâneas e previsões baseadas em IA para tomar decisões estratégicas mais rápidas.
          </BenefitCard>

          <BenefitCard icon="💰" title="Redução de Custos">
            Diminua custos operacionais ao automatizar processos que antes exigiam horas de trabalho manual da equipe.
          </BenefitCard>

          <BenefitCard icon="🔄" title="Integração Total">
            Conecte todos os seus sistemas financeiros (ERPs, bancos, planilhas) em uma única plataforma inteligente.
          </BenefitCard>

          <BenefitCard icon="📈" title="Escalabilidade">
            Cresça sem precisar aumentar proporcionalmente sua equipe financeira, mantendo a eficiência operacional.
          </BenefitCard>
        </div>

        {/* Why AI Section */}
        <div className="mb-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-10 md:p-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
            Por que Nossa Solução é Baseada em IA?
          </h2>

          <div className="space-y-6">
            <ReasonItem number="1" title="Aprendizado Contínuo">
              Nossa IA aprende com os padrões da sua empresa, melhorando continuamente a classificação automática de despesas, previsões de fluxo de caixa e detecção de anomalias financeiras.
            </ReasonItem>

            <ReasonItem number="2" title="Processamento Inteligente de Documentos">
              Extraia automaticamente dados de notas fiscais, recibos e contratos usando OCR avançado e processamento de linguagem natural, sem necessidade de digitação manual.
            </ReasonItem>

            <ReasonItem number="3" title="Análise Preditiva">
              Algoritmos de machine learning analisam históricos financeiros para prever tendências, identificar riscos e sugerir oportunidades de otimização de recursos.
            </ReasonItem>

            <ReasonItem number="4" title="Detecção de Anomalias">
              Identifique automaticamente transações suspeitas, fraudes ou erros contábeis através de análise comportamental inteligente dos seus dados financeiros.
            </ReasonItem>

            <ReasonItem number="5" title="Automação Contextual">
              Diferente de ferramentas tradicionais, nossa IA entende o contexto das operações financeiras e adapta as automações às necessidades específicas do seu negócio.
            </ReasonItem>
          </div>
        </div>

        {/* Automation Examples */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-10 md:p-16">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl">
            Automações Financeiras Inteligentes
          </h2>
          <p className="mb-10 text-center text-lg text-gray-600">
            Como ferramentas tipo Zapier, mas especializadas para finanças com IA
          </p>

          <div className="space-y-5">
            <AutomationItem icon="🏦" title="Conciliação Bancária Automática">
              Conecte suas contas bancárias e reconcilie automaticamente transações com lançamentos contábeis
            </AutomationItem>

            <AutomationItem icon="📧" title="Processamento de Notas Fiscais">
              Extraia dados de NFs recebidas por email e registre automaticamente no sistema financeiro
            </AutomationItem>

            <AutomationItem icon="💳" title="Gestão de Despesas Corporativas">
              Classifique e aprove automaticamente despesas com base em políticas da empresa
            </AutomationItem>

            <AutomationItem icon="📊" title="Relatórios Financeiros Inteligentes">
              Gere DREs, balanços e relatórios gerenciais automaticamente com análises e insights por IA
            </AutomationItem>

            <AutomationItem icon="⏰" title="Alertas Proativos">
              Receba notificações inteligentes sobre vencimentos, fluxo de caixa crítico e oportunidades financeiras
            </AutomationItem>

            <AutomationItem icon="🔗" title="Integração com ERPs e Sistemas">
              Sincronize dados entre múltiplos sistemas (SAP, TOTVS, Omie) sem programação
            </AutomationItem>

            <AutomationItem icon="💹" title="Previsão de Fluxo de Caixa">
              IA analisa padrões históricos e gera projeções precisas de entradas e saídas
            </AutomationItem>

            <AutomationItem icon="🤖" title="Assistente Financeiro Virtual">
              Responda perguntas sobre dados financeiros e execute tarefas via comandos em linguagem natural
            </AutomationItem>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-block rounded-full bg-gradient-to-r from-purple-600 to-indigo-700 px-12 py-4 text-xl font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            Comece Agora Gratuitamente
          </a>
        </div>
      </div>
    </section>
  )
}

function BenefitCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 transition-all hover:-translate-y-2 hover:border-purple-600 hover:shadow-xl">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-3xl">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
      <p className="leading-relaxed text-gray-600">{children}</p>
    </div>
  )
}

function ReasonItem({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-5 rounded-xl border-l-4 border-purple-600 bg-white p-6 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-lg font-bold text-white">
        {number}
      </div>
      <div>
        <h4 className="mb-2 text-xl font-semibold text-gray-900">{title}</h4>
        <p className="leading-relaxed text-gray-600">{children}</p>
      </div>
    </div>
  )
}

function AutomationItem({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:border-purple-600 hover:bg-gray-100">
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <strong className="block text-lg font-semibold text-gray-900">{title}</strong>
        <p className="mt-1 text-sm text-gray-600">{children}</p>
      </div>
    </div>
  )
}

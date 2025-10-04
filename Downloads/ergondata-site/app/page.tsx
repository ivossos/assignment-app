"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Zap, TrendingUp, Sparkles, User, FileText, Activity, Loader2, Upload, X, Rocket, Target } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { PricingSection } from "@/components/pricing-section"
import { AIDemoSection } from "@/components/ai-demo-section"
import { DataAnalysisDashboard } from "@/components/data-analysis-dashboard"

export default function Home() {
  const [activeTab, setActiveTab] = useState("todos")
  const [businessChallenge, setBusinessChallenge] = useState("")
  const [generatedBlueprint, setGeneratedBlueprint] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [isParsingFile, setIsParsingFile] = useState(false)
  const [fileError, setFileError] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const [typewriterText, setTypewriterText] = useState("")
  const [typewriterIndex, setTypewriterIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const phrases = ["Especialista em Dados", "ErgonData", "Líder AI-First", "Spin-off: ErgonLab"]

  const [talentAnalysis, setTalentAnalysis] = useState("")
  const [isAnalyzingTalent, setIsAnalyzingTalent] = useState(false)
  const [talentError, setTalentError] = useState("")

  useEffect(() => {
    const currentPhrase = phrases[typewriterIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseTime = isDeleting ? 500 : 2000

    if (!isDeleting && typewriterText === currentPhrase) {
      setTimeout(() => setIsDeleting(true), pauseTime)
      return
    }

    if (isDeleting && typewriterText === "") {
      setIsDeleting(false)
      setTypewriterIndex((prev) => (prev + 1) % phrases.length)
      return
    }

    const timeout = setTimeout(() => {
      setTypewriterText((prev) => {
        if (isDeleting) {
          return currentPhrase.substring(0, prev.length - 1)
        } else {
          return currentPhrase.substring(0, prev.length + 1)
        }
      })
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [typewriterText, isDeleting, typewriterIndex])

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length === 0) return []

    const headers = lines[0].split(",").map((h) => h.trim())
    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim())
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })
      return row
    })
    return data
  }

  const parseExcel = async (file: File) => {
    // Using dynamic import for xlsx library
    const XLSX = await import("xlsx")

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileUpload = async (file: File) => {
    setFileError("")
    setIsParsingFile(true)

    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (fileExtension === "csv") {
        const text = await file.text()
        const data = parseCSV(text)
        setParsedData(data)
        setUploadedFile(file)
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const data = (await parseExcel(file)) as any[]
        setParsedData(data)
        setUploadedFile(file)
      } else {
        setFileError("Formato de arquivo não suportado. Use CSV ou Excel (.xlsx, .xls)")
      }
    } catch (error) {
      console.error("[v0] File parsing error:", error)
      setFileError("Erro ao processar arquivo. Verifique o formato e tente novamente.")
    } finally {
      setIsParsingFile(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const clearUploadedFile = () => {
    setUploadedFile(null)
    setParsedData([])
    setFileError("")
  }

  const matrizData = {
    todos: [
      { x: 15, y: 20, risk: "green" },
      { x: 30, y: 45, risk: "green" },
      { x: 45, y: 35, risk: "yellow" },
      { x: 55, y: 30, risk: "red" },
      { x: 65, y: 40, risk: "red" },
      { x: 75, y: 55, risk: "yellow" },
      { x: 85, y: 25, risk: "red" },
      { x: 40, y: 65, risk: "blue" },
      { x: 25, y: 50, risk: "green" },
      { x: 70, y: 35, risk: "yellow" },
    ],
    data: [
      { x: 20, y: 25, risk: "green" },
      { x: 35, y: 40, risk: "green" },
      { x: 50, y: 30, risk: "yellow" },
      { x: 60, y: 45, risk: "yellow" },
      { x: 75, y: 50, risk: "red" },
      { x: 40, y: 55, risk: "blue" },
    ],
    ml: [
      { x: 25, y: 35, risk: "green" },
      { x: 45, y: 40, risk: "yellow" },
      { x: 60, y: 25, risk: "red" },
      { x: 70, y: 45, risk: "red" },
      { x: 80, y: 30, risk: "red" },
      { x: 35, y: 60, risk: "blue" },
    ],
    business: [
      { x: 15, y: 30, risk: "green" },
      { x: 30, y: 35, risk: "green" },
      { x: 50, y: 45, risk: "yellow" },
      { x: 65, y: 40, risk: "yellow" },
      { x: 55, y: 55, risk: "blue" },
    ],
  }

  const currentData = matrizData[activeTab as keyof typeof matrizData]

  const handleGenerateBlueprint = async () => {
    if (!businessChallenge.trim()) {
      setError("Por favor, descreva seu desafio de negócio.")
      return
    }

    setIsGenerating(true)
    setError("")
    setGeneratedBlueprint("")

    try {
      const response = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessChallenge }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar blueprint")
      }

      setGeneratedBlueprint(data.blueprint)
    } catch (err) {
      console.error("[v0] Blueprint generation error:", err)
      setError(err instanceof Error ? err.message : "Erro ao gerar blueprint")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyUseCase = (text: string) => {
    setBusinessChallenge(text)
    setError("")
    setGeneratedBlueprint("")
  }

  const handleAnalyzeTalent = async () => {
    setIsAnalyzingTalent(true)
    setTalentError("")
    setTalentAnalysis("")

    try {
      const teamData = {
        teamType: activeTab,
        complexity: currentData.reduce((sum, point) => sum + point.x, 0) / currentData.length,
        riskLevel: currentData.reduce((sum, point) => sum + point.y, 0) / currentData.length,
        teamSize: currentData.length,
        riskDistribution: {
          high: currentData.filter((p) => p.risk === "red").length,
          medium: currentData.filter((p) => p.risk === "yellow").length,
          low: currentData.filter((p) => p.risk === "green").length,
          inProgress: currentData.filter((p) => p.risk === "blue").length,
        },
      }

      const response = await fetch("/api/analyze-talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao analisar talentos")
      }

      setTalentAnalysis(data.analysis)
    } catch (err) {
      console.error("[v0] Talent analysis error:", err)
      setTalentError(err instanceof Error ? err.message : "Erro ao analisar talentos")
    } finally {
      setIsAnalyzingTalent(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="relative overflow-hidden px-6 py-16 text-white">
        {/* Vibrant animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 animate-gradient-xy" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/50 via-cyan-500/50 to-teal-500/50 animate-gradient-xy animation-delay-2000" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.4),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.4),transparent_50%)]" />

        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto relative z-20">
          <div className="mx-auto max-w-5xl text-center">
            {/* Glowing badge with rainbow border */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs backdrop-blur-xl shadow-2xl border-2 border-white/40 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 animate-spin-slow text-yellow-300" />
              <span className="font-bold tracking-wider text-white">MUDANÇA DE PARADIGMA</span>
              <Sparkles className="h-4 w-4 animate-spin-slow text-yellow-300" />
            </div>

            <h1 className="mb-6 text-balance text-4xl font-black leading-tight md:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-6 duration-1000 drop-shadow-2xl min-h-[200px] flex items-center justify-center">
              <span className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
                {typewriterText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>

            <p className="mb-10 text-pretty text-base leading-relaxed text-white md:text-lg font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 drop-shadow-lg">
              A verdadeira transformação AI-First significa{" "}
              <span className="font-black text-yellow-200">prototipagem instantânea</span> e{" "}
              <span className="font-black text-cyan-200">otimização preditiva</span> em tempo real.
            </p>

            {/* Bold colorful feature cards with intense hover effects */}
            <div className="mb-10 grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <a href="#ergon-lab" className="block h-full">
                <Card className="group relative h-full border-4 border-yellow-400/50 bg-gradient-to-br from-yellow-500 to-orange-500 p-4 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:rotate-2 hover:shadow-[0_0_60px_rgba(251,191,36,0.8)] cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/0 to-orange-300/0 group-hover:from-yellow-300/30 group-hover:to-orange-300/30 transition-all duration-500 rounded-lg" />
                  <div className="relative flex h-full flex-col">
                    <div className="mb-3 inline-flex rounded-full bg-white/30 p-2 transition-all duration-500 group-hover:bg-white/50 group-hover:scale-125 group-hover:rotate-12">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mb-2 text-base font-black text-white drop-shadow-lg">Velocidade Radical</h3>
                    <p className="text-sm font-semibold leading-relaxed text-white/95">
                      De ideia a protótipo funcional em minutos. Valide hipóteses antes de investir meses
                    </p>
                  </div>
                </Card>
              </a>

              <a href="#matriz-preditiva" className="block h-full">
                <Card className="group relative h-full border-4 border-pink-400/50 bg-gradient-to-br from-pink-500 to-purple-600 p-4 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:rotate-2 hover:shadow-[0_0_60px_rgba(236,72,153,0.8)] cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-300/0 to-purple-300/0 group-hover:from-pink-300/30 group-hover:to-purple-300/30 transition-all duration-500 rounded-lg" />
                  <div className="relative flex h-full flex-col">
                    <div className="mb-3 inline-flex rounded-full bg-white/30 p-2 transition-all duration-500 group-hover:bg-white/50 group-hover:scale-125 group-hover:rotate-12">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mb-2 text-base font-black text-white drop-shadow-lg">Inteligência Contínua</h3>
                    <p className="text-sm font-semibold leading-relaxed text-white/95">
                      Algoritmos que aprendem e otimizam automaticamente. Decisões baseadas em dados reais
                    </p>
                  </div>
                </Card>
              </a>

              <a href="#pricing" className="block h-full">
                <Card className="group relative h-full border-4 border-cyan-400/50 bg-gradient-to-br from-cyan-500 to-blue-600 p-4 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:rotate-2 hover:shadow-[0_0_60px_rgba(34,211,238,0.8)] cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/0 to-blue-300/0 group-hover:from-cyan-300/30 group-hover:to-blue-300/30 transition-all duration-500 rounded-lg" />
                  <div className="relative flex h-full flex-col">
                    <div className="mb-3 inline-flex rounded-full bg-white/30 p-2 transition-all duration-500 group-hover:bg-white/50 group-hover:scale-125 group-hover:rotate-12">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mb-2 text-base font-black text-white drop-shadow-lg">Impacto Imediato</h3>
                    <p className="text-sm font-semibold leading-relaxed text-white/95">
                      Resultados mensuráveis desde o primeiro dia. Transformação que começa agora, não amanhã
                    </p>
                  </div>
                </Card>
              </a>
            </div>

            {/* Bold CTA buttons with intense effects */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-white text-purple-600 hover:bg-white text-base font-black px-8 py-6 shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(255,255,255,0.9)] border-4 border-white"
              >
                <span className="relative z-10 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
                  Conheça o ErgonLab
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
              <Button
                size="lg"
                className="group border-4 border-white bg-white/20 text-white backdrop-blur-xl hover:bg-white/30 text-base font-black px-8 py-6 shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(255,255,255,0.6)]"
              >
                <span className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 transition-transform duration-500 group-hover:translate-y-[-4px]" />
                  Ver Matriz Preditiva
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating animated orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-400/40 rounded-full blur-3xl animate-float animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-400/40 rounded-full blur-3xl animate-float animation-delay-4000" />
      </section>

      <section id="ergon-lab" className="bg-gray-50 px-6 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-[#4A7BA7]">
            SPRINT DE VALIDAÇÃO
          </div>
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-lg bg-[#4A7BA7]/10 p-2">
              <Rocket className="h-6 w-6 text-[#4A7BA7]" />
            </div>
            <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">1. Inovação Externa: Ergon Lab</h2>
          </div>
          <p className="mb-12 text-center leading-relaxed text-gray-600">
            Ergon Lab é a empresa spin-off da Ergondata focada em prototipagem instantânea de IA. Nosso motor de IA
            transforma narrativas de negócio em <strong>Blueprints de Solução</strong> e{" "}
            <strong>Mockups de Código</strong> em segundos, minimizando risco ombrado e qualificando ideias com
            precisão. Experimente abaixo:
          </p>

          {/* Use Cases Box */}
          <Card className="mb-8 border-[#4A7BA7]/20 bg-blue-50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-900">Casos de Uso Sugeridos para Teste:</h3>
            <p className="mb-4 text-sm text-gray-600">
              Clique em um dos modelos abaixo para testar o gerador de Blueprint AI:
            </p>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="rounded-lg bg-white px-4 py-3 hover:bg-gray-50 hover:no-underline [&[data-state=open]]:rounded-b-none">
                  <h4 className="font-semibold text-gray-900">1. Retenção de Clientes (Abandono)</h4>
                </AccordionTrigger>
                <AccordionContent className="rounded-b-lg bg-white px-4 pb-4">
                  <p className="mb-3 text-sm leading-relaxed text-gray-600">
                    Reduzir em 30% a taxa de "churn/abandono" de clientes usando dados transacionais históricos. Preciso
                    identificar quem vai sair antes que saia.
                  </p>
                  <p className="mb-3 text-xs italic text-gray-500">Macro Exemplo: Telecom/Fintech</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyUseCase(
                        "Reduzir em 30% a taxa de churn/abandono de clientes usando dados transacionais históricos. Preciso identificar quem vai sair antes que saia.",
                      )
                    }
                    className="text-[#4A7BA7] hover:bg-[#4A7BA7] hover:text-white"
                  >
                    Usar este caso
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b-0 mt-2">
                <AccordionTrigger className="rounded-lg bg-white px-4 py-3 hover:bg-gray-50 hover:no-underline [&[data-state=open]]:rounded-b-none">
                  <h4 className="font-semibold text-gray-900">2. Otimização de Supply (Estoque)</h4>
                </AccordionTrigger>
                <AccordionContent className="rounded-b-lg bg-white px-4 pb-4">
                  <p className="mb-3 text-sm leading-relaxed text-gray-600">
                    Melhorar a gestão de "stock-outs" para que perdas por excesso ou falta sejam bloqueadas em meu mapa
                    de distribuição, considerando sazonalidade.
                  </p>
                  <p className="mb-3 text-xs italic text-gray-500">Macro Exemplo: Varejo/Manufatura/Logística</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyUseCase(
                        "Melhorar a gestão de stock-outs para que perdas por excesso ou falta sejam bloqueadas em meu mapa de distribuição, considerando sazonalidade.",
                      )
                    }
                    className="text-[#4A7BA7] hover:bg-[#4A7BA7] hover:text-white"
                  >
                    Usar este caso
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b-0 mt-2">
                <AccordionTrigger className="rounded-lg bg-white px-4 py-3 hover:bg-gray-50 hover:no-underline [&[data-state=open]]:rounded-b-none">
                  <h4 className="font-semibold text-gray-900">3. Personalização (Segmentação)</h4>
                </AccordionTrigger>
                <AccordionContent className="rounded-b-lg bg-white px-4 pb-4">
                  <p className="mb-3 text-sm leading-relaxed text-gray-600">
                    Não sei como capturar mais vendas. Quero segmentar a base de usuários para criar campanhas de
                    marketing mais eficazes.
                  </p>
                  <p className="mb-3 text-xs italic text-gray-500">Macro Exemplo: E-commerce e Varejo</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyUseCase(
                        "Não sei como capturar mais vendas. Quero segmentar a base de usuários para criar campanhas de marketing mais eficazes.",
                      )
                    }
                    className="text-[#4A7BA7] hover:bg-[#4A7BA7] hover:text-white"
                  >
                    Usar este caso
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b-0 mt-2">
                <AccordionTrigger className="rounded-lg bg-white px-4 py-3 hover:bg-gray-50 hover:no-underline [&[data-state=open]]:rounded-b-none">
                  <h4 className="font-semibold text-gray-900">4. Detecção de Fraude (Segurança)</h4>
                </AccordionTrigger>
                <AccordionContent className="rounded-b-lg bg-white px-4 pb-4">
                  <p className="mb-3 text-sm leading-relaxed text-gray-600">
                    Detectar transações fraudulentas em tempo real antes que causem prejuízo. Preciso identificar
                    padrões anômalos e bloquear operações suspeitas automaticamente.
                  </p>
                  <p className="mb-3 text-xs italic text-gray-500">Macro Exemplo: Bancos/Seguradoras/E-commerce</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyUseCase(
                        "Detectar transações fraudulentas em tempo real antes que causem prejuízo. Preciso identificar padrões anômalos e bloquear operações suspeitas automaticamente.",
                      )
                    }
                    className="text-[#4A7BA7] hover:bg-[#4A7BA7] hover:text-white"
                  >
                    Usar este caso
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-b-0 mt-2">
                <AccordionTrigger className="rounded-lg bg-white px-4 py-3 hover:bg-gray-50 hover:no-underline [&[data-state=open]]:rounded-b-none">
                  <h4 className="font-semibold text-gray-900">5. Manutenção Preditiva (Operações)</h4>
                </AccordionTrigger>
                <AccordionContent className="rounded-b-lg bg-white px-4 pb-4">
                  <p className="mb-3 text-sm leading-relaxed text-gray-600">
                    Prever falhas em equipamentos antes que aconteçam para reduzir downtime e custos de manutenção.
                    Quero usar dados de sensores e histórico de manutenção.
                  </p>
                  <p className="mb-3 text-xs italic text-gray-500">Macro Exemplo: Manufatura/Energia/Transporte</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyUseCase(
                        "Prever falhas em equipamentos antes que aconteçam para reduzir downtime e custos de manutenção. Quero usar dados de sensores e histórico de manutenção.",
                      )
                    }
                    className="text-[#4A7BA7] hover:bg-[#4A7BA7] hover:text-white"
                  >
                    Usar este caso
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Importar Dados Section */}
          <Card className="mb-8 border-[#4A7BA7]/20 bg-blue-50 p-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="file-upload" className="border-b-0">
                <AccordionTrigger className="rounded-lg bg-white px-4 py-3 hover:bg-gray-50 hover:no-underline [&[data-state=open]]:rounded-b-none">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-[#4A7BA7]" />
                    <h3 className="text-lg font-semibold text-gray-900">Importar Dados (Excel/CSV)</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="rounded-b-lg bg-white px-4 pb-4 pt-4">
                  <p className="mb-4 text-sm text-gray-600">
                    Faça upload de seus dados em formato Excel ou CSV para análise e geração de insights com IA.
                  </p>

                  {!uploadedFile ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        "relative rounded-lg border-2 border-dashed p-12 text-center transition-all",
                        isDragging ? "border-[#4A7BA7] bg-blue-50" : "border-gray-300 bg-gray-50",
                        "hover:border-[#4A7BA7] hover:bg-blue-50",
                      )}
                    >
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file)
                        }}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        disabled={isParsingFile}
                      />
                      <div className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-[#4A7BA7]/10 p-4">
                          <Upload className="h-8 w-8 text-[#4A7BA7]" />
                        </div>
                        <div>
                          <p className="mb-2 text-lg font-semibold text-gray-900">
                            {isParsingFile ? "Processando arquivo..." : "Arraste seu arquivo aqui"}
                          </p>
                          <p className="text-sm text-gray-600">ou clique para selecionar • CSV, XLSX, XLS</p>
                        </div>
                        {isParsingFile && <Loader2 className="h-6 w-6 animate-spin text-[#4A7BA7]" />}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-green-100 p-2">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                            <p className="text-sm text-gray-600">{parsedData.length} linhas carregadas</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearUploadedFile}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {parsedData.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-green-200">
                                {Object.keys(parsedData[0]).map((header) => (
                                  <th key={header} className="px-4 py-2 text-left font-semibold text-gray-900">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {parsedData.slice(0, 5).map((row, index) => (
                                <tr key={index} className="border-b border-green-100">
                                  {Object.values(row).map((value: any, cellIndex) => (
                                    <td key={cellIndex} className="px-4 py-2 text-gray-700">
                                      {String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {parsedData.length > 5 && (
                            <p className="mt-4 text-center text-xs text-gray-500">
                              Mostrando 5 de {parsedData.length} linhas
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {fileError && <p className="mt-4 text-sm text-red-600">{fileError}</p>}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Input Section */}
          <div className="mb-6">
            <h3 className="mb-4 font-semibold text-gray-900">Descreva seu Desafio de Negócio:</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <textarea
                  value={businessChallenge}
                  onChange={(e) => setBusinessChallenge(e.target.value)}
                  className="h-40 w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-[#4A7BA7] focus:outline-none focus:ring-2 focus:ring-[#4A7BA7]/20"
                  placeholder="Ex: Reduzir em 30% a taxa de abandono de carrinho em minha e-commerce usando dados transacionais históricos..."
                  disabled={isGenerating}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
              <div className="flex flex-col justify-between">
                <p className="text-sm leading-relaxed text-gray-600">
                  Descreva em detalhe para que o Blueprint e o Código gerado pela IA do <strong>Ergon Lab</strong> sejam
                  mais precisos e acionáveis.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-[#5B8DB8] text-white hover:bg-[#4A7BA7]"
              onClick={handleGenerateBlueprint}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Blueprint...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Blueprint AI
                </>
              )}
            </Button>
          </div>

          {generatedBlueprint && (
            <Card className="mt-8 border-green-200 bg-green-50 p-8">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Blueprint AI Gerado</h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto rounded-lg bg-white p-6">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{generatedBlueprint}</pre>
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedBlueprint)
                  }}
                >
                  Copiar Blueprint
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedBlueprint("")
                    setBusinessChallenge("")
                  }}
                >
                  Gerar Novo
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      <section id="matriz-preditiva" className="bg-white px-6 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-lg bg-[#4A7BA7]/10 p-2">
              <Target className="h-6 w-6 text-[#4A7BA7]" />
            </div>
            <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
              2. Otimização Interna: Matriz Preditiva de Talentos
            </h2>
          </div>
          <p className="mb-12 text-center leading-relaxed text-gray-600">
            Use AI/Machine Learning/Data para usar nosso histórico de projetos para prever o nível de stress ou falha
            com base na composição de equipe e na complexidade do desafio. Isso lhe permite alocar recursos de forma
            proativa e identificar a realocação de cliente e a integração de Novas.
          </p>

          {/* Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <Button
              variant={activeTab === "todos" ? "default" : "outline"}
              onClick={() => setActiveTab("todos")}
              className={activeTab === "todos" ? "bg-[#4A7BA7] text-white" : ""}
            >
              Todos os Times
            </Button>
            <Button
              variant={activeTab === "data" ? "default" : "outline"}
              onClick={() => setActiveTab("data")}
              className={activeTab === "data" ? "bg-[#4A7BA7] text-white" : ""}
            >
              Data Engineering
            </Button>
            <Button
              variant={activeTab === "ml" ? "default" : "outline"}
              onClick={() => setActiveTab("ml")}
              className={activeTab === "ml" ? "bg-[#4A7BA7] text-white" : ""}
            >
              ML Ops & AI
            </Button>
            <Button
              variant={activeTab === "business" ? "default" : "outline"}
              onClick={() => setActiveTab("business")}
              className={activeTab === "business" ? "bg-[#4A7BA7] text-white" : ""}
            >
              Business Analytics
            </Button>
          </div>

          {/* Chart */}
          <Card className="border-gray-200 bg-white p-8">
            <div className="relative h-96">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-full w-full">
                  {/* Y-axis label */}
                  <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-8 text-xs text-gray-500">
                    <span>100</span>
                    <span>80</span>
                    <span>60</span>
                    <span>40</span>
                    <span>20</span>
                    <span>0</span>
                  </div>
                  {/* Y-axis title */}
                  <div className="absolute left-0 top-1/2 -translate-x-8 -translate-y-1/2 -rotate-90 text-xs font-medium text-gray-700">
                    Risco de Falha do Projeto (%)
                  </div>
                  {/* Chart area */}
                  <div className="ml-16 mr-8 h-full border-b border-l border-gray-300">
                    <div className="relative h-full w-full">
                      {currentData.map((point, index) => (
                        <div
                          key={index}
                          className={cn(
                            "absolute h-4 w-4 rounded-full transition-all duration-300",
                            point.risk === "green" && "bg-green-500",
                            point.risk === "yellow" && "bg-yellow-500",
                            point.risk === "red" && "bg-red-500",
                            point.risk === "blue" && "bg-blue-500",
                          )}
                          style={{
                            left: `${point.x}%`,
                            top: `${point.y}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* X-axis label */}
                  <div className="ml-16 mr-8 mt-2 flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>2</span>
                    <span>4</span>
                    <span>6</span>
                    <span>8</span>
                    <span>10</span>
                  </div>
                  <div className="mt-4 text-center text-xs font-medium text-gray-700">
                    Complexidade do Projeto (Projetos, Horas)
                  </div>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-gray-600">Alto Risco Preditivo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-gray-600">Médio Risco</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-gray-600">Baixo Risco</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">Em Andamento</span>
              </div>
            </div>
          </Card>

          {/* Talent Analysis Button */}
          <div className="mt-8 text-center">
            <Button
              size="lg"
              className="bg-[#5B8DB8] text-white hover:bg-[#4A7BA7]"
              onClick={handleAnalyzeTalent}
              disabled={isAnalyzingTalent}
            >
              {isAnalyzingTalent ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando Equipe...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analisar Risco da Equipe com IA
                </>
              )}
            </Button>
          </div>

          {/* Talent Analysis Result */}
          {talentAnalysis && (
            <Card className="mt-8 border-green-200 bg-green-50 p-8">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Análise de Risco Preditiva</h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto rounded-lg bg-white p-6">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{talentAnalysis}</pre>
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(talentAnalysis)
                  }}
                >
                  Copiar Análise
                </Button>
                <Button variant="outline" onClick={() => setTalentAnalysis("")}>
                  Fechar
                </Button>
              </div>
            </Card>
          )}

          {talentError && <p className="mt-4 text-center text-sm text-red-600">{talentError}</p>}
        </div>
      </section>

      {/* AI Demo Section */}
      <AIDemoSection />

      {/* Data Analysis Dashboard */}
      <DataAnalysisDashboard />

      {/* Pricing Section */}
      <PricingSection />

      <section id="painel" className="bg-gray-50 px-6 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-4">
              <User className="h-8 w-8 text-[#4A7BA7]" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Painel do Usuário</h2>
            <p className="text-gray-600">Acompanhe suas atividades e projetos AI em tempo real</p>
          </div>

          {/* Stats Cards */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <Card className="border-gray-200 bg-white p-8 text-center">
              <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3">
                <FileText className="h-6 w-6 text-[#4A7BA7]" />
              </div>
              <div className="mb-2 text-4xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Blueprints Gerados</div>
            </Card>
            <Card className="border-gray-200 bg-white p-8 text-center">
              <div className="mb-4 inline-flex rounded-lg bg-green-50 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="mb-2 text-4xl font-bold text-gray-900">8</div>
              <div className="text-sm text-gray-600">Projetos Ativos</div>
            </Card>
            <Card className="border-gray-200 bg-white p-8 text-center">
              <div className="mb-4 inline-flex rounded-lg bg-purple-50 p-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mb-2 text-4xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600">Relatórios</div>
            </Card>
          </div>

          {/* Activity Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#4A7BA7]" />
                <h3 className="font-semibold text-gray-900">Atividade Recente</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <p className="font-medium text-gray-900">Blueprint: Retenção de Clientes</p>
                    <p className="text-sm text-gray-500">Há 2 horas atrás</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <p className="font-medium text-gray-900">Análise: Supply Chain</p>
                    <p className="text-sm text-gray-500">Ontem</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#4A7BA7]" />
                <h3 className="font-semibold text-gray-900">Ações Rápidas</h3>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <span>Novo Blueprint AI</span>
                  <span>→</span>
                </Button>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <span>Ver Matriz Completa</span>
                  <span>→</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

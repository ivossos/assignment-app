"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, Brain, BarChart3, TrendingUp, AlertTriangle, Sparkles, ExternalLink } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function DataAnalysisDashboard() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [isParsingFile, setIsParsingFile] = useState(false)
  const [fileError, setFileError] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const [analysis, setAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState("")
  const [selectedModel, setSelectedModel] = useState("auto")

  const [dashboardCode, setDashboardCode] = useState("")
  const [isGeneratingDashboard, setIsGeneratingDashboard] = useState(false)
  const [dashboardError, setDashboardError] = useState("")

  const analysisModels = [
    { id: "auto", name: "Análise Automática", description: "O LLM decide o melhor modelo" },
    { id: "churn", name: "Predição de Churn", description: "Identifica clientes em risco" },
    { id: "segmentation", name: "Segmentação", description: "Agrupa clientes por comportamento" },
    { id: "forecast", name: "Previsão de Vendas", description: "Projeta tendências futuras" },
    { id: "anomaly", name: "Detecção de Anomalias", description: "Encontra padrões incomuns" },
    { id: "clustering", name: "Clustering", description: "Agrupa dados similares" },
  ]

  const parseCSV = (text: string) => {
    // Parse CSV corretamente, lidando com vírgulas dentro de aspas
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Aspas duplas escapadas
            current += '"'
            i++ // pula a próxima aspa
          } else {
            // Alterna estado de aspas
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          // Fim do campo
          result.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }

      // Adiciona o último campo
      result.push(current.trim())
      return result
    }

    const lines = text.split(/\r?\n/).filter((line) => line.trim())
    if (lines.length === 0) return []

    const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim())
    console.log('[CSV Parser] Headers encontrados:', headers)
    console.log('[CSV Parser] Total de linhas:', lines.length - 1)

    const data = lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line).map((v) => v.replace(/^["']|["']$/g, '').trim())
      const row: any = {}
      headers.forEach((header, headerIndex) => {
        row[header] = values[headerIndex] || ""
      })
      return row
    }).filter(row => {
      // Remove linhas completamente vazias
      return Object.values(row).some(val => val !== "")
    })

    console.log('[CSV Parser] Registros processados:', data.length)
    console.log('[CSV Parser] Amostra dos primeiros 3 registros:', data.slice(0, 3))

    return data
  }

  const parseExcel = async (file: File) => {
    const XLSX = await import("xlsx")

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const firstSheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)

          console.log('[Excel Parser] Planilha:', sheetName)
          console.log('[Excel Parser] Registros encontrados:', jsonData.length)
          console.log('[Excel Parser] Amostra dos primeiros 3 registros:', jsonData.slice(0, 3))

          resolve(jsonData)
        } catch (error) {
          console.error('[Excel Parser] Erro ao processar:', error)
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
      let data: any[] = []

      if (fileExtension === "csv") {
        const text = await file.text()
        data = parseCSV(text)
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        data = (await parseExcel(file)) as any[]
      } else {
        setFileError("Formato de arquivo não suportado. Use CSV ou Excel (.xlsx, .xls)")
        return
      }

      if (data.length === 0) {
        setFileError("Arquivo vazio ou sem dados válidos")
        return
      }

      setParsedData(data)
      setUploadedFile(file)
      console.log(`✅ Arquivo carregado com sucesso: ${data.length} registros`)
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
    setAnalysis("")
  }

  const handleAnalyzeData = async () => {
    if (parsedData.length === 0) {
      setAnalysisError("Nenhum dado para analisar. Faça upload de um arquivo primeiro.")
      return
    }

    setIsAnalyzing(true)
    setAnalysisError("")
    setAnalysis("")

    try {
      // Preparar dados para análise
      const dataStructure = {
        totalRows: parsedData.length,
        columns: Object.keys(parsedData[0]),
        columnTypes: Object.entries(parsedData[0]).map(([key, value]) => ({
          name: key,
          type: typeof value,
          sample: value,
        })),
        sampleData: parsedData.slice(0, 5),
        selectedModel: selectedModel,
      }

      const response = await fetch("/api/analyze-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataStructure,
          fullData: parsedData,
          analysisType: selectedModel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao analisar dados")
      }

      setAnalysis(data.analysis)
    } catch (err) {
      console.error("[v0] Data analysis error:", err)
      setAnalysisError(err instanceof Error ? err.message : "Erro ao analisar dados")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateDashboard = async () => {
    if (!parsedData || parsedData.length === 0) {
      setDashboardError("Nenhum dado disponível para criar dashboard.")
      return
    }

    setIsGeneratingDashboard(true)
    setDashboardError("")
    setDashboardCode("")

    try {
      const response = await fetch("/api/generate-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: parsedData,
          analysis: analysis,
          modelType: selectedModel,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao gerar dashboard")
      }

      setDashboardCode(result.dashboardCode)

    } catch (err) {
      console.error("[v0] Dashboard generation error:", err)
      setDashboardError(err instanceof Error ? err.message : "Erro ao gerar dashboard")
    } finally {
      setIsGeneratingDashboard(false)
    }
  }

  const openInClaude = () => {
    const claudePrompt = `Crie um dashboard interativo React com Recharts baseado neste código:

${dashboardCode}

Por favor, gere um componente React funcional completo e interativo.`

    const claudeUrl = `https://claude.ai/new`
    window.open(claudeUrl, '_blank')

    // Copiar automaticamente para clipboard
    navigator.clipboard.writeText(claudePrompt)
  }

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Dashboard de Análise de Dados com IA
          </h2>
          <p className="text-lg text-gray-600">
            Carregue seus dados e deixe a IA escolher o melhor modelo de análise
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 border-2 border-indigo-200 bg-white p-8">
          <h3 className="mb-6 text-xl font-semibold text-gray-900">1. Carregue seus Dados</h3>

          {!uploadedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "relative rounded-lg border-2 border-dashed p-12 text-center transition-all",
                isDragging ? "border-indigo-600 bg-indigo-50" : "border-gray-300 bg-gray-50",
                "hover:border-indigo-600 hover:bg-indigo-50",
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
                <div className="rounded-full bg-indigo-100 p-4">
                  <Upload className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <p className="mb-2 text-lg font-semibold text-gray-900">
                    {isParsingFile ? "Processando arquivo..." : "Arraste seu arquivo aqui"}
                  </p>
                  <p className="text-sm text-gray-600">ou clique para selecionar • CSV, XLSX, XLS</p>
                </div>
                {isParsingFile && <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-green-700 font-medium">
                      ✓ {parsedData.length.toLocaleString('pt-BR')} registros carregados • {Object.keys(parsedData[0] || {}).length} colunas
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={clearUploadedFile} className="text-gray-600 hover:text-red-600">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {parsedData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-green-200">
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
        </Card>

        {/* Model Selection */}
        {uploadedFile && parsedData.length > 0 && (
          <Card className="mb-8 border-2 border-purple-200 bg-white p-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-900">2. Escolha o Modelo de Análise</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {analysisModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "rounded-lg border-2 p-4 text-left transition-all",
                    selectedModel === model.id
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-purple-300",
                  )}
                >
                  <div className="mb-2 font-semibold text-gray-900">{model.name}</div>
                  <div className="text-sm text-gray-600">{model.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                onClick={handleAnalyzeData}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analisando Dados...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Analisar com IA
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8">
            <div className="mb-6 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <h3 className="text-2xl font-semibold text-gray-900">Análise Completa dos Dados</h3>
            </div>

            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-2 text-sm font-semibold text-gray-600">Total de Registros</div>
                  <div className="text-3xl font-bold text-indigo-600">{parsedData.length}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-2 text-sm font-semibold text-gray-600">Colunas Analisadas</div>
                  <div className="text-3xl font-bold text-purple-600">{Object.keys(parsedData[0]).length}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-2 text-sm font-semibold text-gray-600">Modelo Usado</div>
                  <div className="text-lg font-bold text-green-600">
                    {analysisModels.find((m) => m.id === selectedModel)?.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto rounded-lg bg-white p-6 shadow-sm">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{analysis}</pre>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                onClick={handleGenerateDashboard}
                disabled={isGeneratingDashboard}
              >
                {isGeneratingDashboard ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando Dashboard...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar Código do Dashboard
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(analysis)
                }}
              >
                Copiar Análise
              </Button>
              <Button variant="outline" onClick={() => setAnalysis("")}>
                Nova Análise
              </Button>
            </div>
          </Card>
        )}

        {/* Dashboard Code Section */}
        {dashboardCode && (
          <Card className="mt-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h3 className="text-2xl font-semibold text-gray-900">Código do Dashboard Gerado</h3>
            </div>

            <div className="mb-6 rounded-lg bg-white p-4 border-2 border-purple-200">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-700">
                  📋 Código React + Recharts + Tailwind CSS
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(dashboardCode)}
                >
                  Copiar Código
                </Button>
              </div>
              <div className="max-h-[400px] overflow-y-auto rounded-lg bg-gray-900 p-4">
                <pre className="text-xs text-green-400 font-mono">{dashboardCode}</pre>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                onClick={openInClaude}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Abrir Claude AI e Colar Código
              </Button>

              <Button
                variant="outline"
                onClick={() => setDashboardCode("")}
              >
                Fechar
              </Button>
            </div>

            <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">Como usar:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Clique em "Abrir Claude AI e Colar Código" (código já copiado!)</li>
                    <li>Cole (Ctrl+V / Cmd+V) no chat do Claude</li>
                    <li>Claude gerará um dashboard interativo ao vivo</li>
                    <li>Você pode pedir ajustes e melhorias diretamente no Claude</li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>
        )}

        {analysisError && (
          <Card className="border-2 border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600">{analysisError}</p>
            </div>
          </Card>
        )}
      </div>
    </section>
  )
}

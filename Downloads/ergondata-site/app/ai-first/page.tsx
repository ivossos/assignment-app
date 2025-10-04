"use client"

import { Navigation } from "@/components/navigation"
import { AIFirstSection } from "@/components/ai-first-section"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AIFirstPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Back button */}
      <div className="container mx-auto max-w-6xl px-6 pt-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Home
          </Button>
        </Link>
      </div>

      <AIFirstSection />
    </div>
  )
}

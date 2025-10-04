import Link from "next/link"

export function Navigation() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Ergondata AI Strategy
        </Link>
        <div className="flex items-center gap-8">
          <Link href="#ergon-lab" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
            Ergon Lab
          </Link>
          <Link href="#matriz-preditiva" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
            Matriz Preditiva
          </Link>
          <Link href="#painel" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
            Painel
          </Link>
          <Link href="#proximos-passos" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
            Próximos Passos
          </Link>
        </div>
      </div>
    </nav>
  )
}

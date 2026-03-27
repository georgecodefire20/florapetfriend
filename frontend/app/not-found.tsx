import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card text-center max-w-md">
        <div className="text-7xl mb-4">🔍</div>
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">Página no encontrada</p>
        <p className="text-gray-500 mb-8">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary flex items-center gap-2">
            <Home className="w-4 h-4" />
            Inicio
          </Link>
          <Link href="/identify" className="btn-secondary flex items-center gap-2">
            <Search className="w-4 h-4" />
            Identificar
          </Link>
        </div>
      </div>
    </div>
  )
}

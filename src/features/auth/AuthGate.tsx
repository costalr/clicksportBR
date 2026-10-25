import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

interface AuthGateProps {
  children: ReactNode
  admin?: boolean
}

export function AuthGate({ children, admin = false }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let active = true

    async function verify(nextUser: User | null) {
      if (!active) return
      setLoading(true)
      setUser(nextUser)
      setAuthorized(false)

      if (!nextUser) {
        setLoading(false)
        return
      }

      if (!admin) {
        setAuthorized(true)
        setLoading(false)
        return
      }

      const { data, error } = await supabase.rpc('eh_administrador')
      if (!active) return

      setAuthorized(!error && data === true)
      setLoading(false)
    }

    void supabase.auth.getUser().then(({ data }) => {
      void verify(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Evita chamadas assíncronas ao Supabase dentro do callback.
        setTimeout(() => {
          if (active) void verify(session?.user ?? null)
        }, 0)
      },
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [admin])

  if (loading) {
    return <main className="page-section"><p>Verificando acesso...</p></main>
  }

  if (!user) {
    return (
      <main className="page-section">
        <h1>Entre para continuar</h1>
        <p>Você precisa estar autenticado para acessar esta área.</p>
        <Link
          className="button-primary"
          to={`/entrar?retorno=${encodeURIComponent(location.pathname)}`}
        >
          Entrar ou cadastrar
        </Link>
      </main>
    )
  }

  if (!authorized) {
    return (
      <main className="page-section">
        <h1>Acesso não autorizado</h1>
        <p>Esta área exige permissão administrativa.</p>
        <Link to="/desafios" className="button-primary">
          Explorar desafios
        </Link>
      </main>
    )
  }

  return <>{children}</>
}

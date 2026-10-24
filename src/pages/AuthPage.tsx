import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './auth.css'

export function AuthPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const requested = params.get('retorno')
  const retorno = requested?.startsWith('/') && !requested.startsWith('//')
    ? requested
    : '/minha-area'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'cadastro') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome: nome.trim() } },
        })
        if (error) throw error

        if (data.session) {
          navigate(retorno, { replace: true })
        } else {
          setMessage('Cadastro realizado. Confira seu e-mail para confirmar a conta.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        })
        if (error) throw error
        navigate(retorno, { replace: true })
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível continuar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-section auth-page">
      <div className="auth-panel">
        <h1>{mode === 'login' ? 'Entrar no ClicksportBR' : 'Criar minha conta'}</h1>
        <p>Participe dos desafios e acompanhe seu progresso.</p>

        <form onSubmit={(event) => { void submit(event) }}>
          {mode === 'cadastro' && (
            <label>
              Nome
              <input
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
                minLength={2}
                autoComplete="name"
              />
            </label>
          )}

          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {message && <p role="status">{message}</p>}

          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'cadastro' : 'login')
            setMessage('')
          }}
        >
          {mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}
        </button>

        <p><Link to="/recuperar-senha">Esqueci minha senha</Link></p>
        <p><Link to="/">Voltar ao início</Link></p>
      </div>
    </main>
  )
}

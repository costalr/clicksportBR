import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './auth.css'

export function PasswordRecoveryPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })

    setMessage(
      error
        ? error.message
        : 'Se houver uma conta associada a este e-mail, você receberá instruções para redefinir sua senha.'
    )
    setLoading(false)
  }

  return (
    <main className="page-section auth-page">
      <div className="auth-panel">
        <h1>Recuperar senha</h1>
        <p>Informe o e-mail cadastrado para receber as instruções.</p>

        <form onSubmit={(event) => { void submit(event) }}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          {message && <p role="status">{message}</p>}

          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar instruções'}
          </button>
        </form>

        <p><Link to="/entrar">Voltar ao login</Link></p>
      </div>
    </main>
  )
}

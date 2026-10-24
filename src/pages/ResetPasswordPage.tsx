import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './auth.css'

export function ResetPasswordPage() {
  const [ready, setReady] = useState(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    return hash.get('type') === 'recovery'
  })
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let active = true

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY' && active) {
          setReady(true)
        }
      }
    )

    // O link de recuperação pode criar uma sessão temporária.
    // O formulário só é liberado quando o fluxo é identificado.

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (senha !== confirmacao) {
      setMessage('As senhas não coincidem.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password: senha })

    if (error) {
      setMessage(error.message)
    } else {
      setSuccess(true)
      setMessage('Senha atualizada com sucesso.')
      await supabase.auth.signOut()
    }

    setLoading(false)
  }

  return (
    <main className="page-section auth-page">
      <div className="auth-panel">
        <h1>Redefinir senha</h1>

        {!ready && !success && (
          <p>Abra esta página pelo link enviado para seu e-mail de recuperação.</p>
        )}

        {ready && !success && (
          <form onSubmit={(event) => { void submit(event) }}>
            <label>
              Nova senha
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>

            <label>
              Confirmar nova senha
              <input
                type="password"
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>

            {message && <p role="status">{message}</p>}

            <button className="button-primary" type="submit" disabled={loading}>
              {loading ? 'Atualizando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        {success && <p role="status">{message}</p>}
        <p><Link to="/entrar">Ir para o login</Link></p>
      </div>
    </main>
  )
}

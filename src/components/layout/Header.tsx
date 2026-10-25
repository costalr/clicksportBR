import './header.css'
import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { NavLink } from 'react-router-dom'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'
import type { DarkTone, ThemePreference } from '../../hooks/useTheme'

interface HeaderProps {
  theme: ThemePreference
  onThemeChange: (value: ThemePreference) => void
  darkTone: DarkTone
  onDarkToneChange: (value: DarkTone) => void
}

export function Header({
  theme,
  onThemeChange,
  darkTone,
  onDarkToneChange,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  // clicksport:outside-menu:v1
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return

    function handleOutsidePointer(event: PointerEvent) {
      const target = event.target

      if (
        target instanceof Node &&
        headerRef.current &&
        !headerRef.current.contains(target)
      ) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsidePointer)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    let revision = 0

    async function verify(nextUser: User | null) {
      const currentRevision = ++revision

      if (!active) return

      setUser(nextUser)
      setIsAdmin(false)

      if (!nextUser) {
        setAuthReady(true)
        return
      }

      const { data, error } = await supabase.rpc('eh_administrador')

      if (!active || currentRevision !== revision) return

      setIsAdmin(!error && data === true)
      setAuthReady(true)
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (active) void verify(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Evita consultas assíncronas dentro do callback de autenticação.
        setTimeout(() => {
          if (active) void verify(session?.user ?? null)
        }, 0)
      }
    )

    return () => {
      active = false
      revision++
      listener.subscription.unsubscribe()
    }
  }, [])

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      closeMenu()
      navigate('/')
    }
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header ref={headerRef} className="app-header clicksport-glass-header">
      <div className="header-top">
        <NavLink
          to="/"
          className="brand"
          aria-label="ClicksportBR, início"
          onClick={closeMenu}
        >
          CLICKSPORT<span>BR</span>
        </NavLink>

        <div className="header-top-actions">
          <div className="header-theme">
            <ThemeSwitcher
              value={theme}
              onChange={onThemeChange}
              darkTone={darkTone}
              onDarkToneChange={onDarkToneChange}
            />
          </div>

          <button
            className="mobile-menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? 'Fechar' : 'Menu'}
          </button>

          {authReady && (user ? (
            <button
              className="logout-button"
              type="button"
              onClick={() => { void logout() }}
            >
              <span>Sair</span>
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          ) : (
            <Link
              to="/entrar"
              className="login-button"
              onClick={closeMenu}
            >
              <span>Entrar / Cadastrar</span>
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      <nav
        id="main-navigation"
        className={`main-nav ${menuOpen ? 'menu-open' : ''}`}
        aria-label="Navegação principal"
      >
        <NavLink to="/" end onClick={closeMenu}>
          Início
        </NavLink>
        <NavLink to="/desafios" onClick={closeMenu}>
          Desafios
        </NavLink>
        {authReady && user && !isAdmin && (
          <NavLink to="/minha-area" onClick={closeMenu}>
            Minha área
          </NavLink>
        )}
        {authReady && user && isAdmin && (
          <NavLink to="/admin" onClick={closeMenu}>
            Administração
          </NavLink>
        )}

        <div className="mobile-appearance">
          <div className="mobile-appearance-heading">
            <span aria-hidden="true">◐</span>
            <strong>Aparência</strong>
          </div>
          <ThemeSwitcher
            value={theme}
            onChange={onThemeChange}
            darkTone={darkTone}
            onDarkToneChange={onDarkToneChange}
          />
        </div>
</nav>
    </header>
  )
}

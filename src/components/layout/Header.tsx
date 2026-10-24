import './header.css'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { NavLink } from 'react-router-dom'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'
import type { ThemePreference } from '../../hooks/useTheme'

interface HeaderProps {
  theme: ThemePreference
  onThemeChange: (value: ThemePreference) => void
}

export function Header({ theme, onThemeChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) setUser(session?.user ?? null)
      }
    )

    return () => {
      active = false
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
    <header className="app-header">
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

          {user && (
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
          )}
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
        {!user && (
          <NavLink to="/entrar" onClick={closeMenu}>
            Entrar / Cadastrar
          </NavLink>
        )}
        <NavLink to="/minha-area" onClick={closeMenu}>
          Minha área
        </NavLink>
        <NavLink to="/admin" onClick={closeMenu}>
          Administração (demo)
        </NavLink>
      </nav>
    </header>
  )
}

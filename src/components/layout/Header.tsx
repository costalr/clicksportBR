import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'
import type { ThemePreference } from '../../hooks/useTheme'

interface HeaderProps {
  theme: ThemePreference
  onThemeChange: (value: ThemePreference) => void
}

export function Header({ theme, onThemeChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="app-header">
      <NavLink
        to="/"
        className="brand"
        aria-label="ClicksportBR, início"
        onClick={closeMenu}
      >
        CLICKSPORT<span>BR</span>
      </NavLink>

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

      <nav
        id="main-navigation"
        className={`main-nav ${menuOpen ? 'menu-open' : ''}`}
        aria-label="Navegação principal"
        key={location.pathname}
      >
        <NavLink to="/" end onClick={closeMenu}>
          Início
        </NavLink>
        <NavLink to="/desafios" onClick={closeMenu}>
          Desafios
        </NavLink>
      </nav>

      <ThemeSwitcher
        value={theme}
        onChange={onThemeChange}
      />
    </header>
  )
}

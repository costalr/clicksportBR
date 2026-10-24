import { NavLink } from 'react-router-dom'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'
import type { ThemePreference } from '../../hooks/useTheme'

interface HeaderProps {
  theme: ThemePreference
  onThemeChange: (value: ThemePreference) => void
}

export function Header({ theme, onThemeChange }: HeaderProps) {
  return (
    <header className="app-header">
      <NavLink to="/" className="brand" aria-label="ClicksportBR, início">
        CLICKSPORT<span>BR</span>
      </NavLink>

      <nav className="main-nav" aria-label="Navegação principal">
        <NavLink to="/" end>
          Início
        </NavLink>
        <NavLink to="/desafios">
          Desafios
        </NavLink>
      </nav>

      <ThemeSwitcher value={theme} onChange={onThemeChange} />
    </header>
  )
}

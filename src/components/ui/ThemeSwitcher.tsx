import type { ThemePreference } from '../../hooks/useTheme'

interface ThemeSwitcherProps {
  value: ThemePreference
  onChange: (value: ThemePreference) => void
}

export function ThemeSwitcher({
  value,
  onChange,
}: ThemeSwitcherProps) {
  return (
    <div className="theme-switcher">
      <label htmlFor="theme-preference">
        Aparência
      </label>

      <select
        id="theme-preference"
        value={value}
        onChange={(event) =>
          onChange(event.target.value as ThemePreference)
        }
      >
        <option value="auto">Automático</option>
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
      </select>
    </div>
  )
}

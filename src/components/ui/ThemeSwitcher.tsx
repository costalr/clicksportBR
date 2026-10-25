import type { DarkTone, ThemePreference } from '../../hooks/useTheme'

interface ThemeSwitcherProps {
  value: ThemePreference
  onChange: (value: ThemePreference) => void
  darkTone: DarkTone
  onDarkToneChange: (value: DarkTone) => void
}

export function ThemeSwitcher({
  value,
  onChange,
  darkTone,
  onDarkToneChange,
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

      <label className="dark-color-control" title="Escolher cor de fundo">
        <span className="sr-only">Cor de fundo do tema escuro</span>
        <input
          type="color"
          aria-label="Cor de fundo do tema escuro"
          value={darkTone}
          onChange={(event) => onDarkToneChange(event.target.value)}
        />
      </label>
    </div>
  )
}

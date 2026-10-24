import { useEffect, useState } from 'react'

export type ThemePreference = 'auto' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'clicksportbr-theme'

function readStoredTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)

    if (
      value === 'auto' ||
      value === 'light' ||
      value === 'dark'
    ) {
      return value
    }
  } catch {
    // O armazenamento pode estar indisponível.
  }

  return 'auto'
}

function systemPrefersDark(): boolean {
  return window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches
}

export function useTheme() {
  const [preference, setPreference] =
    useState<ThemePreference>(readStoredTheme)

  const [systemTheme, setSystemTheme] =
    useState<ResolvedTheme>(
      systemPrefersDark() ? 'dark' : 'light'
    )

  const resolvedTheme: ResolvedTheme =
    preference === 'auto' ? systemTheme : preference

  useEffect(() => {
    const media = window.matchMedia(
      '(prefers-color-scheme: dark)'
    )

    function handleChange(event: MediaQueryListEvent) {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', handleChange)

    return () => {
      media.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  function changeTheme(value: ThemePreference) {
    setPreference(value)

    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // A escolha continua válida durante a sessão.
    }
  }

  return {
    preference,
    resolvedTheme,
    changeTheme,
  }
}

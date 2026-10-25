import { useEffect, useState } from 'react'

export type ThemePreference = 'auto' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'
export type DarkTone = string

const STORAGE_KEY = 'clicksportbr-theme'
const DARK_TONE_KEY = 'clicksportbr-dark-tone'

function readStoredDarkTone(): DarkTone {
  try {
    const value = localStorage.getItem(DARK_TONE_KEY)
    if (value && /^#[0-9a-fA-F]{6}$/.test(value)) {
      return value
    }
  } catch {
    // Armazenamento indisponível.
  }
  return '#232323'
}

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
  const [darkTone, setDarkTone] =
    useState<DarkTone>(readStoredDarkTone)

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

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--custom-dark-background',
      darkTone
    )
  }, [darkTone])

  function changeDarkTone(value: DarkTone) {
    setDarkTone(value)
    try {
      localStorage.setItem(DARK_TONE_KEY, value)
    } catch {
      // A preferência continua válida nesta sessão.
    }
  }

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
    darkTone,
    changeDarkTone,
    changeTheme,
  }
}

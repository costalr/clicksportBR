import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { useTheme } from './hooks/useTheme'
import { HomePage } from './pages/HomePage'
import { ChallengesPage } from './pages/ChallengesPage'
import { ChallengeDetailsPage } from './pages/ChallengeDetailsPage'
import './App.css'

function App() {
  const { preference, changeTheme } = useTheme()

  return (
    <BrowserRouter>
      <div className="app">
        <Header theme={preference} onThemeChange={changeTheme} />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/desafios" element={<ChallengesPage />} />
          <Route
            path="/desafios/:slug"
            element={<ChallengeDetailsPage />}
          />
          <Route
            path="*"
            element={
              <main className="page-section empty-state">
                <h1>Página não encontrada</h1>
                <Link to="/" className="button-primary">
                  Voltar ao início
                </Link>
              </main>
            }
          />
        </Routes>

        <footer className="app-footer">
          <span>© ClicksportBR</span>
          <span>Plataforma em desenvolvimento</span>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App

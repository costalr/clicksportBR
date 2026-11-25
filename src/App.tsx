import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { AuthGate } from './features/auth/AuthGate'
import { AuthPage } from './pages/AuthPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { ParticipantDashboardPage } from './pages/ParticipantDashboardPage'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { useTheme } from './hooks/useTheme'
import { HomePage } from './pages/HomePage'
import { ChallengesPage } from './pages/ChallengesPage'
import { ChallengeDetailsPage } from './pages/ChallengeDetailsPage'
import { AdminChallengePreviewPage } from './pages/AdminChallengePreviewPage'
import './App.css'

function App() {
  const {
    preference,
    changeTheme,
    darkTone,
    changeDarkTone,
  } = useTheme()

  return (
    <BrowserRouter>
      <div className="app">
        <Header
          theme={preference}
          onThemeChange={changeTheme}
          darkTone={darkTone}
          onDarkToneChange={changeDarkTone}
        />

        <Routes>
          <Route path="/recuperar-senha" element={<PasswordRecoveryPage />} />
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          <Route path="/entrar" element={<AuthPage />} />
          <Route path="/admin" element={<AuthGate admin><AdminDashboardPage /></AuthGate>} />
          <Route
            path="/admin/preview/:slug"
            element={
              <AuthGate admin>
                <AdminChallengePreviewPage />
              </AuthGate>
            }
          />
          <Route path="/minha-area" element={<AuthGate><ParticipantDashboardPage /></AuthGate>} />
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

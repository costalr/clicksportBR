import { ThemeSwitcher } from './components/ui/ThemeSwitcher'
import { useTheme } from './hooks/useTheme'
import './App.css'

function App() {
  const { preference, resolvedTheme, changeTheme } = useTheme()

  return (
    <div className="app">
      <header className="app-header">
        <a href="/" className="brand">
          CLICKSPORT<span>BR</span>
        </a>

        <ThemeSwitcher
          value={preference}
          onChange={changeTheme}
        />
      </header>

      <main className="hero">
        <p className="eyebrow">
          DESAFIOS ESPORTIVOS VIRTUAIS
        </p>

        <h1>
          Seu próximo desafio começa aqui.
        </h1>

        <p className="hero-description">
          Escolha uma meta, participe de onde estiver
          e conquiste sua próxima medalha.
        </p>

        <div className="hero-actions">
          <button className="button-primary" type="button"
            onClick={() => {
              document.getElementById('status')?.scrollIntoView({
                behavior: 'smooth',
              })
            }}
          >
            Conhecer o projeto
          </button>
        </div>

        <section className="status-card" id="status">
          <h2>ClicksportBR em desenvolvimento</h2>
          <p>
            Estamos construindo a primeira versão
            da plataforma.
          </p>

          <p>
            Tema ativo: <strong>{resolvedTheme}</strong>
          </p>
        </section>
      </main>
    </div>
  )
}

export default App

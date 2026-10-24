# ClicksportBR — Arquitetura do frontend

**Status:** Em desenvolvimento

## Tecnologias

- React
- TypeScript
- Vite
- React Router
- CSS com tokens semânticos

## Organização

- `components/`: componentes compartilhados.
- `features/`: funcionalidades do domínio.
- `pages/`: páginas associadas às rotas.
- `hooks/`: lógica React reutilizável.
- `styles/`: estilos e tokens globais.

## Dados dos desafios

A interface utiliza `challengeService.ts` para obter
dados demonstrativos.

A fonte atual é `mockChallenges.ts`.

A integração futura com Supabase exigirá adaptar
o serviço para operações assíncronas e definir
estados de carregamento e erro.

## Navegação

Rotas públicas:
- `/`
- `/desafios`
- `/desafios/:slug`

Existe uma rota de página não encontrada.

## Temas

Preferências:
- Automático
- Claro
- Escuro

A escolha manual é armazenada localmente.

## Pendências

- Validar experiência em dispositivos móveis.
- Implementar testes automatizados.
- Integrar dados reais.
- Definir regras de autenticação e autorização.
- Revisar SEO para publicação.

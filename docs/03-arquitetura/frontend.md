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

A área pública consulta `public.desafios` por meio de
`challengeService.ts`. As consultas retornam somente
desafios publicados; listagem, página inicial e detalhes
tratam carregamento, erro e ausência de resultados.
`mockChallenges.ts` permanece preservado para testes.

O catálogo administrativo lê rascunhos e permite criar
e atualizar desafios, produtos e ofertas. A migration
`202610240017_admin_desafios.sql` precisa ser revisada e
aplicada manualmente; esta implementação não a executa.
Uploads, checkout, pagamentos e inscrições comerciais
permanecem fora do escopo.

## Navegação

Rotas públicas:
- `/`
- `/desafios`
- `/desafios/:slug`

`/admin` é protegida por `AuthGate admin` e inclui
visão geral, desafios, produtos, ofertas e comprovantes.
O fluxo existente de avaliação de comprovantes permanece
disponível nessa área.

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

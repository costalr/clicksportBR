# 10 — Reconciliação do repositório e migrações
**Data:** 25/10/2026 · **Base:** pacote `clicksportbr-auditoria.zip` (snapshot local, sem conexão com banco em execução)

## Método e limites
Leitura dos componentes React/TypeScript, documentação e 15 migrações SQL incluídos no pacote. Confirmação **estática**: uma definição em SQL não prova que foi aplicada ao banco em execução. Não foram executados testes, build, SQL nem verificações de RLS com usuários reais nesta auditoria.

## Evidências verificadas
| Domínio | Evidência no código | Situação |
|---|---|---|
| Stack | `package.json`: React 19, TypeScript, Vite 8, React Router 7, Supabase JS 2, Vitest | Confirmado no snapshot |
| Rotas | `src/App.tsx`: `/`, `/desafios`, `/desafios/:slug`, `/entrar`, `/admin`, `/minha-area`, recuperação/redefinição | Confirmado |
| Proteção de acesso | `src/features/auth/AuthGate.tsx`: sessão, RPC `eh_administrador` para `/admin` | Implementado no cliente; servidor deve ser testado |
| Catálogo | `challengeService.ts` usa `mockChallenges`, sem consulta à tabela `desafios` | Demo; não integrado ao banco |
| Detalhes | `ChallengeDetailsPage.tsx`: botão de inscrição desabilitado e aviso de dados demonstrativos | Inscrição comercial indisponível |
| Pré-visualização | `ChallengeCard.tsx` e `ChallengePreviewModal.tsx`: popup, expandir, Escape, foco, scroll lock | Implementado no código |
| Área participante | `ParticipantDashboardPage.tsx`: consulta `inscricoes`, `comprovantes`, `validacoes`, Storage | Implementado no código, depende de dados de teste |
| Área administrativa | `AdminDashboardPage.tsx`: revisão por RPC `avaliar_comprovante_detalhado`, rascunho em sessionStorage | Implementado no código |
| Banco | Migrações 001–015: oito tabelas de domínio, tabela `papeis_usuarios`, tabela `comprovante_versoes`, políticas e RPCs | Definido em migrações; aplicação não verificada |
| Testes | `filterChallenges.test.ts`, `validation.test.ts`, script `npm test` | Testes existentes; execução não verificada |

## Modelo físico definido pelas migrações
`public.perfis`, `public.desafios`, `public.inscricoes`, `public.pagamentos`, `public.comprovantes`, `public.validacoes`, `public.envios`, `public.reembolsos` (migração 001); `public.papeis_usuarios` (002); `public.comprovante_versoes` (007). RLS ativada nas tabelas de domínio; políticas, grants e funções evoluem nas migrações seguintes. A tabela `desafios` aceita apenas `modalidade='corrida'` e usa status `rascunho|publicado|encerrado`; o modelo TypeScript demonstrativo usa `Corrida|Caminhada` e `open|soon|closed`. **Esses modelos não são intercambiáveis sem adaptação.**

## Regras técnicas verificadas
- `pode_reenviar_comprovante` (migração 012) exige participante proprietário, inscrição ativa, comprovante rejeitado, validação de rejeição na **versão atual**, menos de três reenvios e até sete dias corridos após a rejeição. A política de Storage e outras funções evoluem nas migrações 013–014.
- `avaliar_comprovante_detalhado` (015) exige administrador autenticado, bloqueia avaliação de versão divergente, aceita aprovação ou rejeição e registra motivos padronizados `ilegivel`, `distancia`, `data`, `incompleto`, `duplicado`, `outro`. `outro` exige observação específica; aprovação não admite motivo de rejeição.
- O rascunho administrativo fica em `sessionStorage` com chave `clicksportbr:admin-review-draft:v1`, não no banco.
- O bucket mencionado nas políticas é `comprovantes-atividades`; confirmar privacidade, acesso e efetividade das políticas em execução.

## Divergências e ações
1. **P1 — Modalidade:** decisão de lançamento só com corrida × `mockChallenges.ts` contém `Desafio Movimento` (Caminhada) e `ChallengeCatalog.tsx` exibe filtro Caminhada. Remover/ocultar na experiência de lançamento quando aprovado, sem apagar histórico.
2. **P1 — Fonte de desafios:** catálogo e detalhes usam dados mock, enquanto administração/participante consultam tabelas reais. Planejar integração assíncrona, mapeamento de status e estado de carregamento/erro.
3. **P1 — Política de reenvio:** documentação anterior citava três reenvios mas não explicitava a janela técnica de sete dias e a versão atual. Atualizar regras e obter aprovação comercial.
4. **P1 — Fluxo comercial:** tabelas de pagamento, expedição e reembolso existem, mas não há evidência no frontend auditado de checkout, webhook de pagamentos ou inscrições comerciais ativas. Não anunciar disponibilidade.
5. **P2 — Documentação:** o `docs/README.md` anterior afirmava que o código não tinha sido disponibilizado; esta revisão substitui essa ressalva para o snapshot auditado.
6. **P2 — Higiene do repositório:** relatório Git fornecido mostrou alterações não commitadas, backups e migrações 004–015 ainda não rastreadas. Não usar `git add .` indiscriminadamente nem apagar backups sem conferência.

## Verificações pendentes antes de produção
- Conferir `supabase migration list` no projeto **ClicksportBR** e comparar com as 15 migrações versionadas; não executar `db reset` ou `db push` automaticamente.
- Testar RLS/RPC/Storage como anônimo, participante A, participante B e administrador, incluindo tentativa de acessar arquivo alheio.
- Executar `npm test`, `npm run lint`, `npm run build` e testes manuais desktop/mobile/temas.
- Confirmar regras comerciais com o responsável e documentar política de dados, cancelamento e pagamento.

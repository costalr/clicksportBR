# 04 — Arquitetura técnica, dados e segurança
**Versão 1.0 | 25/10/2026**

## Stack efetivamente adotada no desenvolvimento
- Frontend: **React 19, TypeScript, Vite, React Router, CSS e tokens de tema**.
- Backend: **Supabase** (Auth, PostgreSQL, Storage e funções RPC).
- Repositório local informado: `~/Documentos/Projetos/clicksportbr`.
- Separação de domínios: ClicksportBR é projeto independente; **não utilizar, alterar ou conectar o banco da FUNAI**.

## Organização conhecida
- `src/App.tsx`: composição das rotas.
- `src/pages/HomePage.tsx` e `src/pages/home.css`: landing e estilos.
- `src/pages/AuthPage.tsx`: autenticação e retorno pós-login.
- `src/pages/AdminDashboardPage.tsx`: navegação do CMS e avaliação administrativa.
- `src/features/auth/AuthGate.tsx`: proteção de rotas.
- `src/features/challenges/ChallengeCard.tsx`: cartão de desafio.
- `src/features/challenges/services/challengeService.ts`: consulta assíncrona de desafios publicados.
- `src/features/admin/`: formulários e serviços administrativos para desafios, produtos e ofertas.
- `src/styles/tokens.css`: temas.
- `supabase/migrations/`: histórico versionado de alterações do banco.

## Integração de desafios
O catálogo consulta `public.desafios` com `status='publicado'` e apresenta estados de carregamento, erro e vazio; `mockChallenges.ts` é mantido para testes. A migração `202610240017_admin_desafios.sql` adiciona políticas/grants de leitura administrativa, criação e atualização, sem exclusão. Ela está pendente de revisão e aplicação manual. O CMS não implementa checkout, pedidos, pagamentos, inscrições comerciais ou upload de imagens.

## Autorização
A RPC `eh_administrador` identifica o perfil administrativo. A UI diferencia menus, mas a segurança exige validação **também no banco/RPC**, com RLS e permissões revisadas. Rotas privadas usam `AuthGate`.

## Comprovantes
Existem fluxos de envio, reenvio, histórico de versões e revisão detalhada. A função administrativa conhecida é `avaliar_comprovante_detalhado`; a migração relatada mais recente é `supabase/migrations/202610240015_motivos_validacao.sql`. **Verificar o conteúdo da migração e as políticas RLS antes de escrever documentação de schema exato.**

## Sessão e rascunho
A chave de `sessionStorage` para rascunho de revisão é `clicksportbr:admin-review-draft:v1`. Não armazenar tokens, segredos ou dados sensíveis desnecessários nesse mecanismo. Limpar rascunhos ao trocar usuário, concluir ou cancelar revisão.

## Modelo conceitual
`perfis`, `desafios`, `inscricoes`, `pagamentos`, `comprovantes`, `validacoes`, `envios`, `reembolsos`. Este é o **modelo de referência documental** do ZIP, não uma listagem auditada das tabelas existentes. Relações esperadas: perfil/desafio → inscrições; inscrição → pagamentos/comprovantes/envios; comprovante → validações; pagamento → reembolsos.

## Requisitos para produção
1. Conferir esquema real, migrations, índices, constraints e funções `SECURITY DEFINER`.
2. Revisar políticas RLS por papel e por titularidade.
3. Validar Storage privado, tipos/tamanho de arquivo e URLs assinadas.
4. Separar ambientes e segredos, usar HTTPS e limitar permissões.
5. Garantir webhooks financeiros assinados, idempotência e reconciliação.
6. Implantar logs, backups, restauração testada e tratamento de falhas.
7. Auditar autorização em cada RPC, sem confiar em identificadores fornecidos pelo cliente.

## Adendo — esquema confirmado em arquivos SQL (25/10/2026)
As migrações 001–015 incluídas no pacote definem as tabelas `perfis`, `desafios`, `inscricoes`, `pagamentos`, `comprovantes`, `validacoes`, `envios`, `reembolsos`, `papeis_usuarios` e `comprovante_versoes`. A função `avaliar_comprovante_detalhado` está definida na migração 015; a elegibilidade de reenvio e a proteção do Storage evoluem até a 014. A inspeção foi **estática**, não é prova de aplicação no banco. Consulte `10-auditoria-codigo-migracoes-2026-10-25.md`.

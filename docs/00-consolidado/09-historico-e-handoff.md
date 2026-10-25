# 09 — Histórico, inventário e handoff
**Versão 1.0 | 25/10/2026**

## Linha do tempo conhecida
- **24/10/2026:** levantamento comercial de Marcelo; requisitos para corrida, comprovação, pagamento, kits e público.
- **24/10/2026:** migração relatada `202610240015_motivos_validacao.sql`; revisão administrativa estruturada.
- **24–25/10/2026:** implementação/validação de login por papel, painel de participante, histórico e reenvio de evidências, rascunho de revisão.
- **25/10/2026:** landing reformulada para direção editorial/glass, ajustes sucessivos de fluidez e bordas, tema claro, menu mobile, cards e botões; duas variantes visuais consideradas aprovadas.

## Invariantes para continuar o desenvolvimento
- Preservar o trabalho existente, migrações e backups.
- Não aplicar resets destrutivos nem alterar banco de outro projeto.
- Evitar alterar autenticação/admin ao mexer na landing.
- Mudanças devem ter escopo definido, backup, `tsc` e build.
- Não criar pagamento fictício nem mostrar compra funcional sem integração.
- Não afirmar que regras comerciais pendentes foram aprovadas.
- Preferir patches consolidados e verificações agrupadas.

## Próxima auditoria de código (para versão 1.1 documental)
Coletar, sem segredos:
- `git status --short`, `git log -5 --oneline`.
- `find src -type f` e `find supabase/migrations -type f`.
- `src/App.tsx`, serviços e tipos dos desafios, componentes de preview.
- Esquema SQL das migrations relevantes, RPCs e políticas RLS.
- `package.json` (scripts e dependências).
- Capturas de estados mobile/desktop e resultados de testes.

## Critério de versionamento
- **1.0:** consolidação do material disponível e histórico conhecido.
- **1.1:** reconciliação com repositório e banco reais; inventário exato de schemas, estados e contratos RPC.
- **2.0:** documentação comercial e operacional após aprovação de regras e implementação de checkout.

## Observação
Os documentos originais do `docs.zip` foram preservados para comparação histórica. Em caso de divergência entre uma proposta 0.1 e uma decisão confirmada posteriormente, priorizar a consolidação, mantendo pendências explícitas.

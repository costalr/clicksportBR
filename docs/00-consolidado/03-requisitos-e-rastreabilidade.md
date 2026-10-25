# 03 — Requisitos funcionais e não funcionais
**Versão 1.0 | 25/10/2026**

| ID | Requisito | Situação em 25/10 |
|---|---|---|
| RF-001 | Landing pública com CTA para desafios | Implementado, visual revisado |
| RF-002 | Catálogo de desafios de corrida | Implementado com dados demonstrativos |
| RF-003 | Detalhes individuais por slug | Implementado, conteúdo demo |
| RF-004 | Pré-visualização em modal e expansão | Implementação relatada e exibida nas telas |
| RF-005 | Cadastro/login/logout | Implementado segundo histórico |
| RF-006 | Recuperação e redefinição de senha | Implementado segundo histórico |
| RF-007 | Navegação e proteção por papel | Implementado segundo histórico |
| RF-008 | Área do participante | Implementado parcialmente |
| RF-009 | Upload de comprovante | Implementado segundo histórico |
| RF-010 | Reenvio e histórico de versões | Implementado segundo histórico |
| RF-011 | Rejeição estruturada e observações | Implementado segundo histórico |
| RF-012 | Avaliação administrativa detalhada | Implementado segundo histórico |
| RF-013 | Persistência temporária de rascunho de avaliação | Implementado segundo histórico |
| RF-014 | Gestão de desafios reais no admin | Previsto / não comprovado |
| RF-015 | Inscrição comercial individual | Previsto |
| RF-016 | PIX/cartão e checkout | Previsto |
| RF-017 | Confirmação confiável e idempotente do pagamento | Previsto |
| RF-018 | Pedidos, inscrição paga e histórico financeiro | Previsto |
| RF-019 | Cadastro de endereço/tamanho de camiseta | Pendente de regras |
| RF-020 | Gestão de premiações, expedição e rastreio | Previsto |
| RF-021 | Termos, privacidade e política comercial | Pendente de conteúdo/validação |
| RF-022 | Busca parcial no catálogo | Decidida como obrigatória; implementação a verificar |

## Requisitos não funcionais
- **RNF-001:** responsividade mobile-first; verificar tablets, celulares e ausência de overflow.
- **RNF-002:** autenticação Supabase, controle de acesso no backend e RLS; nunca depender somente do frontend.
- **RNF-003:** privacidade/LGPD; evidências privadas e retenção definida.
- **RNF-004:** idempotência financeira, verificação de webhook e proibição de armazenar dados completos de cartão.
- **RNF-005:** acessibilidade WCAG 2.2 AA como objetivo; foco, teclado, rótulos e modal acessível.
- **RNF-006:** desempenho em redes móveis, imagens/efeitos otimizados e respeito a `prefers-reduced-motion`.
- **RNF-007:** versionamento Git, migrações rastreáveis, documentação e testes.
- **RNF-008:** auditoria de decisões administrativas.
- **RNF-009:** ambientes isolados e nenhum dado real em testes indiscriminados.
- **RNF-010:** estratégia de backup e restauração a definir.
- **RNF-011:** temas claro/escuro/automático e persistência de preferência; validar contraste em ambos.

## Critério de leitura
'Implementado' reflete as sessões e capturas apresentadas, não auditoria do código. Antes de publicação, transformar requisitos em testes reprodutíveis e registrar evidências.

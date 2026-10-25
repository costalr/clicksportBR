# 08 — Backlog, decisões pendentes e riscos
**Versão 1.0 | 25/10/2026**

## Próxima fase sugerida
**P0 — Produto e regras**
- Aprovar regulamento, prazo de início, somatório de atividades, critérios de validação, número de reenvios, kits e política de reembolso.
- Substituir dados demo por desafios reais validados; definir fotos, descrições, valores e situação de inscrição.
- Revisar página de detalhes, modal e transição para inscrição.

**P1 — Fluxo comercial**
- Cadastro dos dados de inscrição e kit (endereço, camiseta).
- Seleção e integração de provedor PIX/cartão.
- Modelagem e implementação de pedido, pagamento, inscrição e webhook idempotente.
- Confirmação e histórico de inscrição; reconciliação financeira.

**P2 — Operação**
- Gestão administrativa de desafios e participantes.
- Elegibilidade, preparação, expedição e rastreio de kits.
- Notificações transacionais e suporte.

**P3 — Qualidade e publicação**
- Testes automatizados de autorização, uploads e pagamentos.
- Auditoria RLS/Storage/RPC e revisão de dados pessoais.
- Acessibilidade, SEO, desempenho e monitoramento.
- Backup, restore, ambientes e deploy.

## Registro de decisões
| ID | Assunto | Estado |
|---|---|---|
| DEC-001 | Lançar apenas corrida | Confirmada |
| DEC-002 | Metas individuais | Confirmada |
| DEC-003 | Upload de comprovantes no site | Confirmada |
| DEC-004 | Avaliação manual por gestor | Confirmada |
| DEC-005 | PIX e cartão | Confirmada como requisito; integração pendente |
| DEC-006 | Kit inclui medalha/camiseta/frete | Confirmada como composição; preço pendente |
| DEC-007 | Transportadora | Confirmada como modelo; contrato/processo pendente |
| DEC-008 | Administrador inicial: Marcelo | Confirmada no levantamento |
| DEC-009 | Prazo começa 'na inscrição' | Ambígua: pedido x pagamento |
| DEC-010 | Somar várias atividades | Pendente |
| DEC-011 | Momento do envio do kit | Pendente |
| DEC-012 | Política de reembolso | Pendente e requer análise jurídica |
| DEC-013 | Critérios de aprovação | Pendente |
| DEC-014 | Provedor de pagamento | Pendente |
| DEC-015 | Dados de endereço e camiseta | Pendente |
| DEC-016 | Limite técnico de 3 reenvios | Implementação relatada; aprovação comercial pendente |
| DEC-017 | Landing com temas claro/escuro e glass | Aprovada visualmente |
| DEC-018 | Botões de pré-visualização laranja | Aprovada visualmente |
| DEC-019 | Catálogo como destino padrão após login | Decidida/implementada |
| DEC-020 | Futuras modalidades sem exibição no MVP | Decidida |

## Riscos
1. Cobrar sem política de reembolso/arrependimento definida.
2. Confundir protótipo de desafios com ofertas reais.
3. Expor comprovantes pessoais por permissões inadequadas.
4. Divergência entre data de pagamento e início de prazo.
5. Atraso ou custo inesperado de kits e frete.
6. Crescimento de CSS com regras redundantes e regressões entre temas.
7. Considerar 'build passou' equivalente a teste de segurança.

# 02 — Regras de negócio consolidadas
**Versão 1.0 | 25/10/2026**

## Participação e inscrição
**RN-001 [decidida]** Cada inscrição vincula um participante a um desafio; não há carrinho de vários desafios no MVP.
**RN-002 [prevista]** Inscrição comercial somente é confirmada após confirmação autenticada do pagamento; retorno do navegador não é prova de pagamento.
**RN-003 [decidida]** Desafios possuem situação de publicação/disponibilidade; interface deve distinguir inscrições abertas e eventos em breve.
**RN-004 [confirmada]** Primeira modalidade comercial: corrida, com metas individuais.
**RN-005 [pendente]** Marco exato do prazo: Marcelo indicou 'na inscrição', mas deve definir se é pedido iniciado ou pagamento confirmado.

## Comprovação e avaliação
**RN-006 [confirmada]** O participante envia comprovantes pela plataforma; a atividade é registrada externamente, sem GPS próprio.
**RN-007 [implementação relatada]** Participante pode enviar e reenviar evidências, com histórico de versões e motivo estruturado da rejeição.
**RN-008 [implementação relatada]** Limite técnico atual de **3 reenvios** de comprovante. **Validar com Marcelo antes de tratar como regra comercial definitiva.**
**RN-009 [implementação relatada]** Administrador avalia comprovante com decisão, motivo padronizado de rejeição e observações; operação passa pela RPC `avaliar_comprovante_detalhado`.
**RN-010 [implementação relatada]** Rascunho da avaliação administrativa é guardado em `sessionStorage`, associado ao administrador, UUID do comprovante e versão; recuperado apenas se a evidência continuar pendente e na mesma versão; removido ao cancelar ou após decisão bem-sucedida. Trata-se de conveniência de UX, **não** de persistência definitiva da decisão.
**RN-011 [pendente]** Definir critérios objetivos de aceite, documentos válidos, prazo de envio, somatório de múltiplas atividades, contestação e eventuais exceções. **O suporte técnico a múltiplos comprovantes não significa autorização comercial para acumular distâncias.**
**RN-012 [requisito de segurança]** Participante não aprova a própria evidência; decisão requer autorização administrativa no servidor e trilha de auditoria.

## Pagamentos, kits e cancelamentos
**RN-013 [confirmada]** PIX e cartão são os meios pretendidos; provedor ainda não escolhido.
**RN-014 [confirmada]** Preço comercial deverá contemplar inscrição, medalha, camiseta e frete; valores e composição detalhada ainda pendentes.
**RN-015 [pendente]** Momento de liberação e envio do kit depende de confirmação do gestor.
**RN-016 [pendente / jurídico]** Política de arrependimento, cancelamento, não conclusão e reembolso não aprovada. Não automatizar perda de valor pago nem retenção sem análise jurídica e política publicada.
**RN-017 [confirmada]** Expedição prevista por transportadora contratada, com dados de endereço e camiseta a definir.

## Autenticação e acesso
**RN-018 [implementada segundo histórico]** Perfil administrativo é determinado por verificação de autorização (`eh_administrador`), não pela aparência do menu.
**RN-019 [implementada segundo histórico]** Administrador autenticado acessa `/admin`; participante usa `/minha-area` e, após login comum, é direcionado ao catálogo `/desafios`, salvo retorno válido.
**RN-020 [implementada segundo histórico]** Parâmetro de retorno pós-login deve rejeitar destinos inseguros e caminhos de autenticação/admin indevidos.

## Estado comercial x estado de comprovação
Não misturar estados de **desafio**, **inscrição**, **pagamento**, **comprovante**, **avaliação** e **expedição**. São processos diferentes. Nomes exatos de enums e transições do banco exigem inspeção das migrações.

## Itens que exigem assinatura/aceite do responsável
Prazo inicial, acúmulo de atividades, prazo e critérios de comprovação, número de reenvios, elegibilidade e expedição do kit, reembolso, preços, dados cadastrais e gateway.

## Adendo de reconciliação estática (25/10/2026)
**RN-021 [definida em SQL, aprovação comercial pendente]:** o reenvio de comprovante rejeitado depende de inscrição ativa, titularidade, validação da versão atual, menos de três reenvios e janela de **sete dias corridos** após a rejeição (`202610240012_seguranca_reenvio.sql`). A regra exige testes no banco instalado.

**RN-022 [divergência identificada]:** a modalidade comercial inicial e o banco (`public.desafios`) aceitam somente corrida, mas o catálogo demonstrativo inclui Caminhada e um filtro correspondente. Corrigir antes do lançamento.

**RN-023 [confirmada no frontend]:** a página de detalhes não habilita inscrições comerciais e informa que os dados são demonstrativos.

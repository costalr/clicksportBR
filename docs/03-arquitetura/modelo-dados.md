# ClicksportBR — Modelo de dados v1

## Entidades

- perfis: dados básicos do usuário autenticado.
- desafios: catálogo, metas, duração e publicação.
- inscricoes: vínculo entre atleta e desafio.
- pagamentos: tentativas e resultados financeiros.
- comprovantes: atividades enviadas pelo atleta.
- validacoes: histórico de decisões administrativas.
- envios: expedição e rastreamento dos kits.
- reembolsos: solicitações e resultados financeiros.

## Relacionamentos

- perfil 1:N inscricoes
- desafio 1:N inscricoes
- inscricao 1:N pagamentos
- inscricao 1:N comprovantes
- comprovante 1:N validacoes
- inscricao 1:N envios
- pagamento 1:N reembolsos

## Princípios

1. Identidades são vinculadas ao Supabase Auth.
2. Valores financeiros usam numeric(12,2).
3. Datas de eventos usam timestamptz.
4. Identificadores internos usam UUID.
5. Inscrição, pagamento, comprovação e envio
   possuem situações independentes.
6. Comprovantes são privados.
7. Arquivos ficam no Storage; o banco guarda
   somente caminhos e metadados.
8. Decisões administrativas devem ser auditáveis.
9. A aprovação de atividade não deve ocorrer
   diretamente pelo navegador do participante.
10. Pagamentos e reembolsos só podem ser
    confirmados por processos confiáveis no servidor.

## Segurança inicial

RLS habilitado nas tabelas.

Somente desafios publicados são públicos.

Perfis podem ser lidos e editados pelos próprios
titulares, mas a criação será feita por fluxo
controlado de autenticação.

As demais tabelas não terão políticas de acesso
direto nesta migração inicial.

Operações futuras deverão utilizar políticas
específicas e/ou funções de servidor autorizadas.

## Decisões pendentes

Consultar o levantamento de 24/10/2026.

Esta versão é uma proposta técnica, não a
aprovação definitiva das regras comerciais.

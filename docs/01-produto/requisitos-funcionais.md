# ClicksportBR — Requisitos Funcionais

**Versão:** 0.1
**Status:** Em elaboração
**Referência:** Documento de Visão do Produto

## RF-001 — Consultar desafios

O sistema deverá permitir que visitantes consultem
os desafios disponíveis para inscrição.

Prioridade: Alta.

Critérios de aceitação:
- Exibir nome, imagem e preço.
- Exibir modalidade e meta.
- Informar disponibilidade da inscrição.
- Permitir acessar detalhes do desafio.

## RF-002 — Visualizar detalhes do desafio

O sistema deverá apresentar informações detalhadas
sobre cada desafio.

Prioridade: Alta.

Critérios de aceitação:
- Exibir descrição e regras.
- Informar meta e prazo.
- Apresentar premiações.
- Informar preço e condições de participação.
- Permitir iniciar a inscrição.

## RF-003 — Cadastrar participante

O sistema deverá permitir o cadastro de atletas.

Prioridade: Alta.

Critérios de aceitação:
- Validar campos obrigatórios.
- Impedir duplicidade de contas pelo mesmo e-mail.
- Armazenar credenciais de forma segura.
- Informar erros de cadastro.

## RF-004 — Autenticar participante

O sistema deverá permitir autenticação e encerramento
seguro da sessão.

Prioridade: Alta.

## RF-005 — Realizar inscrição individual

O sistema deverá permitir a inscrição em um desafio
por transação.

Prioridade: Alta.

Critérios de aceitação:
- Identificar o participante autenticado.
- Associar a inscrição ao desafio escolhido.
- Registrar o valor aplicável à inscrição.
- Impedir confirmação sem pagamento aprovado.
- Evitar duplicidade por repetição da requisição.

## RF-006 — Processar pagamento

O sistema deverá integrar-se a um provedor de pagamentos.

Prioridade: Alta.

Critérios de aceitação:
- Criar uma cobrança vinculada à inscrição.
- Receber confirmação segura do provedor.
- Registrar o estado do pagamento.
- Evitar confirmações duplicadas.
- Não armazenar dados completos de cartões.

## RF-007 — Consultar inscrições

O participante deverá consultar suas inscrições
e respectivos estados.

Prioridade: Alta.

## RF-008 — Gerenciar desafios

O administrador deverá cadastrar, editar, publicar
e encerrar desafios.

Prioridade: Alta.

## RF-009 — Gerenciar participantes

O administrador deverá consultar participantes
e inscrições, respeitando suas permissões de acesso.

Prioridade: Alta.

## RF-010 — Registrar validação manual

O gestor deverá registrar o resultado da avaliação
do cumprimento da meta esportiva.

Prioridade: Alta.

Critérios de aceitação:
- Identificar participante e desafio.
- Registrar aprovação ou reprovação.
- Registrar data e responsável pela avaliação.
- Permitir consulta do resultado.

## RF-011 — Gerenciar premiações

O administrador deverá acompanhar a situação
das premiações e respectivas entregas.

Prioridade: Alta.

## Funcionalidades fora do MVP

- Carrinho com múltiplos produtos.
- Integração automática com Strava.
- Rastreamento GPS próprio.
- Rede social interna.
- Rankings automatizados.

## Histórico de versões

| Versão | Alteração |
|---|---|
| 0.1 | Especificação funcional preliminar |

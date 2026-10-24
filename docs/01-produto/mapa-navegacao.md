# ClicksportBR — Mapa de Navegação

**Versão:** 0.1
**Status:** Proposta preliminar
**Escopo:** MVP

## 1. Área pública

| Rota proposta | Página | Objetivo |
|---|---|---|
| / | Início | Apresentar a marca e os desafios |
| /desafios | Catálogo | Consultar desafios |
| /desafios/:slug | Detalhes | Conhecer e iniciar inscrição |
| /entrar | Login | Autenticar participante |
| /cadastro | Cadastro | Criar conta |
| /recuperar-senha | Recuperação | Recuperar acesso |
| /termos | Termos | Consultar condições de uso |
| /privacidade | Privacidade | Consultar política de dados |

## 2. Área do atleta

Requer autenticação.

| Rota proposta | Página | Objetivo |
|---|---|---|
| /minha-conta | Painel | Resumo da participação |
| /minha-conta/inscricoes | Inscrições | Consultar inscrições |
| /minha-conta/inscricoes/:id | Detalhes | Consultar situação |
| /minha-conta/perfil | Perfil | Gerenciar dados pessoais |

O pagamento poderá utilizar checkout externo.

## 3. Área administrativa

Requer autenticação e autorização administrativa.

| Rota proposta | Página | Objetivo |
|---|---|---|
| /admin | Painel | Visão geral |
| /admin/desafios | Desafios | Gerenciar desafios |
| /admin/inscricoes | Inscrições | Consultar inscrições |
| /admin/validacoes | Validações | Registrar resultados |
| /admin/premiacoes | Premiações | Acompanhar entregas |
| /admin/participantes | Participantes | Consultar atletas |

As operações de criação e edição poderão utilizar
formulários em páginas ou painéis, conforme o design.

## 4. Jornada principal

1. Visitante acessa o site.
2. Consulta o catálogo.
3. Seleciona um desafio.
4. Lê as regras e condições.
5. Faz login ou cadastro.
6. Inicia inscrição individual.
7. Realiza pagamento.
8. Sistema confirma o pagamento.
9. Participante acompanha sua inscrição.
10. Participante realiza o desafio.
11. Gestor valida o cumprimento da meta.
12. Sistema apresenta a situação da premiação.

## 5. Decisões pendentes

- Canal de envio de comprovantes.
- Regras de validação e contestação.
- Detalhes da logística de premiações.
- Provedor de pagamentos.
- Necessidade de funcionalidades adicionais
  na área do atleta.

## 6. Fora do MVP

- Carrinho de compras.
- Rede social interna.
- Rastreamento GPS próprio.
- Integração automática com Strava.
- Aplicativo móvel nativo.

# 05 — Jornadas, rotas e navegação
**Versão 1.0 | 25/10/2026**

## Rotas conhecidas em uso
| Caminho | Acesso | Comportamento |
|---|---|---|
| `/` | Público | Landing com hero, desafios, passos e CTA |
| `/desafios` | Público | Catálogo de corrida e cartões |
| `/desafios/:slug` | Público | Detalhes do desafio (demo) |
| `/entrar` | Público | Login e entrada de participante/admin |
| `/admin` | Admin | Revisão de comprovantes; protegido |
| `/minha-area` | Autenticado | Painel do participante; protegido |

Recuperação/redefinição de senha também existem no fluxo, mas **seus caminhos literais precisam ser confirmados em `App.tsx`**. Rotas `/cadastro`, `/minha-conta/*`, `/termos`, `/privacidade` e subrotas administrativas aparecem no plano 0.1 e **não devem ser apresentadas como implementadas sem inspeção**.

## Jornada pública atual
1. Abrir landing; alternar tema, usar menu responsivo.
2. Explorar cards no início ou no catálogo.
3. Acionar **Pré-visualizar** para abrir modal; ícone de expansão amplia a visualização.
4. Abrir página completa do evento por `/desafios/:slug`.
5. Autenticar-se, quando necessário, preservando retorno permitido.

## Jornada de participante atual
Login → catálogo (ou retorno seguro) → Minha área → envio de evidência → acompanhamento do estado → eventual rejeição com motivo → reenvio dentro do limite técnico → consulta do histórico.

## Jornada administrativa atual
Login → `/admin` → selecionar evidência pendente → avaliar com motivo/observação → confirmar → registrar decisão. Rascunho local pode ser restaurado ao voltar à área, somente para o mesmo usuário e versão pendente.

## Jornada comercial planejada (NÃO implementada integralmente)
Detalhe do desafio → login/cadastro → dados de inscrição e kit → checkout PIX/cartão → confirmação servidor → inscrição confirmada → prazo da atividade → comprovação → avaliação → elegibilidade e envio de kit.

## Comportamento de navegação/UX
- Menu mobile deve fechar ao clicar fora, ao navegar e em situações de fechamento explícito; confirmar teclado/Escape.
- Evitar links/botões interativos aninhados em cards.
- Modal deve suportar fechamento, foco e navegação por teclado.
- Não redirecionar participante comum ao painel administrativo.

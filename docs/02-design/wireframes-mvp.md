# ClicksportBR — Wireframes do MVP

**Versão:** 0.1
**Status:** Proposta inicial

## 1. Página inicial

Rota: /

### Estrutura

1. Cabeçalho com marca, desafios e acesso à conta.
2. Hero com mensagem principal e chamada para ação.
3. Fotografia esportiva de destaque.
4. Seção de desafios em destaque.
5. Seção explicativa "Como funciona".
6. Rodapé com informações institucionais e legais.

### Objetivo

Apresentar o ClicksportBR e direcionar visitantes
para o catálogo de desafios.

## 2. Catálogo de desafios

Rota: /desafios

### Estrutura

1. Título e descrição da página.
2. Busca por nome (obrigatória no MVP).
3. Filtro simples por modalidade (opcional).
4. Lista ou grade de desafios.
5. Estado vazio quando não houver resultados.

### Cartão de desafio

- Imagem.
- Nome.
- Modalidade.
- Meta ou resumo.
- Situação das inscrições.
- Acesso à página de detalhes.

## 3. Diretrizes gerais

- Adotar mobile-first obrigatoriamente.
- Utilizar hierarquia visual clara.
- Dar destaque às fotografias esportivas.
- Evitar elementos decorativos sem função.
- Garantir acessibilidade dos controles.
- Não apresentar valores ou condições fictícias
  na versão de produção.

## 4. Pendências

- Validação da identidade visual.
- Definição dos conteúdos reais.
- Disponibilização das fotografias.
- Definição dos elementos de premiação.
- Validação das regras dos desafios.

## 5. Decisões de UX confirmadas

### UX-001 — Mobile-first
Todas as interfaces deverão ser projetadas inicialmente
para dispositivos móveis, com adaptação progressiva
para telas maiores.

### UX-002 — Busca no catálogo
A busca por nome é obrigatória desde o MVP.

Deverá permitir buscas parciais, ignorar diferenças
entre letras maiúsculas e minúsculas e apresentar
um estado vazio quando não houver resultados.

### UX-003 — Aparência
A aplicação deverá oferecer temas claro e escuro.

O comportamento padrão será acompanhar a preferência
do sistema operacional.

O usuário poderá selecionar manualmente:
- Automático
- Claro
- Escuro

A preferência manual deverá persistir entre visitas.

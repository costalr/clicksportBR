# 06 — Design system e experiência
**Versão 1.0 | 25/10/2026 | Direção visual aprovada para a landing**

## Identidade consolidada
Visual esportivo editorial, forte hierarquia tipográfica, laranja vivo como cor de ação, fundos escuros azul-grafite ou claros gelo, gradientes atmosféricos, camadas translúcidas e glassmorphism pontual. O design busca movimento e fluidez, **sem excesso de caixas rígidas ou bordas decorativas**.

## Temas
- **Escuro:** base grafite, superfícies com transparência, texto claro, gradientes quentes discretos.
- **Claro:** base gelo/cinza muito claro, texto grafite, luz ambiente azul e coral; hero **claro**, não um bloco escuro desconectado da página.
- Preferência automática do sistema com escolha manual persistente; controle de aparência no header.
- O laranja deve preservar contraste e legibilidade nos dois temas.

## Componentes visuais em uso
- Header responsivo, marca com destaque em `BR`, navegação por papel, seletor de aparência e ação de sessão.
- Hero de largura ampla com headline **'A próxima conquista começa em você.'**, orbes, anéis, `RUN` contornado e cartões flutuantes.
- Grade de desafios: capa com quilometragem e órbita, informações do desafio, botão **Pré-visualizar** em laranja e botão de expansão secundário, harmonizado em altura/alinhamento.
- Modal glass de pré-visualização, com expansão para visualização ampliada.
- Seção **'Uma jornada. Quatro passos.'**.
- Manifesto **'NÃO É SOBRE SER O MAIS RÁPIDO. É SOBRE IR ALÉM.'** e grafismo `GO BEYOND`.
- CTA final **'Sua próxima linha de chegada começa aqui.'**.

## Decisões visuais ratificadas nas revisões
1. Reduzir/eliminar bordas que fragmentam a página; favorecer transições suaves e composição aberta.
2. Preservar proporções entre conteúdo do hero e cabeçalho: logo e navegação não devem parecer minúsculos.
3. Cards de desafio com botões laranja em ambos os temas; ícone de expansão alinhado verticalmente ao botão principal, sem altura excessiva.
4. Menu mobile fecha ao clicar fora, mantendo seleção de aparência e navegação utilizáveis.
5. Hero claro deve conversar com o restante da página, inclusive os cartões flutuantes.
6. A versão escura e a clara foram consideradas satisfatórias nas últimas capturas de 25/10/2026.

## Interação e acessibilidade
Revelação ao rolar via `IntersectionObserver`; movimento moderado; `prefers-reduced-motion`; hover não pode ser único indicador de ação; alvos de toque confortáveis; foco visível; Escape, gestão de foco e scroll lock em modais; navegação responsiva.

## Não congelar sem inspeção
Valores CSS exatos, breakpoints, ordem de cascata, variantes de botão e comportamento do modal devem ser conferidos no código. O CSS da landing recebeu várias rodadas de ajustes e pode conter sobreposições; recomendada futura refatoração **sem alteração visual**.

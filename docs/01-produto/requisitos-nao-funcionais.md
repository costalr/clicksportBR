# ClicksportBR — Requisitos Não Funcionais

**Versão:** 0.1
**Status:** Preliminar

## RNF-001 — Responsividade

A plataforma deverá funcionar em celulares, tablets
e computadores, priorizando a experiência mobile.

Critério de verificação:
- Navegação e formulários utilizáveis em telas pequenas.
- Ausência de rolagem horizontal indevida.

## RNF-002 — Segurança

A aplicação deverá utilizar HTTPS em produção,
autenticação segura e autorização por perfil.

Critérios de verificação:
- Usuários comuns não acessam funções administrativas.
- Segredos não são expostos no frontend.
- Dados recebidos pelo servidor são validados.

## RNF-003 — Privacidade e LGPD

A plataforma deverá tratar dados pessoais de acordo
com a legislação aplicável e princípios de minimização.

Critérios de verificação:
- Coletar somente dados necessários.
- Informar finalidades do tratamento.
- Restringir acesso a dados pessoais.
- Definir política de retenção e exclusão.

## RNF-004 — Integridade dos pagamentos

A confirmação de pagamentos deverá ocorrer por
mecanismo seguro do provedor contratado.

Critérios de verificação:
- Não confiar somente no retorno do navegador.
- Verificar a autenticidade das notificações.
- Processar notificações repetidas sem duplicar efeitos.

## RNF-005 — Acessibilidade

A interface deverá buscar conformidade com WCAG 2.2,
nível AA, nas funcionalidades do MVP.

Critérios de verificação:
- Navegação por teclado.
- Contraste adequado.
- Campos com rótulos e mensagens de erro.
- Indicadores visíveis de foco.

## RNF-006 — Desempenho

As páginas públicas deverão ser otimizadas para
conexões móveis e dispositivos intermediários.

Metas quantitativas serão definidas após a escolha
da arquitetura e das ferramentas de medição.

## RNF-007 — Manutenibilidade

O código deverá ser organizado em componentes e
módulos com responsabilidades identificáveis.

Critérios de verificação:
- Código versionado em Git.
- Configurações separadas do código.
- Documentação de instalação e execução.
- Testes para fluxos críticos.

## RNF-008 — Rastreabilidade

Operações administrativas relevantes deverão
registrar data, responsável e ação realizada.

## RNF-009 — Ambientes

Deverá existir separação entre desenvolvimento
e produção.

Dados reais de participantes não deverão ser usados
indiscriminadamente em testes.

## RNF-010 — Recuperação

Deverá existir uma estratégia documentada de backup
e recuperação dos dados persistidos.

Periodicidade, retenção e objetivos de recuperação
serão definidos durante a arquitetura.

## Histórico de versões

| Versão | Alteração |
|---|---|
| 0.1 | Definição inicial dos requisitos não funcionais |

## RNF-011 — Temas e preferências visuais

A aplicação deverá oferecer temas claro e escuro,
com seleção automática conforme a preferência
do dispositivo e possibilidade de escolha manual.

Critérios de verificação:
- Respeitar a preferência do sistema por padrão.
- Permitir alternar entre automático, claro e escuro.
- Preservar a preferência manual entre visitas.
- Manter contraste e legibilidade em ambos os temas.
- Evitar exibição inicial com tema incorreto.

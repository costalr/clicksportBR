# 07 — Testes e critérios de aceite
**Versão 1.0 | 25/10/2026**

## Evidências históricas
Durante o desenvolvimento foram relatados testes bem-sucedidos de:
- Navegação admin/participante e proteção de rotas.
- Retorno pós-login conforme perfil.
- Persistência/recuperação/limpeza do rascunho administrativo.
- Compilação TypeScript e build Vite após rodadas de alteração.
- Revisões visuais desktop claro/escuro e menu mobile por capturas de tela.

Esses registros **não substituem** execução atual de suíte automatizada nem testes em produção.

## Checklist de regressão antes de cada release
- [ ] `npx tsc --noEmit` sem erros.
- [ ] `npm run build` sem erros.
- [ ] Login/logout e recuperação de senha.
- [ ] Participante não acessa `/admin`, inclusive por URL direta.
- [ ] Admin consegue revisar pendência; participante não consegue chamar RPC de avaliação.
- [ ] Upload/reenvio respeita estado, versão e limite técnico.
- [ ] Rejeição mostra motivo/observação; histórico não perde versões.
- [ ] Rascunho só reaparece para usuário/evidência/versão corretos.
- [ ] Modal abre, fecha, expande, navega e respeita foco/Escape.
- [ ] Menu mobile fecha ao clicar fora e ao navegar.
- [ ] Tema claro, escuro e automático em desktop e celular.
- [ ] Botões de cards alinhados, sem overflow e com foco visível.
- [ ] Links/CTAs não levam a checkout inexistente.
- [ ] Storage e RLS impedem acesso cruzado a dados privados.
- [ ] Conteúdo demo está identificado e não promete contratação disponível.

## Testes futuros prioritários
Autorização de RPC com usuário malicioso; concorrência de reenvios; upload duplicado; falhas de rede; limites e formatos de arquivo; transições de estado; fluxo de pagamento com webhook repetido/atrasado; estorno; restauração de backup; acessibilidade e performance mobile.

## Critérios de lançamento comercial
Não publicar checkout até existir provedor configurado, confirmação idempotente, políticas comerciais e de privacidade aprovadas, dados reais de desafios, teste ponta a ponta, logística de kit e suporte operacional.

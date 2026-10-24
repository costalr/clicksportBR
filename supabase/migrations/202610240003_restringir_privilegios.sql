-- ClicksportBR: princípio do menor privilégio
-- Aplicação somente no banco local nesta rodada.

begin;

-- Remover permissões amplas herdadas ou previamente concedidas.
revoke all privileges on all tables in schema public
  from anon, authenticated;

revoke all privileges on all sequences in schema public
  from anon, authenticated;

-- Catálogo público: somente consulta.
grant select on public.desafios to anon, authenticated;

-- Participante autenticado.
grant select on public.perfis to authenticated;
grant update (nome, telefone) on public.perfis to authenticated;
grant select on public.inscricoes to authenticated;
grant select, insert on public.comprovantes to authenticated;

-- Consultas administrativas protegidas por RLS.
grant select on public.pagamentos to authenticated;
grant select on public.validacoes to authenticated;
grant select on public.envios to authenticated;
grant select on public.reembolsos to authenticated;

-- A tabela de papéis não precisa ser consultada diretamente
-- pelo frontend: a função eh_administrador faz a verificação.
-- Nenhum papel cliente recebe escrita nessa tabela.

commit;

-- ClicksportBR | 017 | Administração de desafios
-- Aplicação manual somente após revisão e aprovação operacional.
begin;

-- Preserva a consulta pública já restrita por RLS a desafios publicados.
-- Administradores autenticados também podem consultar rascunhos e encerrados.
create policy "Administradores leem todos os desafios"
on public.desafios
for select
to authenticated
using ((select public.eh_administrador()));

create policy "Administradores criam desafios"
on public.desafios
for insert
to authenticated
with check ((select public.eh_administrador()));

create policy "Administradores atualizam desafios"
on public.desafios
for update
to authenticated
using ((select public.eh_administrador()))
with check ((select public.eh_administrador()));

revoke insert, update, delete on public.desafios from anon, authenticated;
grant select on public.desafios to anon, authenticated;
grant insert, update on public.desafios to authenticated;

commit;

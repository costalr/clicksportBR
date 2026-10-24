-- ClicksportBR
-- Autenticação, perfis e permissões
-- Ambiente: desenvolvimento local

-- 1. Papéis administrativos separados do perfil público.
create table public.papeis_usuarios (
  usuario_id uuid primary key
    references auth.users(id) on delete cascade,
  papel text not null
    check (papel in ('administrador')),
  criado_em timestamptz not null default now()
);

alter table public.papeis_usuarios enable row level security;

-- Não criar políticas de escrita para usuários comuns.
-- A atribuição administrativa será feita por operação
-- controlada no banco.

-- 2. Criar perfil automaticamente após cadastro.
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
      'Participante'
    )
  );

  return new;
end;
$$;

create trigger criar_perfil_apos_cadastro
after insert on auth.users
for each row
execute function public.criar_perfil_novo_usuario();

-- 3. Verificação de papel administrativo.
create or replace function public.eh_administrador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.papeis_usuarios
    where usuario_id = (select auth.uid())
      and papel = 'administrador'
  );
$$;

revoke all on function public.eh_administrador() from public;
grant execute on function public.eh_administrador()
  to authenticated;

-- 4. Inscrições: leitura do próprio participante.
create policy "Participante le suas inscricoes"
on public.inscricoes
for select
to authenticated
using (
  perfil_id = (select auth.uid())
  or (select public.eh_administrador())
);

-- 5. Comprovantes: leitura do próprio participante.
create policy "Participante le seus comprovantes"
on public.comprovantes
for select
to authenticated
using (
  exists (
    select 1
    from public.inscricoes
    where inscricoes.id = comprovantes.inscricao_id
      and inscricoes.perfil_id = (select auth.uid())
  )
  or (select public.eh_administrador())
);

-- 6. Comprovantes: envio pelo próprio participante.
create policy "Participante registra comprovante"
on public.comprovantes
for insert
to authenticated
with check (
  status = 'pendente'
  and exists (
    select 1
    from public.inscricoes
    where inscricoes.id = inscricao_id
      and inscricoes.perfil_id = (select auth.uid())
      and inscricoes.status = 'ativa'
  )
);

-- 7. Validações: leitura administrativa.
create policy "Administrador le validacoes"
on public.validacoes
for select
to authenticated
using ((select public.eh_administrador()));

-- 8. Administração: leitura dos perfis.
create policy "Administrador le perfis"
on public.perfis
for select
to authenticated
using ((select public.eh_administrador()));

-- 9. Administração: leitura dos pagamentos.
create policy "Administrador le pagamentos"
on public.pagamentos
for select
to authenticated
using ((select public.eh_administrador()));

-- 10. Administração: leitura dos envios.
create policy "Administrador le envios"
on public.envios
for select
to authenticated
using ((select public.eh_administrador()));

-- 11. Administração: leitura dos reembolsos.
create policy "Administrador le reembolsos"
on public.reembolsos
for select
to authenticated
using ((select public.eh_administrador()));

-- 12. Permissões explícitas para o papel authenticated.
-- O RLS continuará decidindo quais linhas podem ser acessadas.
grant select on public.papeis_usuarios to authenticated;
grant select on public.perfis to authenticated;
grant select on public.inscricoes to authenticated;
grant select, insert on public.comprovantes to authenticated;
grant select on public.validacoes to authenticated;
grant select on public.pagamentos to authenticated;
grant select on public.envios to authenticated;
grant select on public.reembolsos to authenticated;

-- Não concedemos permissões de atualização administrativa
-- nesta etapa. Aprovações serão implementadas posteriormente
-- por uma operação transacional e auditável.

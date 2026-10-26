-- ClicksportBR | 016 | Catálogo comercial
-- Migration incremental. Não cria ofertas reais nem habilita checkout.
-- Revisar e aplicar SOMENTE em ambiente de desenvolvimento controlado.
begin;

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  descricao text,
  tipo text not null default 'fisico'
    check (tipo in ('fisico', 'digital')),
  imagem_caminho text,
  ativo boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.ofertas_desafio (
  id uuid primary key default gen_random_uuid(),
  desafio_id uuid not null references public.desafios(id) on delete restrict,
  nome text not null check (length(trim(nome)) > 0),
  descricao text,
  preco numeric(12,2) check (preco is null or preco >= 0),
  moeda text not null default 'BRL' check (moeda = 'BRL'),
  tipo_participacao text not null default 'a_definir'
    check (tipo_participacao in ('a_definir', 'digital', 'fisica', 'mista')),
  status text not null default 'rascunho'
    check (status in ('rascunho', 'publicada', 'suspensa', 'encerrada')),
  ordem_exibicao integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint oferta_publicada_tem_preco check (status <> 'publicada' or preco is not null)
);

create table public.oferta_itens (
  oferta_id uuid not null references public.ofertas_desafio(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  quantidade integer not null default 1 check (quantidade > 0),
  primary key (oferta_id, produto_id)
);

create index idx_ofertas_desafio_status on public.ofertas_desafio(desafio_id, status, ordem_exibicao);
create index idx_oferta_itens_produto on public.oferta_itens(produto_id);

alter table public.produtos enable row level security;
alter table public.ofertas_desafio enable row level security;
alter table public.oferta_itens enable row level security;

-- O público só vê ofertas publicadas de desafios publicados.
create policy "Ofertas publicadas do catalogo" on public.ofertas_desafio
  for select to anon, authenticated
  using (
    (status = 'publicada' and preco is not null and exists (
      select 1 from public.desafios d
      where d.id = desafio_id and d.status = 'publicado'
    ))
  );

-- Itens só são públicos quando vinculados a uma oferta visível.
create policy "Itens de ofertas visiveis" on public.oferta_itens
  for select to anon, authenticated
  using (
    exists (select 1 from public.ofertas_desafio o where o.id = oferta_id)
  );

-- Produtos ativos podem ser consultados no catálogo.
-- A visibilidade dos itens de cada kit depende da oferta publicada.
-- Evita dependência circular entre as políticas RLS.
create policy "Produtos ativos do catalogo" on public.produtos
  for select to anon, authenticated
  using (ativo);

-- Escrita somente por administradores autenticados.
create policy "Administradores gerenciam produtos" on public.produtos
  for all to authenticated
  using ((select public.eh_administrador()))
  with check ((select public.eh_administrador()));

create policy "Administradores gerenciam ofertas" on public.ofertas_desafio
  for all to authenticated
  using ((select public.eh_administrador()))
  with check ((select public.eh_administrador()));

create policy "Administradores gerenciam itens" on public.oferta_itens
  for all to authenticated
  using ((select public.eh_administrador()))
  with check ((select public.eh_administrador()));

grant select on public.produtos, public.ofertas_desafio, public.oferta_itens to anon, authenticated;
grant insert, update, delete on public.produtos, public.ofertas_desafio, public.oferta_itens to authenticated;

comment on column public.desafios.preco is 'Campo legado; futuras opções comerciais usam ofertas_desafio.preco.';

commit;

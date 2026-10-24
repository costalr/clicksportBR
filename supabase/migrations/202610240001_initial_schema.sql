-- ClicksportBR: modelo inicial
-- Aplicar somente em ambiente novo de desenvolvimento.
-- Não contém dados reais nem configura pagamentos.

create extension if not exists pgcrypto;

create table public.perfis (
  id uuid primary key references auth.users(id)
    on delete cascade,
  nome text not null,
  telefone text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.desafios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  descricao text,
  modalidade text not null default 'corrida'
    check (modalidade in ('corrida')),
  distancia_km numeric(8,2) not null
    check (distancia_km > 0),
  duracao_dias integer not null
    check (duracao_dias > 0),
  preco numeric(12,2)
    check (preco is null or preco >= 0),
  status text not null default 'rascunho'
    check (status in (
      'rascunho', 'publicado', 'encerrado'
    )),
  criado_em timestamptz not null default now()
);

create table public.inscricoes (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null
    references public.perfis(id),
  desafio_id uuid not null
    references public.desafios(id),
  status text not null default 'pendente'
    check (status in (
      'pendente', 'ativa', 'concluida',
      'nao_concluida', 'cancelada'
    )),
  inscrito_em timestamptz not null default now(),
  inicio_prazo_em timestamptz,
  fim_prazo_em timestamptz,
  check (
    fim_prazo_em is null
    or inicio_prazo_em is null
    or fim_prazo_em > inicio_prazo_em
  )
);

create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  inscricao_id uuid not null
    references public.inscricoes(id),
  provedor text,
  referencia_externa text,
  metodo text
    check (metodo in ('pix', 'cartao')),
  valor numeric(12,2) not null
    check (valor >= 0),
  status text not null default 'pendente'
    check (status in (
      'pendente', 'aprovado', 'recusado',
      'cancelado', 'estornado'
    )),
  criado_em timestamptz not null default now(),
  confirmado_em timestamptz,
  unique (provedor, referencia_externa)
);

create table public.comprovantes (
  id uuid primary key default gen_random_uuid(),
  inscricao_id uuid not null
    references public.inscricoes(id),
  caminho_arquivo text not null,
  distancia_informada_km numeric(8,2)
    check (
      distancia_informada_km is null
      or distancia_informada_km > 0
    ),
  data_atividade date,
  status text not null default 'pendente'
    check (status in (
      'pendente', 'aprovado', 'rejeitado'
    )),
  enviado_em timestamptz not null default now()
);

create table public.validacoes (
  id uuid primary key default gen_random_uuid(),
  comprovante_id uuid not null
    references public.comprovantes(id),
  gestor_id uuid not null
    references public.perfis(id),
  decisao text not null
    check (decisao in ('aprovado', 'rejeitado')),
  justificativa text,
  criado_em timestamptz not null default now()
);

create table public.envios (
  id uuid primary key default gen_random_uuid(),
  inscricao_id uuid not null
    references public.inscricoes(id),
  transportadora text,
  codigo_rastreio text,
  status text not null default 'pendente'
    check (status in (
      'pendente', 'preparando', 'enviado',
      'entregue', 'devolvido'
    )),
  enviado_em timestamptz,
  entregue_em timestamptz
);

create table public.reembolsos (
  id uuid primary key default gen_random_uuid(),
  pagamento_id uuid not null
    references public.pagamentos(id),
  valor numeric(12,2) not null
    check (valor > 0),
  status text not null default 'solicitado'
    check (status in (
      'solicitado', 'em_analise',
      'aprovado', 'negado', 'processado'
    )),
  motivo text,
  referencia_externa text,
  criado_em timestamptz not null default now(),
  processado_em timestamptz
);

create index idx_inscricoes_perfil
  on public.inscricoes(perfil_id);

create index idx_inscricoes_desafio
  on public.inscricoes(desafio_id);

create index idx_pagamentos_inscricao
  on public.pagamentos(inscricao_id);

create index idx_comprovantes_inscricao
  on public.comprovantes(inscricao_id);

create index idx_validacoes_comprovante
  on public.validacoes(comprovante_id);

create index idx_envios_inscricao
  on public.envios(inscricao_id);

create index idx_reembolsos_pagamento
  on public.reembolsos(pagamento_id);

-- Segurança: nenhuma tabela fica aberta por padrão.

alter table public.perfis enable row level security;
alter table public.desafios enable row level security;
alter table public.inscricoes enable row level security;
alter table public.pagamentos enable row level security;
alter table public.comprovantes enable row level security;
alter table public.validacoes enable row level security;
alter table public.envios enable row level security;
alter table public.reembolsos enable row level security;

-- Catálogo público: apenas desafios publicados.

create policy "Leitura de desafios publicados"
on public.desafios
for select
to anon, authenticated
using (status = 'publicado');

-- Perfil: acesso somente do próprio usuário.

create policy "Ler proprio perfil"
on public.perfis
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Atualizar proprio perfil"
on public.perfis
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- As demais operações serão liberadas somente
-- após implementar autenticação, autorização,
-- fluxos administrativos e serviços de pagamento.

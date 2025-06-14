create table if not exists public.reservas (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text not null,
  telefone text not null,
  data date not null,
  horario time not null,
  status text not null default 'pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar políticas de segurança
alter table public.reservas enable row level security;

create policy "Permitir leitura para todos os usuários autenticados"
  on public.reservas for select
  to authenticated
  using (true);

create policy "Permitir inserção para todos os usuários autenticados"
  on public.reservas for insert
  to authenticated
  with check (true);

create policy "Permitir atualização para todos os usuários autenticados"
  on public.reservas for update
  to authenticated
  using (true)
  with check (true);

-- Criar função para atualizar o updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Criar trigger para atualizar o updated_at
create trigger handle_updated_at
  before update on public.reservas
  for each row
  execute function public.handle_updated_at(); 
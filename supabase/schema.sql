-- ============================================================================
-- Shop List — schema completo para Supabase.
-- Ejecuta esto entero en: Dashboard > SQL Editor > New query > Run.
--
-- Modelo:
--   profiles        -> 1 fila por usuario (espejo de auth.users, datos públicos)
--   groups          -> una familia/evento ("Casa", "Cumpleaños de Ana")
--   group_members   -> quién pertenece a qué grupo (tabla puente N:M)
--   shopping_lists  -> un grupo puede tener varias listas ("Compra semanal", "Barbacoa")
--   list_items      -> los productos de cada lista
--
-- Orden del archivo (importa para que no fallen las referencias):
--   1) extensiones
--   2) TODAS las tablas (sin políticas todavía)
--   3) función helper is_group_member() (debe existir antes que las políticas)
--   4) Row Level Security + políticas de todas las tablas
--   5) funciones + triggers
--   6) realtime
--
-- Seguridad: Row Level Security (RLS) en todas las tablas. Un usuario solo
-- puede leer/escribir datos de grupos a los que pertenece. Unirse a un grupo
-- se hace por código de invitación a través de una función RPC, nunca
-- insertando directamente en group_members.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) extensiones
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 2) tablas (todas primero, para que las FK entre ellas siempre existan)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique not null,
  display_name text,
  created_at   timestamptz not null default now()
);

create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  created_by  uuid not null references public.profiles (id),
  created_at  timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id  uuid not null references public.groups (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  role      text not null default 'member', -- 'admin' | 'member'
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.shopping_lists (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups (id) on delete cascade,
  name       text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.list_items (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references public.shopping_lists (id) on delete cascade,
  name       text not null,
  quantity   text,
  is_checked boolean not null default false,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3) función helper para políticas (tiene que existir ANTES de las políticas
-- que la usan, por eso va antes de la sección 4).
--
-- ¿Por qué no un simple "exists (select 1 from group_members where ...)"
-- dentro de la propia policy de group_members? Porque esa subquery consulta
-- la MISMA tabla sobre la que corre la policy: Postgres necesita volver a
-- aplicar la policy de group_members para poder resolver la subquery, que a
-- su vez la vuelve a necesitar... -> "infinite recursion detected in policy
-- for relation group_members". Al mover la consulta a una función
-- SECURITY DEFINER, esa consulta interna corre con los privilegios del
-- dueño de la función (no del usuario), y por defecto el dueño de una tabla
-- no está sujeto a las policies de RLS de esa tabla, así que la subquery no
-- vuelve a disparar la policy y la recursión desaparece.
-- ----------------------------------------------------------------------------
create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;

grant execute on function public.is_group_member(uuid) to authenticated;

-- Igual que is_group_member, pero solo true si además tu role es 'admin'.
-- La usan las policies que dejan expulsar miembros y borrar listas.
create or replace function public.is_group_admin(p_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_group_admin(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 4) Row Level Security + políticas
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.list_items enable row level security;

-- Cada policy se borra antes de crearse (drop if exists) para que este
-- script se pueda re-ejecutar entero las veces que haga falta sin petar
-- por "policy already exists".

-- profiles: lectura pública (para ver nombres de otros miembros), escritura solo de mi fila.
drop policy if exists "profiles: cualquiera autenticado puede leer perfiles" on public.profiles;
create policy "profiles: cualquiera autenticado puede leer perfiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles: solo puedo actualizar mi propio perfil" on public.profiles;
create policy "profiles: solo puedo actualizar mi propio perfil"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- groups: veo grupos de los que soy miembro, o que he creado yo mismo.
-- El "o creado por mí" es necesario aparte de "soy miembro": al hacer
-- INSERT ... RETURNING (nuestro .insert().select().single()), Postgres
-- comprueba esta misma policy de SELECT para decidir si te devuelve la fila
-- recién insertada. La fila en group_members que te añade como miembro la
-- crea un trigger AFTER INSERT sobre groups, así que en el instante en que
-- se evalúa el RETURNING todavía no eres "miembro" según group_members.
-- Sin esta condición, crear un grupo devuelve 403 aunque el INSERT en sí
-- sea válido.
drop policy if exists "groups: ver solo grupos de los que soy miembro" on public.groups;
create policy "groups: ver solo grupos de los que soy miembro"
  on public.groups for select
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id and gm.user_id = auth.uid()
    )
  );

drop policy if exists "groups: cualquier usuario autenticado puede crear un grupo" on public.groups;
create policy "groups: cualquier usuario autenticado puede crear un grupo"
  on public.groups for insert
  to authenticated
  with check (created_by = auth.uid());

-- group_members: veo miembros de mis propios grupos, puedo salirme de un grupo.
-- OJO: no hay policy de INSERT aquí a propósito. Unirse a un grupo se hace
-- solo a través de join_group_by_invite_code() (más abajo), que corre como
-- SECURITY DEFINER y así evita que cualquiera se meta en cualquier grupo
-- insertando filas a mano.
drop policy if exists "group_members: ver miembros de mis propios grupos" on public.group_members;
create policy "group_members: ver miembros de mis propios grupos"
  on public.group_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_group_member(group_id)
  );

-- Salir del grupo tú mismo, O ser expulsado por un admin del grupo.
drop policy if exists "group_members: puedo salirme de un grupo" on public.group_members;
drop policy if exists "group_members: salir del grupo o ser expulsado por un admin" on public.group_members;
create policy "group_members: salir del grupo o ser expulsado por un admin"
  on public.group_members for delete
  to authenticated
  using (user_id = auth.uid() or public.is_group_admin(group_id));

-- shopping_lists: cualquier miembro ve/crea listas; solo un admin del grupo puede borrarlas.
drop policy if exists "shopping_lists: acceso si soy miembro del grupo" on public.shopping_lists;

drop policy if exists "shopping_lists: ver si soy miembro del grupo" on public.shopping_lists;
create policy "shopping_lists: ver si soy miembro del grupo"
  on public.shopping_lists for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = shopping_lists.group_id and gm.user_id = auth.uid()
    )
  );

drop policy if exists "shopping_lists: crear si soy miembro del grupo" on public.shopping_lists;
create policy "shopping_lists: crear si soy miembro del grupo"
  on public.shopping_lists for insert
  to authenticated
  with check (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = shopping_lists.group_id and gm.user_id = auth.uid()
    )
  );

drop policy if exists "shopping_lists: solo un admin del grupo puede borrar listas" on public.shopping_lists;
create policy "shopping_lists: solo un admin del grupo puede borrar listas"
  on public.shopping_lists for delete
  to authenticated
  using (public.is_group_admin(group_id));

-- list_items: acceso completo si soy miembro del grupo dueño de la lista del item.
drop policy if exists "list_items: acceso si soy miembro del grupo dueño de la lista" on public.list_items;
create policy "list_items: acceso si soy miembro del grupo dueño de la lista"
  on public.list_items for all
  to authenticated
  using (
    exists (
      select 1
      from public.shopping_lists sl
      join public.group_members gm on gm.group_id = sl.group_id
      where sl.id = list_items.list_id and gm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.shopping_lists sl
      join public.group_members gm on gm.group_id = sl.group_id
      where sl.id = list_items.list_id and gm.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 5) funciones + triggers
-- ----------------------------------------------------------------------------

-- Se crea automáticamente un profile cuando alguien se registra en Supabase Auth.
-- El username viene de options.data.username en supabase.auth.signUp(...).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Al crear un grupo, el creador se añade automáticamente como admin.
create or replace function public.handle_new_group()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.created_by, 'admin')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_group_created on public.groups;
create trigger on_group_created
  after insert on public.groups
  for each row execute function public.handle_new_group();

-- Unirse a un grupo usando su código de invitación.
-- security definer: puede leer "groups" aunque el que llama todavía no sea
-- miembro (si no, nunca podría encontrar el grupo al que quiere unirse).
create or replace function public.join_group_by_invite_code(p_code text)
returns public.groups
language plpgsql
security definer set search_path = public
as $$
declare
  g public.groups;
begin
  select * into g from public.groups where invite_code = p_code;

  if not found then
    raise exception 'Código de invitación no válido';
  end if;

  insert into public.group_members (group_id, user_id)
  values (g.id, auth.uid())
  on conflict do nothing;

  return g;
end;
$$;

grant execute on function public.join_group_by_invite_code(text) to authenticated;

-- ----------------------------------------------------------------------------
-- 6) Realtime: para que los cambios en list_items lleguen en vivo a todos los
-- miembros del grupo (ver src/features/lists/hooks.js -> useListItemsRealtime).
-- Si tu proyecto no tiene ya la publicación por defecto, esto la crea.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'list_items'
  ) then
    alter publication supabase_realtime add table public.list_items;
  end if;
end $$;

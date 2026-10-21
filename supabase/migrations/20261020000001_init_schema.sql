-- ThumbStop initial schema, Row Level Security and storage.
-- Run once in Supabase Dashboard > SQL Editor (see docs/SETUP-BANGLA.md).

-- ============ Types ============
create type public.user_role as enum ('admin', 'staff', 'client');
create type public.project_status as enum ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled');
create type public.invoice_status as enum ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'cancelled');
create type public.enquiry_status as enum ('new', 'contacted', 'qualified', 'won', 'lost', 'spam');

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============ Profiles (1:1 with auth.users) ============
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role public.user_role not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index profiles_email_key on public.profiles (lower(email));
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role helpers (security definer so they can read profiles without recursion)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin', 'staff') from public.profiles where id = auth.uid()), false)
$$;

-- Every new signup becomes a CLIENT. Role is never read from user-supplied metadata.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only an administrator can change another user's role.
create or replace function public.set_user_role(target uuid, new_role public.user_role) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Only an administrator can change roles';
  end if;
  if target = auth.uid() then
    raise exception 'You cannot change your own role';
  end if;
  update public.profiles set role = new_role where id = target;
end $$;
revoke all on function public.set_user_role(uuid, public.user_role) from public, anon;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;

-- ============ Core tables ============
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  company text,
  email text,
  phone text,
  address text,
  notes text,
  archived_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger clients_updated before update on public.clients
  for each row execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  summary text not null,
  deliverables text[] not null default '{}',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger services_updated before update on public.services
  for each row execute function public.set_updated_at();

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services (id) on delete set null,
  name text not null,
  description text,
  price_bdt numeric(12, 2) check (price_bdt is null or price_bdt >= 0),
  features text[] not null default '{}',
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index packages_service_idx on public.packages (service_id);
create trigger packages_updated before update on public.packages
  for each row execute function public.set_updated_at();

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  service_id uuid references public.services (id) on delete set null,
  title text not null check (char_length(title) between 2 and 160),
  description text,
  status public.project_status not null default 'planning',
  progress int not null default 0 check (progress between 0 and 100),
  start_date date,
  deadline date,
  archived_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_client_idx on public.projects (client_id);
create index projects_status_idx on public.projects (status);
create trigger projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  due_date date,
  is_done boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index milestones_project_idx on public.milestones (project_id);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('file', 'link')),
  storage_path text,
  url text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check ((kind = 'file' and storage_path is not null) or (kind = 'link' and url is not null))
);
create index deliverables_project_idx on public.deliverables (project_id);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  service text,
  budget text,
  details text not null,
  status public.enquiry_status not null default 'new',
  ip_hash text,
  created_at timestamptz not null default now()
);
create index enquiries_status_idx on public.enquiries (status, created_at desc);
create index enquiries_ip_idx on public.enquiries (ip_hash, created_at);

-- ============ Invoices & payments ============
create sequence public.invoice_number_seq start 1;
grant usage on sequence public.invoice_number_seq to authenticated;

create or replace function public.next_invoice_number() returns text
language sql as $$
  select 'TS-' || to_char(now() at time zone 'Asia/Dhaka', 'YYYY') || '-' ||
         lpad(nextval('public.invoice_number_seq')::text, 4, '0')
$$;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default public.next_invoice_number(),
  client_id uuid not null references public.clients (id) on delete restrict,
  project_id uuid references public.projects (id) on delete set null,
  status public.invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date,
  currency text not null default 'BDT' check (currency = 'BDT'),
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invoices_client_idx on public.invoices (client_id);
create index invoices_status_idx on public.invoices (status);
create trigger invoices_updated before update on public.invoices
  for each row execute function public.set_updated_at();

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity numeric(10, 2) not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  amount numeric(12, 2) generated always as (round(quantity * unit_price, 2)) stored
);
create index invoice_items_invoice_idx on public.invoice_items (invoice_id);

create or replace function public.recalc_invoice_total() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  inv uuid;
  s numeric;
begin
  if tg_op = 'DELETE' then inv := old.invoice_id; else inv := new.invoice_id; end if;
  select coalesce(sum(amount), 0) into s from public.invoice_items where invoice_id = inv;
  update public.invoices set subtotal = s, total = s where id = inv;
  return null;
end $$;
create trigger invoice_items_recalc after insert or update or delete on public.invoice_items
  for each row execute function public.recalc_invoice_total();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  tran_id text not null unique,
  provider text not null default 'sslcommerz',
  method text not null check (method in ('online', 'cash', 'bank', 'bkash_manual', 'nagad_manual')),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'BDT',
  status public.payment_status not null default 'pending',
  val_id text,
  raw jsonb,
  paid_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index payments_invoice_idx on public.payments (invoice_id);
-- A provider validation id can only ever settle one payment (blocks duplicate processing).
create unique index payments_val_id_key on public.payments (val_id) where val_id is not null;

create or replace function public.refresh_invoice_payment_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_paid numeric;
  v_total numeric;
  v_status public.invoice_status;
begin
  select total, status into v_total, v_status from public.invoices where id = new.invoice_id;
  if v_status in ('draft', 'cancelled') then return null; end if;
  select coalesce(sum(amount), 0) into v_paid
    from public.payments where invoice_id = new.invoice_id and status = 'paid';
  if v_total > 0 and v_paid >= v_total then
    update public.invoices set status = 'paid' where id = new.invoice_id;
  elsif v_paid > 0 then
    update public.invoices set status = 'partial'
      where id = new.invoice_id and status in ('sent', 'overdue', 'partial');
  end if;
  return null;
end $$;
create trigger payments_refresh_invoice after insert or update of status, amount on public.payments
  for each row execute function public.refresh_invoice_payment_status();

-- Called ONLY by the server (service role) after the provider has verified the payment.
-- Idempotent: processing the same transaction twice does nothing the second time.
create or replace function public.record_verified_payment(
  p_tran_id text, p_val_id text, p_amount numeric, p_raw jsonb
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_pay public.payments%rowtype;
begin
  select * into v_pay from public.payments where tran_id = p_tran_id for update;
  if not found then return 'not_found'; end if;
  if v_pay.status = 'paid' then return 'already_processed'; end if;
  if abs(v_pay.amount - p_amount) > 0.01 then return 'amount_mismatch'; end if;
  update public.payments
    set status = 'paid', val_id = p_val_id, raw = p_raw, paid_at = now()
    where id = v_pay.id;
  return 'ok';
end $$;
revoke all on function public.record_verified_payment(text, text, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.record_verified_payment(text, text, numeric, jsonb) to service_role;

-- ============ Misc tables ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_log_created_idx on public.activity_log (created_at desc);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text,
  summary text,
  image_path text,
  link text,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  quote text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- ============ Row Level Security ============
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.deliverables enable row level security;
alter table public.enquiries enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;

-- Helpers: the signed-in client's own records
create or replace function public.my_client_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from public.clients where profile_id = auth.uid()
$$;

create or replace function public.my_project_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from public.projects
  where client_id in (select public.my_client_ids()) and archived_at is null
$$;

-- Profiles: see yourself (staff see all). Users may edit ONLY name and phone.
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Staff-managed tables: staff read/write, only admins delete.
do $$
declare t text;
begin
  foreach t in array array['clients', 'projects', 'milestones', 'deliverables', 'invoices', 'invoice_items']
  loop
    execute format('create policy %I on public.%I for select to authenticated using (public.is_staff())', t || '_staff_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_staff())', t || '_staff_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_staff()) with check (public.is_staff())', t || '_staff_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_admin())', t || '_admin_delete', t);
  end loop;
end $$;

-- Clients (portal users) only ever see their own records.
create policy clients_own_select on public.clients for select to authenticated
  using (profile_id = auth.uid());
create policy projects_client_select on public.projects for select to authenticated
  using (id in (select public.my_project_ids()));
create policy milestones_client_select on public.milestones for select to authenticated
  using (project_id in (select public.my_project_ids()));
create policy deliverables_client_select on public.deliverables for select to authenticated
  using (project_id in (select public.my_project_ids()));
create policy invoices_client_select on public.invoices for select to authenticated
  using (client_id in (select public.my_client_ids()) and status <> 'draft');
create policy invoice_items_client_select on public.invoice_items for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id));

-- Payments: staff can read and record MANUAL payments only; online payments come from the server.
create policy payments_staff_select on public.payments for select to authenticated
  using (public.is_staff());
create policy payments_staff_insert_manual on public.payments for insert to authenticated
  with check (public.is_staff() and method <> 'online' and status = 'paid' and created_by = auth.uid());
create policy payments_admin_update on public.payments for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy payments_client_select on public.payments for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id));

-- Enquiries: no public insert policy (the server endpoint uses the service role).
create policy enquiries_staff_select on public.enquiries for select to authenticated
  using (public.is_staff());
create policy enquiries_staff_update on public.enquiries for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy enquiries_admin_delete on public.enquiries for delete to authenticated
  using (public.is_admin());

-- Services, packages, portfolio, testimonials, settings: public reads published rows; admins write.
create policy services_public_select on public.services for select to anon, authenticated
  using (is_active);
create policy services_staff_select on public.services for select to authenticated
  using (public.is_staff());
create policy services_admin_write on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy packages_public_select on public.packages for select to anon, authenticated
  using (is_published);
create policy packages_staff_select on public.packages for select to authenticated
  using (public.is_staff());
create policy packages_admin_write on public.packages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy portfolio_public_select on public.portfolio_items for select to anon, authenticated
  using (is_published);
create policy portfolio_staff_select on public.portfolio_items for select to authenticated
  using (public.is_staff());
create policy portfolio_admin_write on public.portfolio_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy testimonials_public_select on public.testimonials for select to anon, authenticated
  using (is_published);
create policy testimonials_staff_select on public.testimonials for select to authenticated
  using (public.is_staff());
create policy testimonials_admin_write on public.testimonials for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy settings_public_select on public.site_settings for select to anon, authenticated
  using (true);
create policy settings_admin_write on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Notifications: users read their own and may only set read_at; staff create them.
create policy notifications_own_select on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy notifications_own_update on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_staff_insert on public.notifications for insert to authenticated
  with check (public.is_staff());
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Activity log: staff can read, and write rows attributed to themselves.
create policy activity_staff_select on public.activity_log for select to authenticated
  using (public.is_staff());
create policy activity_staff_insert on public.activity_log for insert to authenticated
  with check (public.is_staff() and actor_id = auth.uid());

-- ============ Storage ============
insert into storage.buckets (id, name, public, file_size_limit)
values ('portfolio', 'portfolio', true, 5242880),
       ('deliverables', 'deliverables', false, 52428800)
on conflict (id) do nothing;

create policy portfolio_files_read on storage.objects for select
  using (bucket_id = 'portfolio');
create policy portfolio_files_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and public.is_admin());
create policy portfolio_files_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());
create policy portfolio_files_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());

create policy deliverable_files_staff_all on storage.objects for all to authenticated
  using (bucket_id = 'deliverables' and public.is_staff())
  with check (bucket_id = 'deliverables' and public.is_staff());
-- Clients may download only files inside the folder of one of their own projects.
create policy deliverable_files_client_read on storage.objects for select to authenticated
  using (
    bucket_id = 'deliverables'
    and (storage.foldername(name))[1] in (select p::text from public.my_project_ids() as p)
  );

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create publication if not exists
do $$ 
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- 1. Create tables
create table if not exists menu_categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    sort_order integer default 0
);

create table if not exists menu_items (
    id uuid default gen_random_uuid() primary key,
    category_id uuid references menu_categories(id) on delete set null,
    name text not null,
    description text,
    price integer not null default 0,
    image_url text,
    available boolean default true,
    stock_quantity integer,
    sort_order integer default 0
);

create table if not exists restaurant_tables (
    id uuid default gen_random_uuid() primary key,
    table_number text not null unique,
    qr_token text not null unique,
    active boolean default true
);

create table if not exists sessions (
    id uuid default gen_random_uuid() primary key,
    table_id uuid references restaurant_tables(id) on delete cascade not null,
    session_token text not null unique,
    status text default 'ACTIVE' check (status in ('ACTIVE', 'CLOSED')),
    created_at timestamp with time zone default now() not null,
    closed_at timestamp with time zone
);

create table if not exists orders (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references sessions(id) on delete cascade not null,
    table_id uuid references restaurant_tables(id) on delete cascade not null,
    status text default 'WAITING' check (status in ('WAITING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
    note text,
    total_amount integer default 0,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    rating integer check (rating >= 1 and rating <= 5),
    feedback_note text
);

create table if not exists order_items (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references orders(id) on delete cascade not null,
    menu_item_id uuid references menu_items(id) on delete set null,
    item_name text not null,
    price integer not null,
    quantity integer not null default 1 check (quantity > 0),
    note text
);

create table if not exists store_settings (
    id text primary key default 'main',
    is_open boolean default true,
    kitchen_pin text default '9999',
    updated_at timestamp with time zone default now() not null
);

-- Realtime publication
alter publication supabase_realtime add table orders;

-- Insert default store settings
insert into store_settings (id, is_open, kitchen_pin) 
values ('main', true, '9999') 
on conflict (id) do nothing;

-- 2. Seed Initial Data
insert into restaurant_tables (table_number, qr_token, active) 
values (620, 'table-620-token', true)
on conflict (table_number) do nothing;

-- Insert Categories if empty
insert into menu_categories (name, sort_order)
select 'KOMBUCHA', 1
where not exists (select 1 from menu_categories where name = 'KOMBUCHA');

insert into menu_categories (name, sort_order)
select 'TRÀ', 2
where not exists (select 1 from menu_categories where name = 'TRÀ');

-- Insert Menu Items if empty
do $$
declare
  cat_kb uuid;
  cat_tra uuid;
begin
  select id into cat_kb from menu_categories where name = 'KOMBUCHA' limit 1;
  select id into cat_tra from menu_categories where name = 'TRÀ' limit 1;

  if not exists (select 1 from menu_items limit 1) then
    -- Kombucha items
    insert into menu_items (category_id, name, price, sort_order, image_url, available) values
    (cat_kb, 'Kombucha Nguyên vị', 25000, 1, 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=500&auto=format&fit=crop&q=60', true),
    (cat_kb, 'Kombucha Ổi', 30000, 2, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=60', true),
    (cat_kb, 'Kombucha Đào', 30000, 3, 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60', true),
    (cat_kb, 'Kombucha Táo', 30000, 4, 'https://images.unsplash.com/photo-1576158113840-43db9ff3ef09?w=500&auto=format&fit=crop&q=60', true),
    (cat_kb, 'Kombucha Vải', 30000, 5, 'https://images.unsplash.com/photo-1587888637140-849b25d80ef9?w=500&auto=format&fit=crop&q=60', true),
    (cat_kb, 'Kombucha Nho', 30000, 6, 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=500&auto=format&fit=crop&q=60', true),
    (cat_kb, 'Kombucha Hibiscus', 30000, 7, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60', true),
    (cat_kb, 'Kombucha Dâu tây', 30000, 8, 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60', true),
    (cat_kb, 'Kombucha Việt quất', 30000, 9, 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=500&auto=format&fit=crop&q=60', true);

    -- Tra items
    insert into menu_items (category_id, name, price, sort_order, image_url, available) values
    (cat_tra, 'Trà Atisô Cam Đào', 30000, 1, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60', true),
    (cat_tra, 'Trà Atisô Cam Xoài', 30000, 2, 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&auto=format&fit=crop&q=60', true),
    (cat_tra, 'Trà Hibiscus', 25000, 3, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60', true);
  end if;
end $$;

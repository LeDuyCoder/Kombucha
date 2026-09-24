-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create tables

-- menu_categories
create table menu_categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    sort_order integer default 0
);

-- menu_items
create table menu_items (
    id uuid default uuid_generate_v4() primary key,
    category_id uuid references menu_categories(id) on delete set null,
    name text not null,
    description text,
    price integer not null default 0,
    image_url text,
    available boolean default true,
    sort_order integer default 0
);

-- restaurant_tables
create table restaurant_tables (
    id uuid default uuid_generate_v4() primary key,
    table_number integer not null unique,
    qr_token text not null unique,
    active boolean default true
);

-- sessions
create table sessions (
    id uuid default uuid_generate_v4() primary key,
    table_id uuid references restaurant_tables(id) on delete cascade not null,
    session_token text not null unique,
    status text default 'ACTIVE' check (status in ('ACTIVE', 'CLOSED')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    closed_at timestamp with time zone
);

-- orders
create table orders (
    id uuid default uuid_generate_v4() primary key,
    session_id uuid references sessions(id) on delete cascade not null,
    table_id uuid references restaurant_tables(id) on delete cascade not null,
    status text default 'WAITING' check (status in ('WAITING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
    note text,
    total_amount integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- order_items
create table order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references orders(id) on delete cascade not null,
    menu_item_id uuid references menu_items(id) on delete set null,
    item_name text not null,
    price integer not null,
    quantity integer not null default 1 check (quantity > 0),
    note text
);


-- 2. Setup Realtime publication
alter publication supabase_realtime add table orders;


-- 3. Row Level Security (RLS) - Simple for MVP (Allow anonymous access for everything since no auth is requested)
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table restaurant_tables enable row level security;
alter table sessions enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies allowing public read/write (MVP ONLY - In production, you'd secure this)
create policy "Enable read access for all users" on menu_categories for select using (true);
create policy "Enable read access for all users" on menu_items for select using (true);
create policy "Enable read access for all users" on restaurant_tables for select using (true);
create policy "Enable read access for all users" on sessions for select using (true);
create policy "Enable insert for all users" on sessions for insert with check (true);
create policy "Enable update for all users" on sessions for update using (true);
create policy "Enable read access for all users" on orders for select using (true);
create policy "Enable insert for all users" on orders for insert with check (true);
create policy "Enable update for all users" on orders for update using (true);
create policy "Enable read access for all users" on order_items for select using (true);
create policy "Enable insert for all users" on order_items for insert with check (true);


-- 4. Seed Data
-- Truncate existing if re-running
truncate table order_items, orders, sessions, menu_items, menu_categories, restaurant_tables cascade;

-- Insert Tables
insert into restaurant_tables (table_number, qr_token) values
(1, 'table-01-token'),
(2, 'table-02-token'),
(3, 'table-03-token'),
(4, 'table-04-token'),
(5, 'table-05-token');

-- Insert Categories
with inserted_categories as (
  insert into menu_categories (name, sort_order)
  values 
    ('KOMBUCHA', 1),
    ('TRÀ', 2)
  returning id, name
)
-- Insert Menu Items
insert into menu_items (category_id, name, price, sort_order)
select c.id, item.name, item.price, item.sort_order
from inserted_categories c
join (
  values 
    ('KOMBUCHA', 'Kombucha Nguyên vị', 25000, 1),
    ('KOMBUCHA', 'Kombucha Ổi', 30000, 2),
    ('KOMBUCHA', 'Kombucha Đào', 30000, 3),
    ('KOMBUCHA', 'Kombucha Táo', 30000, 4),
    ('KOMBUCHA', 'Kombucha Vải', 30000, 5),
    ('KOMBUCHA', 'Kombucha Nho', 30000, 6),
    ('KOMBUCHA', 'Kombucha Hibiscus', 30000, 7),
    ('KOMBUCHA', 'Kombucha Dâu tây', 30000, 8),
    ('KOMBUCHA', 'Kombucha Việt quất', 30000, 9),
    ('TRÀ', 'Trà Atisô Cam Đào', 30000, 1),
    ('TRÀ', 'Trà Atisô Cam Xoài', 30000, 2),
    ('TRÀ', 'Trà Hibiscus', 25000, 3)
) as item(category_name, name, price, sort_order) on c.name = item.category_name;

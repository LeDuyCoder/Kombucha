alter table menu_items
  add column if not exists sizes jsonb not null default '[]'::jsonb;

alter table order_items
  add column if not exists size_name text;

notify pgrst, 'reload schema';

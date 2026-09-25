-- Migration: Allow alphanumeric room numbers (e.g. VIP 1, P.601, 620)
ALTER TABLE restaurant_tables ALTER COLUMN table_number TYPE TEXT;

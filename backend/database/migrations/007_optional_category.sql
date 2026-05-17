-- Make category_id nullable on requests (category is now optional)
ALTER TABLE requests ALTER COLUMN category_id DROP NOT NULL;

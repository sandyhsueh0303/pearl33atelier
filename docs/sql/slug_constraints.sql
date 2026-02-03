-- ============================================
-- Slug Constraints and Triggers
-- ============================================

-- 1. Add UNIQUE constraint on slug
-- This ensures no two products can have the same slug
ALTER TABLE catalog_products 
ADD CONSTRAINT catalog_products_slug_unique UNIQUE (slug);

-- 2. Add CHECK constraint for slug format
-- Ensures slug only contains lowercase letters, numbers, and hyphens
-- Must not start or end with hyphen
ALTER TABLE catalog_products
ADD CONSTRAINT catalog_products_slug_format_check 
CHECK (slug ~ '^[a-z0-9]+([a-z0-9-]*[a-z0-9]+)?$');

-- 3. Create function to prevent slug updates
CREATE OR REPLACE FUNCTION prevent_slug_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow slug to be set on INSERT
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- On UPDATE, check if slug is being changed
  IF TG_OP = 'UPDATE' AND OLD.slug IS DISTINCT FROM NEW.slug THEN
    RAISE EXCEPTION 'Cannot modify slug after product creation. Old: %, New: %', OLD.slug, NEW.slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to enforce slug immutability
DROP TRIGGER IF EXISTS prevent_slug_update_trigger ON catalog_products;

CREATE TRIGGER prevent_slug_update_trigger
  BEFORE UPDATE ON catalog_products
  FOR EACH ROW
  EXECUTE FUNCTION prevent_slug_update();

-- 5. Create function to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is NULL or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(
      regexp_replace(
        regexp_replace(
          regexp_replace(NEW.title, '\s+', '-', 'g'),  -- spaces to hyphens
          '[^a-z0-9-]', '', 'g'),                      -- remove invalid chars
        '-+', '-', 'g')                                -- merge multiple hyphens
    );
    -- Remove leading/trailing hyphens
    NEW.slug := regexp_replace(NEW.slug, '^-+|-+$', '', 'g');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-generate slug on INSERT
DROP TRIGGER IF EXISTS auto_generate_slug_trigger ON catalog_products;

CREATE TRIGGER auto_generate_slug_trigger
  BEFORE INSERT ON catalog_products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- ============================================
-- Verification Queries
-- ============================================

-- Check constraints
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'catalog_products'::regclass
  AND conname LIKE '%slug%';

-- Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'catalog_products'
  AND trigger_name LIKE '%slug%';

-- ============================================
-- Test Cases (Optional - run to verify)
-- ============================================

-- Test 1: Insert without slug (should auto-generate)
-- INSERT INTO catalog_products (title, pearl_type, availability)
-- VALUES ('White Akoya 8mm', 'WhiteAkoya', 'IN_STOCK');
-- Expected: slug = 'white-akoya-8mm'

-- Test 2: Insert with invalid slug format (should fail)
-- INSERT INTO catalog_products (title, slug, pearl_type, availability)
-- VALUES ('Test Product', 'Invalid_Slug!', 'WhiteAkoya', 'IN_STOCK');
-- Expected: ERROR - violates check constraint

-- Test 3: Update slug (should fail)
-- UPDATE catalog_products SET slug = 'new-slug' WHERE id = '...';
-- Expected: ERROR - Cannot modify slug after product creation

-- Test 4: Insert duplicate slug (should fail)
-- INSERT INTO catalog_products (title, slug, pearl_type, availability)
-- VALUES ('Another Product', 'white-akoya-8mm', 'WhiteAkoya', 'IN_STOCK');
-- Expected: ERROR - violates unique constraint

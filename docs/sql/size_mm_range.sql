-- Convert catalog_products.size_mm from numeric to text range format
-- Supports values like:
-- - 7
-- - 7.5
-- - 7-7.5
-- - 3.5-8

BEGIN;

-- Remove old constraint if it exists
ALTER TABLE catalog_products
DROP CONSTRAINT IF EXISTS catalog_products_size_mm_check;

-- Convert column type to text
ALTER TABLE catalog_products
ALTER COLUMN size_mm TYPE text
USING (
  CASE
    WHEN size_mm IS NULL THEN NULL
    ELSE size_mm::text
  END
);

-- Add validation for single number or numeric range
ALTER TABLE catalog_products
ADD CONSTRAINT catalog_products_size_mm_check
CHECK (
  size_mm IS NULL
  OR (
    size_mm ~ '^\d+(\.\d+)?(-\d+(\.\d+)?)?$'
    AND (
      position('-' in size_mm) = 0
      OR split_part(size_mm, '-', 1)::numeric <= split_part(size_mm, '-', 2)::numeric
    )
  )
);

COMMIT;

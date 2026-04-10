# AI Product Draft POC

## Goal

Build a first-pass AI product draft flow for pearl jewelry that separates image understanding from copy generation.

The POC pipeline is:

```text
Uploaded product images
  -> structured image extraction
  -> normalization into canonical product fields
  -> lightweight enrichment
  -> product copy generation
  -> validation
  -> draft product creation
```

This gives the admin team a debuggable draft, while the normal product edit form remains the final source of truth before publishing.

## Current Scope

### Included

- Upload product images from the inventory admin AI draft page.
- Send images and admin notes to OpenAI for structured attribute extraction.
- Normalize extracted pearl attributes into system-safe values.
- Enrich normalized data with simple merchandising context.
- Generate title, subtitle, metadata, and product copy from the structured data.
- Show extraction, normalization, and enrichment JSON in the admin preview UI.
- Validate the generated draft before creating a product.
- Create an unpublished `catalog_products` draft.
- Open the regular product edit form after draft creation.
- Keep slug editable and allow it to auto-update from product details until manually overridden.

### Not Included

- Field-level retry. This was explored, then cancelled.
- Missing Data Policy. This was explored, then cancelled.
- Automatic image attachment to the created product.
- Publishing products directly from AI.
- Using AI output as final truth without admin review.

## Files Changed

### API Pipeline

- `apps/inventory-admin/app/api/products/ai-draft/extraction.ts`
  - Adds the image-to-JSON extraction step.
  - Extracts raw product attributes such as `product_type`, `category_hint`, `pearl_type`, `color`, `overtone_raw`, `size_mm_raw`, `shape`, `luster`, `surface`, `metal_raw`, and `style`.
  - Includes `confidence`, `uncertain_fields`, and `reasoning_notes`.

- `apps/inventory-admin/app/api/products/ai-draft/normalization.ts`
  - Adds deterministic normalization from raw extraction into canonical product values.
  - Preserves raw values for debugging.
  - Adds `normalization_warnings`.
  - Keeps `field_actions` as status metadata only:
    - `ok`
    - `needs_review`
    - `required_input`
    - `optional_warning`
  - Important: `field_actions` does not currently block draft creation and does not trigger retry UI.

- `apps/inventory-admin/app/api/products/ai-draft/enrichment.ts`
  - Adds a lightweight domain enrichment layer.
  - Produces positioning, price tier, styling tags, occasion tags, and enrichment notes.

- `apps/inventory-admin/app/api/products/ai-draft/route.ts`
  - Updates the draft API to run extraction, normalization, enrichment, then content generation.
  - Uses enriched or normalized structured data as the source of truth for copy generation.
  - Returns pipeline artifacts in the response:
    - `extraction`
    - `normalized`
    - `enriched`
    - `pipelineDebug`
  - Keeps fallback draft behavior when OpenAI output is unavailable.

- `apps/inventory-admin/app/api/products/ai-draft/validation.ts`
  - Improves consistency checks so phrase matching does not produce substring false positives.
  - Example fixed case: `ring` is no longer detected inside `earring`.

### Admin UI

- `apps/inventory-admin/app/admin/products/ai-draft/AiDraftClient.tsx`
  - Stores and renders pipeline artifacts from the AI draft API.
  - Adds collapsible debug cards for:
    - Extraction
    - Normalization
    - Enrichment
  - Keeps existing draft validation and create-draft behavior.

- `apps/inventory-admin/app/admin/products/products.css`
  - Adds styles for the pipeline debug cards and JSON display.

- `apps/inventory-admin/app/admin/products/components/ProductForm.tsx`
  - Updates slug behavior in the regular product edit form.
  - The loaded slug is preserved when opening an existing product.
  - If product details change, the slug auto-updates from:
    - pearl type
    - size
    - shape
    - material
    - category
  - If the admin edits the slug manually, auto-update stops.

### Documentation

- `docs/image-to-json-extraction-spec.md`
  - Documents the image extraction layer and expected JSON shape.

- `docs/pearl-normalization-schema.md`
  - Documents canonical pearl normalization fields and mapping behavior.

- `docs/json-to-content-prompt-spec.md`
  - Documents how normalized structured data should feed copy generation.

## Runtime Behavior

### Generate Draft

The admin uploads one or more images and optionally enters notes.

The client calls:

```text
POST /api/products/ai-draft
```

The server:

1. Extracts structured product attributes from images.
2. Normalizes the extracted attributes.
3. Enriches normalized attributes.
4. Generates draft copy from the structured data.
5. Validates the resulting draft.
6. Returns the draft plus debug artifacts.

### Create Draft Product

The admin clicks `Create Draft Product`.

The client calls:

```text
POST /api/products/ai-draft/create
```

The server:

1. Validates the draft copy and structured fields.
2. Creates a `catalog_products` row with `published: false`.
3. Generates SKU with the existing sequential `PA0001` style.
4. Builds a slug from product fields and title.
5. Redirects the admin to the standard product edit form.

### Edit Slug After AI Draft

After the draft product is opened in the standard edit form:

- The slug field is editable.
- Changing product details can regenerate the slug.
- Manually editing the slug stops future auto-regeneration.
- Saving persists the slug through the existing product update API.

## Current Draft Creation Rules

A draft can be created when `validateAiDraft(draft)` returns `canCreateDraft: true`.

Current validation checks include:

- Required title.
- Required subtitle.
- Supported category.
- Supported or acceptable pearl type.
- Supported shape and luster warnings.
- Overtone warning if blank.
- Exactly 3 `why_youll_love_it` items.
- Exactly 3 `perfect_for` items.
- Description exists and contains the expected section headings.
- Consistency checks between structured fields and generated copy.

Because Missing Data Policy was cancelled, missing size or uncertain pearl type are not separately enforced by a policy layer.

## Current Known Limitations

- The normalization layer still maps unknown or unrecognized pearl type to `Other`.
- `field_actions` are visible in normalized JSON but are not connected to blocking validation or retry.
- Created AI draft products do not automatically attach uploaded images yet.
- SKU behavior remains the existing sequential `PA0001` style and was not changed in this POC.
- AI extraction confidence currently includes only a subset of fields.
- The enrichment layer is heuristic and intentionally lightweight.

## Cancelled Experiments

### Field-Level Retry

Field-level retry was added during exploration and then removed.

The current codebase should not contain:

- `POST /api/products/ai-draft/retry-field`
- field retry UI
- field retry CSS
- retry extraction helpers

### Missing Data Policy

Missing Data Policy was added during exploration and then removed.

The current codebase should not contain:

- `missing_data_policy`
- `source: "missing_data"`
- validation policy merging
- create-draft blocking based on normalized missing field policy

## Verification

Run:

```bash
./node_modules/.bin/tsc -p apps/inventory-admin/tsconfig.json --noEmit
```

Current expected result:

```text
passes with no TypeScript errors
```

## Next Decisions

- Decide whether `Other` should be allowed as a temporary pearl type or treated as review-only.
- Decide whether size should block draft creation or remain an editable post-draft field.
- Decide whether uploaded AI draft images should be attached automatically after product creation.
- Decide whether slug auto-update should apply to all edited products or only AI-created drafts.
- Decide whether pipeline debug JSON should stay visible in production admin UI or be gated behind a debug toggle.

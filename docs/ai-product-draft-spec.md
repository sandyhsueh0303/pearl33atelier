# AI Product Draft Spec

## Goal

Let an admin upload one or more product photos, have AI suggest product copy and core metadata, create a draft product automatically, then finish the listing with a small amount of manual review before publishing.

This flow is meant to reduce manual data entry for:

- title
- subtitle
- description
- Why You'll Love It
- Perfect For
- pearl type / category / shape / luster / overtone suggestions

## Success Criteria

- Admin can upload photos and generate a draft in one flow.
- AI creates a useful first-pass draft without publishing automatically.
- Admin only needs to confirm or edit a few critical fields before publishing.
- Generated copy matches the existing storefront tone and product-detail layout.

## Primary User Flow

1. Admin opens `Create with AI` from the product admin area.
2. Admin uploads 1 to 6 product photos.
3. AI analyzes the images and returns:
- structured product suggestions
- generated merchandising copy
4. Admin reviews the AI suggestions.
5. Admin clicks `Create Draft Product`.
6. System creates a `catalog_products` draft with `published: false`.
7. Admin is redirected to the normal product edit page.
8. Admin fills in the few missing fields and clicks publish.

## AI Output

### Structured Fields

AI should suggest:

- `title`
- `subtitle`
- `category`
- `pearl_type`
- `shape`
- `luster`
- `overtone`
- `size_mm_estimate`
- `editors_pick` suggestion

AI should not be treated as authoritative for:

- `sell_price`
- `original_price`
- exact `size_mm`
- `material`
- `inventory_item_id`
- final `published` state

### Copy Fields

AI should generate:

- `title`
- `subtitle`
- `description`
- `why_youll_love_it`
- `perfect_for`

The generated `description` should be saved in the current product-detail compatible format:

```text
WHY YOU’LL LOVE IT
• ...
• ...
• ...

PERFECT FOR
• ...
• ...
• ...
```

This matches the current storefront parsing logic in [`ProductDetailClient.tsx`](/Users/sandyhsueh/pearl33atelier/apps/public-web/app/products/[slug]/ProductDetailClient.tsx).

## Manual Review Fields

After draft creation, the admin is expected to confirm:

- price
- material
- exact size
- inventory connection
- final availability
- image/video publish state

## Admin UI

### Entry Point

Add a secondary CTA from the products admin screen:

- `Create with AI`

Suggested locations:

- [`apps/inventory-admin/app/admin/products/page.tsx`](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/admin/products/page.tsx)
- [`apps/inventory-admin/app/admin/products/new/page.tsx`](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/admin/products/new/page.tsx)

### New Screen

Suggested route:

- `apps/inventory-admin/app/admin/products/ai-draft/page.tsx`

Suggested UI sections:

- Upload Photos
- AI Suggestions
- Generated Copy
- Create Draft

Suggested actions:

- `Generate Draft`
- `Regenerate Copy`
- `Create Draft Product`
- `Cancel`

### Draft Review Layout

Left side:

- uploaded image previews

Right side:

- title
- subtitle
- pearl type
- category
- shape
- luster
- overtone
- size estimate
- generated copy preview

## API Design

### 1. Generate Suggestions

Suggested route:

- `POST /api/products/ai-draft`

Request:

```json
{
  "fileNames": ["necklace-front.jpg", "necklace-closeup.jpg"],
  "imageDataUrls": ["data:image/jpeg;base64,..."],
  "notes": "optional admin notes"
}
```

Response:

```json
{
  "draft": {
    "title": "White South Sea Pearl Ring",
    "subtitle": "White South Sea｜10-11mm｜Luster: high｜overtone: silver-blue",
    "category": "RINGS",
    "pearl_type": "WhiteSouthSea",
    "shape": "round",
    "luster": "high",
    "overtone": "silver-blue",
    "size_mm_estimate": "10-11",
    "description": "WHY YOU’LL LOVE IT\n• ...\n\nPERFECT FOR\n• ..."
  }
}
```

### 2. Create Draft Product

Suggested route:

- `POST /api/products/ai-draft/create`

This endpoint should:

- create a `catalog_products` row with `published: false`
- generate slug if needed
- attach uploaded images
- return the new product id

Response:

```json
{
  "productId": "uuid"
}
```

## Data Rules

- AI-created products must always start as draft.
- AI suggestions must remain editable before save.
- If AI is unsure, it should return `null` or low-confidence placeholders instead of inventing hard facts.
- Existing manual admin editing must remain the source of truth.

## Environment Variables

Current AI draft flow expects:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Suggested default:

- `OPENAI_MODEL=gpt-5.4-mini`
- If unset, server routes fall back through `apps/inventory-admin/app/lib/openaiModel.ts`

Current behavior:

- if `OPENAI_API_KEY` is present, the draft route sends uploaded images to OpenAI Responses API
- if `OPENAI_API_KEY` is missing, the route falls back to a heuristic draft based on filenames and notes

## Prompt Behavior

The AI prompt should optimize for:

- concise, elegant luxury tone
- wearable, everyday pearl styling language
- avoiding unsupported gemstone/material claims
- avoiding exact measurements unless clearly inferable
- bullet copy that feels editorial, not generic marketplace language

Prompt should explicitly avoid:

- fake pricing
- fake certifications
- fake material claims
- fake stock claims

## MVP Scope

Build first:

- AI image upload flow
- structured JSON output
- generated product copy
- draft product creation
- redirect to existing edit form

Do not include in v1:

- auto-publish
- inventory auto-linking
- exact price estimation
- automatic video analysis
- confidence scoring UI

## Suggested Implementation Order

1. Add AI draft page in inventory admin.
2. Add image upload state and preview UI.
3. Add `POST /api/products/ai-draft`.
4. Add prompt + JSON schema parser.
5. Add `POST /api/products/ai-draft/create`.
6. Redirect into existing product form.
7. Polish copy review UI.

## Current Code Reuse

Existing files that can be reused:

- [`ProductForm.tsx`](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/admin/products/components/ProductForm.tsx)
- [`apps/inventory-admin/app/api/products/route.ts`](/Users/sandyhsueh/pearl33atelier/apps/inventory-admin/app/api/products/route.ts)
- [`slugify.ts`](/Users/sandyhsueh/pearl33atelier/packages/shared/utils/slugify.ts)
- [`ProductDetailClient.tsx`](/Users/sandyhsueh/pearl33atelier/apps/public-web/app/products/[slug]/ProductDetailClient.tsx)

## Open Questions

- Should AI create subtitle as a separate DB field, or should subtitle remain derived on the frontend?
- Should generated `description` be saved as one field, or should `why_youll_love_it` and `perfect_for` become separate DB columns later?
- Should uploaded images be stored first, then analyzed from storage URLs, or analyzed directly from temporary uploads?
- Do we want one-photo MVP only, or multi-photo support from day one?

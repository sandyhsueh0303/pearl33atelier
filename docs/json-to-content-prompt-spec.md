# JSON-to-Content Prompt Spec

## Goal

Generate brand-aligned product content from already normalized structured product data.

This step should happen after:

- image extraction
- normalization
- optional domain enrichment

It should not perform primary perception or freeform guessing.

## Why This Step Exists

Once the system has clean structured inputs, copy generation becomes:

- more stable
- easier to debug
- easier to tune
- more consistent with brand voice

## Input Shape

```json
{
  "product_type": "stud earrings",
  "category": "Earrings",
  "pearl_type": "GreyAkoya",
  "shape": "round",
  "luster": "high",
  "overtone": "blue",
  "size_mm": "7.5-8.0",
  "metal": "18k white gold",
  "style_tags": ["minimal", "classic", "daily wear"],
  "positioning": "everyday luxury"
}
```

## Output Shape

```json
{
  "title": "Grey Akoya Pearl Stud Earrings",
  "subtitle": "7.5-8.0mm Grey Akoya • Blue",
  "why_youll_love_it": [
    "A clean, balanced silhouette designed for easy everyday wear.",
    "Grey Akoya pearls bring a cooler, more modern tone to a classic stud.",
    "High luster and round shape keep the pair polished and refined."
  ],
  "perfect_for": [
    "Everyday office wear",
    "A more understated alternative to classic white pearls",
    "Minimal wardrobes and structured dressing"
  ],
  "description": "WHY YOU’LL LOVE IT\n• ...\n\nPERFECT FOR\n• ..."
}
```

## Prompt V1

```text
You are a luxury jewelry copywriter for a modern pearl brand.

Your task is to write product copy from structured product data.

Do not invent new product facts.
Do not change the structured attributes.
Do not add unsupported material, rarity, or certification claims.

Keep the tone:
- refined
- minimal
- editorial
- calm
- quietly confident

Avoid:
- hype
- exaggerated luxury language
- generic filler

Return valid JSON only.

You will receive:
- product type
- category
- pearl type
- shape
- luster
- overtone
- size
- metal
- style tags
- positioning

Use those details to generate:
- title
- subtitle
- why_youll_love_it
- perfect_for
- description

Rules:
- `title` should be clean and product-focused
- `subtitle` should be short and structured
- `why_youll_love_it` should have exactly 3 concise bullet points
- `perfect_for` should have exactly 3 concise bullet points
- `description` should use the exact format:
  WHY YOU’LL LOVE IT
  • ...
  • ...
  • ...

  PERFECT FOR
  • ...
  • ...
  • ...

Return this shape:
{
  "title": "string",
  "subtitle": "string",
  "why_youll_love_it": ["string", "string", "string"],
  "perfect_for": ["string", "string", "string"],
  "description": "string"
}
```

## Writing Rules

- Treat structured data as the source of truth.
- Use the data to write, not to speculate.
- If the product is simple, keep the copy concise.
- Let pearl tone, proportion, and wearability drive the language.

## Validation Rules

Generated content should be checked for:

- required keys
- exactly 3 bullets in each section
- correct description format
- no unsupported claims
- no contradiction with structured fields

## Recommended Next Step

Use this content output in:

- existing draft preview UI
- validation and consistency checker
- product creation API

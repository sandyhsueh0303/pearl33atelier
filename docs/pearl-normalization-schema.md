# Pearl Normalization Schema

## Goal

Normalize raw extraction output into canonical values that match the existing product system.

This is the data cleaning and standardization layer between:

- image extraction
- content generation
- product creation

## Why This Step Exists

Models often produce visually plausible but inconsistent values such as:

- `rosy glow`
- `soft pink overtone`
- `cool silver blue`
- `slightly baroque round`

Your system needs canonical values like:

- `rose`
- `pink`
- `silver-blue`
- `round`

## Layer Responsibilities

This layer should:

- map raw AI text into accepted enums
- preserve raw values for debugging
- flag values that do not map cleanly
- produce system-safe product attributes

## Normalized Output Shape

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
  "raw": {
    "pearl_type": "Akoya",
    "overtone_raw": "soft blue overtone",
    "metal_raw": "cool white metal"
  },
  "normalization_warnings": [
    "Pearl type inferred as GreyAkoya based on grey body color cue."
  ]
}
```

## Canonical Enums

### Pearl Type

- `WhiteAkoya`
- `GreyAkoya`
- `WhiteSouthSea`
- `GoldenSouthSea`
- `Tahitian`
- `Freshwater`
- `Other`

### Category

- `Earrings`
- `Studs`
- `Necklaces`
- `Bracelets`
- `Rings`
- `Pendants`
- `Loose Pearls`
- `Brooches`

### Shape

- `round`
- `near-round`
- `drop`
- `button`
- `oval`
- `baroque`

### Luster

- `high`
- `soft`

### Overtone

- `white`
- `cream`
- `pink`
- `rose`
- `gold`
- `silver`
- `silver-blue`
- `iridescent`
- `pink iridescent`
- `green iridescent`
- `blue iridescent`
- `gold iridescent`
- `pink-green iridescent`
- `pink-blue iridescent`
- `green-blue iridescent`
- `multi iridescent`
- `peacock`
- `green peacock`
- `blue peacock`
- `aubergine`
- `charcoal`
- `dark green`
- `dark blue`
- `graphite`

## Example Normalization Rules

### Pearl Type

- `Akoya` + `white body color` -> `WhiteAkoya`
- `Akoya` + `grey body color` -> `GreyAkoya`
- `South Sea` + `gold body color` -> `GoldenSouthSea`
- `South Sea` + no clear gold cue -> `WhiteSouthSea`

### Shape

- `very round` -> `round`
- `slightly irregular round` -> `near-round`
- `organic freeform` -> `baroque`

### Luster

- `mirror-like`, `sharp reflection`, `very bright` -> `high`
- `soft glow`, `gentle glow` -> `soft`

### Metal

Normalize raw metal tone into system-safe text:

- `white gold`
- `yellow gold`
- `18k white gold`
- `18k yellow gold`
- `silver`
- `platinum`

## Normalization Rules

- Always preserve raw source values.
- Prefer deterministic mapping over model inference where possible.
- If a value does not map cleanly, output a warning.
- If a critical field cannot be normalized, mark it for review.

## Suggested Validation Behavior

### Hard errors

- category cannot be mapped
- shape cannot be mapped
- empty pearl type after normalization

### Warnings

- overtone is approximate
- metal is inferred from image
- pearl subtype inferred from body color

## Recommended Pipeline Placement

```text
Image Extraction
  -> Raw Structured Output
  -> Normalization
  -> Enriched Structured Product Data
  -> Copy Generation
```

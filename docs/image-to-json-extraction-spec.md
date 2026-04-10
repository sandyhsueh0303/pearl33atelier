# Image-to-JSON Extraction Spec

## Goal

Convert uploaded product images into structured product attributes before any copy generation happens.

This is the perception layer of the AI product creation pipeline.

Instead of asking one model call to both understand the product and write copy, this step should only do:

- visual parsing
- structured attribute extraction
- confidence-aware output

## Why This Step Exists

This layer improves:

- debuggability
- control
- consistency
- downstream content quality

If extraction and copy generation are combined in one prompt, it becomes difficult to know whether a bad result came from:

- image understanding
- field inference
- normalization
- copy generation

## Input

The extractor should accept:

```json
{
  "image_data_urls": ["data:image/jpeg;base64,..."],
  "file_names": ["IMG_001.jpg"],
  "admin_notes": "7.5-8mm grey akoya with blue overtone"
}
```

## Output Shape

```json
{
  "product_type": "stud earrings",
  "category_hint": "Earrings",
  "pearl_type": "Akoya",
  "color": "grey",
  "overtone_raw": "blue",
  "size_mm_raw": "7.5-8.0",
  "shape": "round",
  "luster": "high",
  "surface": "clean",
  "metal_raw": "white gold",
  "style": "minimal classic",
  "confidence": {
    "product_type": 0.95,
    "pearl_type": 0.82,
    "overtone_raw": 0.63
  },
  "uncertain_fields": ["overtone_raw"],
  "reasoning_notes": [
    "The product appears to be a pair of stud earrings.",
    "The pearls look relatively round and evenly matched.",
    "Metal tone appears cool-toned rather than yellow."
  ]
}
```

## Extraction Principles

- Prefer observation over assumption.
- If uncertain, return a broad value and flag uncertainty.
- Do not invent certifications or unsupported technical claims.
- Keep raw values separate from canonical values.

Example:

- Extraction layer:
  - `overtone_raw = "soft rosy glow"`
- Normalization layer:
  - `overtone = "rose"`

## Recommended Fields

### Core visual fields

- `product_type`
- `category_hint`
- `pearl_type`
- `color`
- `overtone_raw`
- `size_mm_raw`
- `shape`
- `luster`
- `surface`
- `metal_raw`
- `style`

### Reliability fields

- `confidence`
- `uncertain_fields`
- `reasoning_notes`

## Prompt V1

```text
You are a jewelry product extraction model.

Your task is to examine the uploaded product photos and return structured product attributes only.

Do not write marketing copy.
Do not generate descriptions.
Do not invent unsupported claims.

Return valid JSON only.

Focus on:
- product type
- pearl type
- visible color or tone
- overtone
- size estimate when possible
- shape
- luster
- surface quality
- visible metal tone
- general style direction

Rules:
- Prefer broad but correct answers over specific but risky ones.
- If a field is uncertain, include it in `uncertain_fields`.
- Use `reasoning_notes` to briefly explain what visual signals informed your answer.
- Keep `reasoning_notes` factual, not promotional.

Return this shape:
{
  "product_type": "string",
  "category_hint": "string",
  "pearl_type": "string",
  "color": "string",
  "overtone_raw": "string",
  "size_mm_raw": "string",
  "shape": "string",
  "luster": "string",
  "surface": "string",
  "metal_raw": "string",
  "style": "string",
  "confidence": {
    "product_type": 0.0,
    "pearl_type": 0.0,
    "overtone_raw": 0.0
  },
  "uncertain_fields": ["string"],
  "reasoning_notes": ["string"]
}
```

## Validation Rules

The extraction result should be checked for:

- missing required fields
- invalid numeric confidence values
- obviously contradictory output
- empty uncertainty or reasoning structures when confidence is low

## Recommended Next Step

Send this raw extraction output into:

- normalization
- enum mapping
- domain enrichment

before using it for any copy generation.

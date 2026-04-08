# Blog AI Decision Template

Use this structure for any buying-guide or styling article that should work as:

- SEO content
- AI-readable decision logic
- conversion entry point

## Recommended Structure

1. `Quick Answer`
- short bullet summary for AI overviews and search snippets

2. `Step-by-Step Decision Guide`
- occasion
- style direction
- size or proportion
- tone or material

3. `Product Mapping`
- for each decision path, add:
  - product direction
  - category link
  - CTA

4. `Decision Snapshot`
- keep a short human-readable summary inside the article

5. `Sidecar Schema`
- store the structured JSON in a sidecar file rather than the article body when you want cleaner reading UX

6. `Conversion CTA`
- link to products
- later can link to AI stylist or quiz

## Suggested JSON Shape

```json
{
  "guide": "string",
  "paths": [
    {
      "intent": "daily minimal",
      "pearl_type": "Akoya",
      "size_mm": "6.5-7.5",
      "style": "round studs",
      "metal_direction": "white gold",
      "occasion": "daily wear",
      "cta_path": "/products?category=Studs"
    }
  ]
}
```

## Suggested File Pattern

- article: `some-guide.md`
- sidecar schema: `some-guide.schema.json`

This keeps the page readable for users while preserving structured decision data for internal AI and recommendation systems.

## Writing Rules

- Keep each decision path clear and reusable.
- Use explicit sizing and style language whenever possible.
- Prefer short bullets over long narrative blocks in the summary sections.
- Treat each article as a future recommendation node, not only a blog post.

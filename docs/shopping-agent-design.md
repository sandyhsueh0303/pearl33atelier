# Shopping Agent Design — v0

## Goal

Help a customer discover published pearl jewelry that fits their needs.

## User

A customer visiting the public 33 Pearl Atelier website.

## V0 capability

- Understand a shopping request.
- Identify whether category is present and capture budget when provided.
- Ask one concise clarification question when category is missing.
- Search published products using category, pearl preference, and price range.
- Use pearl size and metal preference as soft ranking preferences when returned product data supports them.
- Capture style, occasion, and statement level as shopping context without claiming they are database filters.
- Check each recommendation's current purchasability using the existing inventory/BOM domain logic.
- Recommend up to three real products with their exact title, price, and product link.

## Explicitly out of scope for v0

- Product-detail lookup
- Add to cart
- Checkout or payment
- Orders, reservations, shipping promises, discounts, or price changes
- Customer-account access

## Allowed data

Only public, published product fields:

- title
- slug and product URL
- category
- pearl type
- material
- size
- sell price
- current purchasability (`available`, `preorder`, or `unavailable`)
- product description when it is needed in a future version

## Shopping context

- category

Optional preferences:

- price range or budget
- occasion
- style
- statement level (`subtle`, `balanced`, or `statement`)
- pearl preference
- pearl size
- metal preference

## Critical missing fields

The agent must ask before searching if this field is missing:

- category

## Search rule

The agent can search after it knows a category. For the initial recommendation attempt, it calls `search_products` once using only the currently supported database filters:

- category
- minimum price
- maximum price
- pearl preference

If the customer provides a budget, the agent applies it as a price constraint; otherwise, it searches without one. Pearl size and metal preference may be used only to rank returned products when `size_mm` or `material` directly supports the preference. Style, occasion, and statement level remain captured context and must not be presented as database filters.

When `intent.category` is present, the agent must call `search_products` before producing a final response. It must not return `recommendation` or `no_results`, or claim that it will search, look for, or check products, unless the tool was actually called in the current run.

The agent must not repeat a search with unchanged arguments. It may search again after the customer materially changes or approves relaxing a constraint, but it must never silently relax a budget or preference.

## Availability rule

Before recommending searched products, the agent must call the `check_product_availability` tool (`checkProductAvailability()` in code) once with every product ID returned by `search_products`. The batch accepts one to three IDs, matching the search result limit, reuses the existing inventory/BOM availability logic, and returns only the customer-facing purchasability state for each product; the agent must not infer availability or inspect internal component quantities.

- `available`: prioritize as a main recommendation and state that it is currently available.
- `preorder`: may be recommended, but must be clearly identified as a preorder.
- `unavailable`: normally exclude; mention only for an exceptional match and prioritize purchasable alternatives.

If every checked candidate is unavailable, return `no_results` rather than presenting an unavailable item as purchasable.

## Example

User: "I need pearl earrings under $300."

Intent:

- category: earrings
- pearlPreference: pearl
- maxPrice: 300

Action:

- call `search_products`
- call `check_product_availability` once with every candidate that may be recommended
- return real published, purchasable products only

## Non-example

User: "I need something for a wedding."

Response:

> What type of jewelry are you looking for?

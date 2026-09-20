# Shopping Agent Design — v0

## Goal

Help a customer discover published pearl jewelry that fits their needs.

## User

A customer visiting the public 33 Pearl Atelier website.

## V0 capability

- Understand a shopping request.
- Identify whether category is present and capture budget when provided.
- Ask one concise clarification question when category is missing.
- Search published products using category, pearl preference, style, occasion, and price range.
- Recommend up to three real products with their exact title, price, and product link.

## Explicitly out of scope for v0

- Product-detail lookup
- Availability or inventory lookup
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

The agent can search after it knows a category. If the customer provides a budget, the agent applies it as a price constraint; otherwise, it searches without a price constraint.

## Example

User: "I need pearl earrings under $300."

Intent:

- category: earrings
- pearlPreference: pearl
- maxPrice: 300

Action:

- call `searchProducts`
- return real published products only

## Non-example

User: "I need something for a wedding."

Response:

> What type of jewelry are you looking for?

# Shopping Agent Design — v1

## Goal

Help a customer discover published pearl jewelry that fits their needs across multiple turns, using real catalog data, current purchasability, deterministic ranking, and grounded product evidence.

## User

A customer visiting the public 33 Pearl Atelier website.

## V1 capabilities

- Understand a shopping request.
- Maintain structured ShoppingContext across multiple turns.
- Identify whether category is present.
- Ask one concise clarification question when category is missing.
- Preserve prior constraints and preferences when the customer adds or refines information.
- Allow explicit corrections, such as changing earrings to necklaces.
- Search published products using supported structured filters.
- Check current purchasability using existing inventory/BOM domain logic.
- Retrieve richer product details when the request requires them.
- Rank purchasable products using deterministic soft-preference scoring.
- Use grounded product evidence to explain recommendations.
- Store the actual displayed recommendation order.
- Resolve references such as:
  - first one
  - second one
  - third one
  - last one
- Skip unnecessary re-search when a previously recommended product can be resolved deterministically.
- Recommend up to three real published products.

## Explicitly out of scope for v1

- RAG / semantic knowledge retrieval
- Add to cart
- Checkout or payment
- Orders
- Reservations
- Shipping promises
- Discounts
- Price changes
- Inventory mutation
- Customer-account access
- Long-term customer memory
- Multi-agent architecture

## Allowed data

Only public, published customer-safe product data.

Examples:

- product ID
- title
- slug
- product URL
- category
- pearl type
- pearl size
- material
- sell price
- description
- shape
- luster
- overtone
- original price when customer-safe
- editor's pick when customer-safe
- current purchasability:
  - available
  - preorder
  - unavailable

The Shopping Agent must not access:

- cost
- margin
- internal inventory quantities
- supplier data
- internal operational notes
- unpublished products

## ShoppingContext

The in-memory ShoppingContext contains:

- category
- minPrice
- maxPrice
- occasion
- style[]
- pearlPreference
- pearlSize
- metalPreference
- recommendedProducts[]

Example:

```ts
{
  category: "earrings",
  minPrice: null,
  maxPrice: 500,
  occasion: "wedding",
  style: ["minimal"],
  pearlPreference: null,
  pearlSize: "9-12mm",
  metalPreference: null,
  recommendedProducts: [
    {
      id: "...",
      title: "..."
    }
  ]
}
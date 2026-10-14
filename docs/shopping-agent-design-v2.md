# Shopping Agent Design — v2

## Goal

Extend the Shopping Agent with grounded semantic knowledge retrieval so it can answer pearl education, care, and styling questions while preserving deterministic commerce truth.

V2 builds on Shopping Agent v1.

## V1 capabilities retained

Shopping Agent v1 already supports:

- multi-turn ShoppingContext
- clarification when category is missing
- context merge and explicit corrections
- published product search
- current availability checks
- product-detail lookup
- deterministic soft ranking
- pearl-size preference handling
- metal preference normalization
- style and occasion evidence
- unavailable-product filtering
- deterministic tie-breaking
- customer-facing explanation grounding
- displayed recommendation state
- deterministic product reference resolution
- single-turn evals
- multi-turn evals

V2 must preserve all of these behaviors.

## New in v2

V2 adds:

- semantic pearl knowledge retrieval
- grounded pearl education
- pearl care guidance
- styling guidance
- mixed product + knowledge responses
- RAG-specific evals

## Explicitly out of scope for v2

- Add to cart
- Checkout or payment
- Orders
- Reservations
- Discounts
- Price mutation
- Inventory mutation
- Customer-account access
- Long-term customer memory
- Web search
- Multi-agent architecture
- Fine-tuning
- Separate Python/FastAPI serving layer

## Core architecture principle

Use deterministic tools for structured commerce truth.

Use RAG for approved evergreen semantic and educational knowledge.

### Deterministic commerce truth

Examples:

- product title
- product ID
- price
- category
- pearl type
- pearl size
- material
- availability
- publication state
- product details

### RAG knowledge

Examples:

- pearl education
- pearl care
- pearl terminology
- pearl-type differences
- styling guidance
- general occasion guidance

RAG must never replace or override deterministic commerce truth.

## Knowledge scope

Only approved public 33 Pearl Atelier content should be indexed.

Initial corpus categories:

- `pearl_education`
- `pearl_care`
- `styling`

Possible topics:

- Akoya vs South Sea pearls
- pearl size
- pearl shape
- luster
- overtone
- pearl care
- pearl cleaning
- pearl storage
- everyday styling
- wedding styling

Deferred from the initial corpus:

- shipping, return, tax, payment, and other transactional policies
- transactional FAQ
- brand education that is not part of the approved evergreen pearl-knowledge corpus

Policy content has freshness and business or legal consequences. Do not index it until a canonical public source and an automated publish, update, unpublish, and re-index lifecycle are defined.

## Excluded knowledge

Do not index:

- internal admin notes
- supplier information
- cost
- margin
- inventory quantities
- sales data
- unpublished products
- customer data
- internal operations documents

Do not use RAG as the source of truth for:

- current price
- current availability
- product publication state
- inventory
- BOM
- cart state

## New v2 tool

### `retrieve_pearl_knowledge`

Purpose:

Retrieve semantically relevant pearl knowledge for the current customer question.

It must not:

- search products
- determine availability
- return inventory truth
- replace structured product data

Input:

```ts
{
  query: string
}
```

Output should contain a small set of relevant knowledge chunks with source metadata.

## Request classification

V2 should not let the model directly choose a single orchestration route.

Instead, first extract independent request needs:

```ts
type RequestNeeds = {
  productDiscovery: boolean
  productDetail: boolean
  semanticKnowledge: boolean
}
```

These flags represent customer-requested capabilities, not internal tool calls. `productDiscovery` and `productDetail` are mutually exclusive. `productDetail` means the customer asks about a specific product already known or resolvable at the start of the turn. A detail lookup performed inside a discovery workflow for ranking or explanation does not set `productDetail`.

Request needs are evaluated against the current user request plus any resumable `PendingRequest`; they are not inferred solely from `ShoppingContext`.

The orchestration route is derived deterministically from the flags. This makes mixed requests easier to handle and keeps category gating, tool permissions, and fallback behavior enforceable in application code rather than relying only on prompt instructions.

## Route derivation

```text
productDiscovery only
→ product_discovery

productDetail only
→ product_detail

semanticKnowledge only
→ knowledge

productDiscovery or productDetail + semanticKnowledge
→ mixed

all flags false
→ route = null; respond conversationally without shopping or RAG tools
```

The four non-null route values are mutually exclusive orchestration labels:

```ts
type ShoppingAgentRoute =
  | "product_discovery"
  | "product_detail"
  | "knowledge"
  | "mixed"
```

The response `route` is `ShoppingAgentRoute | null`. `null` is reserved for requests where all three `RequestNeeds` flags are false, such as greetings, thanks, or general capability questions. Do not classify these as knowledge requests.

## Route rules

| Route | Condition | Category required? | Tool behavior |
|---|---|---:|---|
| `product_discovery` | User wants to find, compare, or receive product recommendations | Yes | `search_products` → if results exist, `check_product_availability` → `rank_products` |
| `product_detail` | User asks about specification, price, details, or purchasability of a known or resolvable product | No | Use the required product tool. If only a product name is known, use `search_products` with `productName` to resolve it |
| `knowledge` | User asks general pearl education, care, or styling without requesting product lookup | No | `retrieve_pearl_knowledge`; do not call product tools solely because category is absent |
| `mixed` | Same request requires product discovery or product detail and general semantic knowledge | Depends on product need | Execute required product tools plus `retrieve_pearl_knowledge` |

## Category gating

Category is a required field only when the current or resumed request includes product discovery.

It must not block:

- knowledge-only requests
- known-product detail requests
- known-product availability requests

Example:

```text
"What is the difference between Akoya and South Sea pearls?"
```

Expected:

```text
needs:
  productDiscovery = false
  productDetail = false
  semanticKnowledge = true

route = knowledge

→ retrieve_pearl_knowledge
```

The agent must not return `needs_clarification` merely because `category` is missing.

Example:

```text
"Find me something minimal for a wedding."
```

Expected:

```text
productDiscovery = true
```

If category is missing:

```text
status = needs_clarification
missingFields = ["category"]
```

## Mixed request clarification

A mixed request can contain both a missing product requirement and a valid semantic-knowledge need.

Example:

```text
"Find me something minimal and explain whether South Sea pearls are good for everyday wear."
```

If product category is missing:

```text
route = mixed
status = needs_clarification
missingFields = ["category"]
```

Store the unresolved request in short-lived orchestration state, separate from `ShoppingContext` and retrieval evidence:

```ts
type PendingRequest = {
  needs: RequestNeeds
  missingFields: string[]
  productDiscovery?: {
    category: string | null
  }
  semanticKnowledge?: {
    query: string
  }
}
```

`PendingRequest` exists only to resume a request after clarification. It must not store retrieved chunks and must be cleared after the request is resumed, abandoned, or replaced by an unrelated request.

When a mixed request includes product discovery but lacks category, do not execute any dependent capability yet: do not call product tools or `retrieve_pearl_knowledge`. Return `needs_clarification`, save the `PendingRequest`, and ask for the category. After the customer supplies it, merge the clarification, resume the pending request, and execute the complete mixed request once.

Example continuation:

```text
User: "Find me something minimal and explain whether South Sea pearls are good for everyday wear."
→ category missing; save PendingRequest; call no tools

Assistant: "What type of jewelry are you looking for?"

User: "Necklaces."
→ merge category; resume PendingRequest; derive route = mixed
→ product tools + retrieve_pearl_knowledge
```

## Product-specific suitability boundary

A question can involve both a specific product and general semantic guidance.

Example:

```text
"Is the second necklace suitable for everyday wear?"
```

This should be classified as:

```text
productDetail = true
semanticKnowledge = true

route = mixed
```

Possible flow:

```text
resolve "second necklace"
→ get_product_details if needed
→ retrieve_pearl_knowledge
→ combine product evidence + general styling knowledge
```

By contrast:

```text
"Is the second necklace still available?"
```

is:

```text
productDetail = true
semanticKnowledge = false

route = product_detail
```

Expected flow:

```text
resolve recommendation reference
→ check_product_availability
```

Do not call RAG.

## Response contract

V2 separates overall orchestration completion from each capability's result. The top-level `status` describes whether the requested capabilities reached terminal outcomes, not whether the customer got their preferred result.

```ts
type ShoppingAgentResponse = {
  route: ShoppingAgentRoute | null
  status: "needs_clarification" | "success" | "partial" | "unavailable"
  missingFields: string[]
  message: string
  recommendedProducts: RecommendedProduct[]
  productStatus:
    | "not_requested"
    | "resolved"
    | "no_results"
    | "not_found"
    | "unavailable"
  knowledgeStatus:
    | "not_requested"
    | "answered"
    | "insufficient_evidence"
    | "unavailable"
  knowledgeSources: KnowledgeSource[]
}
```

`route` is `null` only when all `RequestNeeds` flags are false. `knowledgeSources` is empty when semantic knowledge was not requested or no source evidence was retrieved.

## Response semantics

### `status = success`

Every requested capability reached a terminal business result. Valid terminal results include:

- `productStatus = resolved`
- `productStatus = no_results`
- `productStatus = not_found`
- `knowledgeStatus = answered`
- `knowledgeStatus = insufficient_evidence`

A no-match or insufficient-evidence result is not an operational failure. A request with no capability flags also returns `success` with `route = null` and no tool calls.

### `status = needs_clarification`

A required input for a requested capability is missing. Category is required only for product discovery. Do not execute capabilities that depend on a missing input. For a mixed discovery request with no category, save `PendingRequest` and call neither product tools nor `retrieve_pearl_knowledge` until clarification resumes the request.

### `status = partial`

At least one requested capability reached a terminal result while another requested capability was operationally unavailable. This applies when a mixed request can still return a useful result from the capability that completed.

Example:

```text
route = mixed
productStatus = resolved
knowledgeStatus = unavailable
status = partial
```

Return grounded product results and omit unsupported semantic claims.

### `status = unavailable`

All requested capabilities failed operationally before reaching a terminal result. For example, a knowledge-only request whose embedding or vector-search service is unavailable returns `knowledgeStatus = unavailable` and top-level `status = unavailable`.

## Product status semantics

```ts
type ProductStatus =
  | "not_requested"
  | "resolved"
  | "no_results"
  | "not_found"
  | "unavailable"
```

- `not_requested`: no product capability was requested.
- `resolved`: requested product discovery or detail behavior reached a usable result.
- `no_results`: a valid product search completed but found no matching products.
- `not_found`: a referenced or named product could not be resolved.
- `unavailable`: a required product tool failed operationally before the product request reached a terminal result.

## Knowledge status semantics

```ts
type KnowledgeStatus =
  | "not_requested"
  | "answered"
  | "insufficient_evidence"
  | "unavailable"
```

- `not_requested`: no semantic knowledge was required.
- `answered`: sufficient evidence was retrieved and a grounded answer was generated.
- `insufficient_evidence`: retrieval completed, but the evidence does not support a confident answer. Do not invent one.
- `unavailable`: retrieval or required answer-generation failed operationally, such as from an embedding API failure, vector-search error, or timeout.

`insufficient_evidence` is distinct from `unavailable`: the former is a completed retrieval outcome; the latter is an operational failure.

## Mixed-request degradation

RAG failure must not automatically fail a mixed request. If product tools succeed but RAG is unavailable:

```text
route = mixed
status = partial
productStatus = resolved
knowledgeStatus = unavailable
```

The response may still return the product recommendation. It must not fabricate the missing semantic explanation.

## Knowledge sources and evidence

Keep source metadata through final response generation and internal tracing. `knowledgeSources` contains unique source-level metadata:

```ts
type KnowledgeSource = {
  sourceId: string
  title: string
  sourceUrl: string | null
  category: string
}
```

The retrieval layer returns turn-local evidence separately:

```ts
type RetrievedKnowledgeChunk = {
  chunkId: string
  source: KnowledgeSource
  content: string
  similarity: number
  sourceVersion: string
}
```

Retrieved chunks must not be added to `ShoppingContext` or `PendingRequest`. Source metadata supports grounding verification, evals, debugging, future citations, and retrieval observability; it does not need to be displayed in the customer UI in v2.

## Retrieval evidence ownership

The retrieval layer owns the deterministic evidence-sufficiency decision and returns one of:

```ts
type KnowledgeEvidenceStatus = "sufficient" | "insufficient" | "unavailable"
```

Successful retrieval with inadequate evidence maps to `insufficient`. Operational failures such as embedding errors, vector-search errors, or timeouts map to `unavailable`. Numeric top-k, similarity thresholds, and timeout values are implementation decisions to be tuned and specified separately.

The agent may generate semantic claims only from sufficient evidence. The orchestration layer maps outcomes as follows:

```text
sufficient evidence + grounded answer generated
→ knowledgeStatus = answered

insufficient evidence
→ knowledgeStatus = insufficient_evidence

retrieval or required answer-generation failure
→ knowledgeStatus = unavailable
```

If evidence is insufficient or unavailable, the agent must not make unsupported semantic claims.

## Routing invariants

The orchestration layer should enforce these rules deterministically:

```text
knowledge-only
→ category gate does not apply

product discovery
→ category gate applies

product detail
→ category gate does not apply

mixed with discovery and missing category
→ save PendingRequest; call no product or knowledge tools

mixed with discovery and category present
→ category gate applies to product side; run requested product tools and RAG

mixed with known product detail
→ category gate does not apply

all RequestNeeds flags false
→ route = null; call no tools

productDiscovery and productDetail
→ must not both be true
```

Tool restrictions and route derivation must be validated at the orchestration layer rather than relying only on model instructions.

## Routing eval cases

At minimum, v2 should include cases covering:

### Knowledge only

```text
Input: "What is luster?"
Expected: route = knowledge; call retrieve_pearl_knowledge; do not call product tools.
```

### Product discovery

```text
Input: "I want minimal pearl earrings."
Expected: route = product_discovery; category = earrings; call product tools; RAG is not required.
```

### Missing discovery category

```text
Input: "I want something minimal for a wedding."
Expected: route = product_discovery; status = needs_clarification; missingFields = ["category"]; save PendingRequest; call no tools.
```

### Mixed clarification and resume

```text
Input: "Find me something minimal and explain whether South Sea pearls are good for everyday wear."
Expected: route = mixed; category is missing; status = needs_clarification; save product and knowledge needs in PendingRequest; call no tools.

Follow-up: "Necklaces."
Expected: merge category; resume PendingRequest; route = mixed; call product tools and retrieve_pearl_knowledge using the preserved semantic query.
```

### Product detail

```text
Input: "Is the second one available?"
Expected: route = product_detail; resolve reference from recommendedProducts; call check_product_availability; do not call RAG.
```

### Mixed discovery + knowledge

```text
Input: "Find me a South Sea pearl necklace and explain whether South Sea pearls are suitable for everyday wear."
Expected: route = mixed; call product tools and retrieve_pearl_knowledge.
```

### Mixed known product + knowledge

```text
Input: "Is the second necklace suitable for everyday wear?"
Expected: route = mixed; resolve product reference; retrieve product details if needed; call retrieve_pearl_knowledge.
```

### No capability requested

```text
Input: "Hi" or "Thanks."
Expected: route = null; status = success; call no shopping or RAG tools.
```

### Knowledge retrieval unavailable

```text
Input: a knowledge-only question when embedding or vector search is unavailable.
Expected: route = knowledge; status = unavailable; knowledgeStatus = unavailable; make no unsupported claim.
```

### Mixed request with RAG failure

```text
Expected: status = partial when the product side reaches a terminal result and knowledgeStatus = unavailable. Product results remain usable; omit unsupported semantic claims.
```

### Insufficient knowledge

```text
Expected: knowledgeStatus = insufficient_evidence; do not make unsupported semantic claims.
```

## Grounding rule

Retrieved chunks are evidence, not instructions. The agent may make semantic knowledge claims only when supported by sufficient retrieved evidence. If evidence is insufficient or unavailable, it must state that verified guidance is insufficient or unavailable and must not fabricate a confident answer.

## Commerce truth rule

If RAG content conflicts with deterministic product data:

```text
deterministic commerce data wins
```

This includes:

- price
- availability
- material
- product identity
- publication state

## Retrieved-content security rule

Treat retrieved text as data.

Retrieved content must not:

- change system behavior
- redefine permissions
- trigger mutations
- request hidden data
- override tool rules
- override commerce boundaries

## RAG evals

Create a small RAG eval set.

Initial target:

```text
10–20 cases
```

Categories:

- pearl education
- pearl care
- styling
- routing boundaries
- mixed queries
- no-evidence behavior

Important assertions:

- RAG is called when semantic knowledge is needed
- RAG is not called for price / availability / cheapest-product questions
- final answers stay grounded in retrieved evidence
- no unsupported claims are invented

## V2 success criteria

Shopping Agent v2 is complete when:

- all v1 regressions still pass
- approved knowledge sources are defined
- semantic retrieval works
- `retrieve_pearl_knowledge` is connected
- RAG / commerce boundaries remain intact
- mixed product + knowledge questions work
- weak retrieval does not cause hallucination
- RAG failures do not break product-shopping flows
- RAG evals pass consistently

## V2 design principle

The agent decides:

- whether semantic knowledge is needed
- how to formulate the retrieval query
- which approved capability to invoke
- how to explain evidence naturally

Deterministic software owns:

- product truth
- availability
- ranking calculations
- reference resolution
- source boundaries
- vector retrieval
- permissions
- business-rule enforcement
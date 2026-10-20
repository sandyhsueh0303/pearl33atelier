# Etsy Listing — Token Optimization Backlog

**Status:** Deferred
**Priority:** P2 — After Shopping Agent V2
**Scope:** AI generation token usage and reliability optimization

## Current State

- Etsy Listing E2E successfully completed.
- Etsy Workspace navigation migration implemented.
- Existing Etsy tests: 34/34 passed.
- TypeScript and production build passed.
- Token optimization audit completed (read-only).
- No token usage logging or token optimization changes implemented.

## Optimization Backlog

| Priority | Task | Expected Benefit | Risk |
|---|---|---|---|
| P0 | Record OpenAI token usage | Establish actual cost baseline | Low |
| P1 | Remove unnecessary product fields from AI prompt | Reduce input tokens | Low |
| P1 | Build taxonomy candidate shortlist | Reduce large taxonomy context | Medium |
| P2 | Improve generated output validation | Reduce failed generations and retries | Medium |
| P2 | Evaluate image count / detail strategy | Potential vision-token savings | High |
| P3 | Refine output budget and repeated prompt instructions | Reduce unnecessary output and context | Medium |

## Confirmed Audit Findings

- Up to 500 taxonomy candidates may be included in both the prompt and structured output enum.
- Model input includes product `id`, `sell_price`, and `availability`, although the server handles these values independently.
- Structured output constraints do not fully prevent invalid image orders or tags.
- Up to 20 product images may be included in generation.
- No automatic duplicate generation call was identified.
- OpenAI token usage is not currently logged.

## Implementation Order

1. Add privacy-safe server-side token usage metrics.
2. Establish baseline using representative products.
3. Remove unnecessary product fields.
4. Implement and evaluate a taxonomy shortlist.
5. Improve output validation.
6. Evaluate image and output-token optimizations only after collecting data.

## Constraints

- Preserve listing accuracy, image ordering, and Etsy taxonomy quality.
- Preserve existing OAuth, reservation, idempotency, and draft creation behavior.
- Do not introduce new database tables or dependencies without clear justification.
- Do not log prompts, product descriptions, image URLs, credentials, or tokens.
- Apply and test optimizations independently.

## Resume Criteria

Resume this backlog after Shopping Agent V2 reaches its next planned milestone and the Etsy Listing V1.1 changes are safely committed.

## Separate Non-token Follow-ups

- Complete or explicitly defer page-reload reservation recovery.
- Confirm final Git review, tests, and commit.
- Database migration remains deferred.

# AI Blog System Spec

## Goal

Build an AI-assisted editorial pipeline that takes a topic from discovery through article generation, product mapping, editor review, and publishing.

The system is designed so blog content is not only SEO content, but also:

- AI-readable decision logic
- a conversion entry point
- a reusable recommendation node

## System Scope

This system handles five major jobs:

1. discover promising topics
2. generate article drafts
3. map article decisions to products or categories
4. validate the output
5. send the result through editor review before publish

## Core Components

### 1. Topic Agent

Inputs demand signals and generates prioritized topic ideas.

### 2. Content Agent

Takes a selected topic brief and produces:

- article draft
- structured decision summary
- sidecar schema
- conversion-oriented CTA structure

### 3. Mapper

Maps article decision paths to:

- product categories
- collections
- specific products where appropriate

### 4. Validation / QA Layer

Checks:

- completeness
- structure
- consistency
- product mapping quality
- unsupported claims

### 5. Editor Review

Allows a human editor to:

- approve a topic
- edit the article
- adjust mappings
- request regeneration
- approve publishing

### 6. Publish Layer

Publishes:

- article markdown
- sidecar schema
- optional internal indexing data

## High-Level Flow

1. collect topic signals
2. run Topic Agent
3. editor selects a topic
4. run Content Agent
5. run Mapper
6. run Validation / QA
7. editor reviews and edits
8. publish to `public-web`

## Architecture

### Input Sources

- Google Search Console queries
- GA4 traffic data
- site search logs
- catalog and sales signals
- manual campaign priorities
- optional Google Trends or seasonal notes

### Processing Layer

- topic discovery
- article generation
- mapping
- validation

### Storage Layer

- topic drafts
- article drafts
- sidecar schemas
- validation output
- editor status

### Delivery Layer

- markdown article
- `.schema.json`
- optional internal recommendation index

## Recommended Data Model

### `blog_topic_drafts`

- `id`
- `status`
- `source_signals` `jsonb`
- `generated_topics` `jsonb`
- `selected_topic` `jsonb`
- `editor_notes`
- `created_at`
- `updated_at`

### `blog_article_drafts`

- `id`
- `topic_draft_id`
- `slug`
- `status`
- `topic_brief` `jsonb`
- `article_markdown`
- `article_schema` `jsonb`
- `mapping_data` `jsonb`
- `validation_results` `jsonb`
- `editor_notes`
- `published_path`
- `created_at`
- `updated_at`

## Suggested Status Flow

### Topic flow

- `INPUT_RECEIVED`
- `TOPICS_GENERATED`
- `TOPIC_SELECTED`
- `ARCHIVED`

### Article flow

- `DRAFT_GENERATING`
- `DRAFT_READY`
- `MAPPING_READY`
- `VALIDATION_FAILED`
- `NEEDS_EDITOR_REVIEW`
- `APPROVED`
- `PUBLISHED`

## Topic Agent Spec

### Input

- query trends
- top-selling categories
- current catalog focus
- existing blog coverage
- seasonal or campaign notes

### Output Schema

```json
{
  "topics": [
    {
      "title": "How to Choose Pearl Earrings for Everyday Wear",
      "primary_intent": "informational",
      "target_keywords": ["everyday pearl earrings", "pearl earrings for daily wear"],
      "why_now": "Strong alignment with current catalog and beginner search intent",
      "audience": "first-time pearl buyers",
      "recommended_products": ["/products?category=Studs"],
      "conversion_goal": "category discovery",
      "priority_score": 86
    }
  ]
}
```

### Role

The Topic Agent should behave like:

- an SEO strategist
- a merchandising planner
- a pearl and jewelry domain-aware assistant

## Content Agent Spec

### Input

- selected topic brief
- brand tone rules
- product directions
- CTA targets

### Output

- article markdown
- sidecar schema
- title
- excerpt
- SEO description
- quick answer
- decision guide
- product mapping sections

### Recommended Article Format

- Intro
- Quick Answer
- Decision Guide
- Product Mapping
- Decision Snapshot
- CTA

## Mapper Spec

### Input

- article schema
- product catalog metadata
- categories
- pearl types
- internal product links

### Output

```json
{
  "mappings": [
    {
      "decision_path": "daily_minimal",
      "target_type": "category",
      "target_path": "/products?category=Studs",
      "reason": "Best fit for first-time everyday pearl buyers"
    }
  ]
}
```

### Rules

- prefer category and collection mapping first
- map to specific products only when relevance is strong
- avoid dead, empty, or overly narrow mappings

## Validation / QA Spec

The system should validate:

- required sections exist
- title / excerpt / seoDescription exist
- sidecar schema is valid JSON
- decision paths match article content
- mapped products or categories exist
- no unsupported claims are made
- structured schema and article content are consistent

### Example checks

- `Quick Answer` exists
- at least two decision branches exist
- each branch has a CTA or product direction
- schema intents appear in article content
- linked category or product pages actually exist

## Editor Review Spec

The editor should be able to:

- approve a topic
- edit the article draft
- request regeneration of a section
- adjust product mappings
- override CTA targets
- approve for publishing

### Editor UI should show

- topic brief
- article preview
- schema preview
- product mapping preview
- validation output

## Publishing Strategy

### Short term

Publish:

- article as `.md`
- sidecar schema as `.schema.json`

### Long term

Optionally:

- store both in DB
- generate files from DB
- feed schemas into retrieval and recommendation systems

## File Pattern

- article:
  - `apps/public-web/content/blog/some-topic.md`
- sidecar:
  - `apps/public-web/content/blog/some-topic.schema.json`

## Why This System Matters

This system turns blog from:

- static editorial content

into:

- searchable SEO content
- AI-readable decision logic
- product discovery entry point
- recommendation-ready knowledge node

## MVP Recommendation

Build in this order:

1. Topic Agent
2. Content Agent
3. sidecar schema output
4. editor review
5. mapper
6. validation automation

## Resume / Interview Framing

You can describe it as:

- Built an AI-assisted editorial pipeline for topic discovery, article generation, product mapping, and human-reviewed publishing.
- Designed a structured content system where blog articles double as recommendation-ready decision nodes for AI-assisted commerce flows.

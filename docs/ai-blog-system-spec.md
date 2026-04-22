# AI Blog System Spec

## Purpose

This document clarifies two different things that should not be conflated:

1. the original target system
2. the currently implemented first-version MVP

The original target was a full editorial operating system.

The current implementation is a high-quality content generation pipeline.

The main difference is not content quality. The current pipeline is already strong on content quality control.

The main difference is workflow automation depth and state management.

## Two System Levels

### Original Target

The original design goal was a complete editorial system that could:

- discover worthwhile topics automatically
- prioritize them using real business and search signals
- generate article drafts
- map decision paths to real product or category destinations
- validate output against live system constraints
- support editor review and revision
- persist draft state across sessions
- move content through a formal editorial status flow

### Current Implementation

The current implementation in `inventory-admin` is a structured AI blog pipeline that:

- starts from a manually written brief
- runs planner, writer, reviewer, rewriter, and packaging stages
- previews intermediate artifacts in the admin UI
- saves final publish artifacts into `apps/public-web/content/blog`

This makes it a strong generation workflow, but not yet a full editorial operating system.

## Current MVP Summary

The implemented workflow is:

1. editor fills in a brief
2. planner generates article direction
3. writer generates the article package
4. reviewer evaluates quality and package alignment
5. rewriter runs when needed
6. packaging normalizes final output
7. editor reviews artifacts in the UI
8. save writes `.md` and `.schema.json`

This is already a strong editorial pipeline because:

- stage responsibilities are separated
- reviewer and rewriter create a real quality loop
- packaging acts as a normalization gate
- the admin UI exposes artifacts instead of hiding them

## Gap Analysis

The sections below compare the original system design against the current MVP.

## 1. Topic Agent

### Original Target

The original system included a Topic Agent that could ingest:

- Google Search Console queries
- GA4 traffic data
- site search logs
- catalog signals
- sales signals
- seasonal or campaign priorities

It would output prioritized topic ideas with metadata such as:

- search intent
- why now
- recommended product direction
- conversion goal
- priority score

### Current MVP

The current system has no Topic Agent.

Topic selection is manual:

- the editor decides the topic
- the editor fills in the article brief
- the pipeline then operates only on that brief

### Practical Impact

The pipeline does not know:

- which topics have real search demand
- which topics are already covered
- which topics align with current catalog priorities
- which topics connect to current sales performance

This is the biggest gap between the original design and the current implementation.

It is also one of the highest-value business capabilities from the original system.

## 2. Content Agent

### Original Target

The original spec expected a Content Agent that would output:

- article draft
- structured decision summary
- sidecar schema
- CTA structure

### Current MVP

The current system goes beyond that original requirement.

Instead of one large Content Agent, the implementation uses:

- planner
- writer
- reviewer
- rewriter
- packaging

### Practical Impact

This is stronger than the original spec in terms of editorial quality control.

Important implemented improvements include:

- reviewer blocking and non-blocking issue handling
- recovery loop through rewriter
- final schema normalization through packaging
- stage-by-stage artifact visibility in the UI

This part of the system is not behind the original design. It is ahead of it.

## 3. Mapper

### Original Target

The original design included a dedicated Mapper component.

Its role was to map decision paths to real targets such as:

- category pages
- collection pages
- specific product pages when appropriate

The original rules were explicit:

- prefer category or collection mapping first
- use product mapping only when confidence is strong
- avoid dead links
- avoid empty or overly narrow destinations

### Current MVP

The current system only partially covers this.

Today:

- Writer and Packaging may output `internalLinks`
- article content may mention links such as `/products?category=Studs`
- these mappings are model-generated, not system-verified

There is no dedicated Mapper component that validates:

- whether the path exists
- whether the category currently has real products
- whether the link is still commercially useful

### Practical Impact

The system can produce plausible internal links, but it cannot yet guarantee that these links are valid, populated, or strategically correct.

This is a meaningful gap because mapping quality is one of the places where editorial output should connect back to real catalog state.

## 4. Validation / QA Layer

### Original Target

The original validation layer was expected to check things such as:

- required sections exist
- title, excerpt, and SEO description exist
- sidecar schema is valid JSON
- decision paths match article content
- mapped products or categories exist
- unsupported claims are absent

### Current MVP

The current system partially satisfies this through:

- reviewer stage evaluation
- packaging stage normalization
- schema-aware output checks

### Practical Impact

The current reviewer can assess a lot of editorial quality concerns, but two important validations remain outside its reach:

- whether mapped products or categories actually exist
- whether linked category or product pages are truly valid in the live system

These are not model-only problems. They require system-aware validation against real data or real routes.

So the current validation layer is strong on editorial quality, but still incomplete on environment-aware validation.

## 5. Editor Review UI

### Original Target

The original editor review layer expected the editor to be able to inspect:

- topic brief
- article preview
- schema preview
- mapping preview
- validation output

It also expected the editor to be able to:

- approve
- edit
- request regeneration
- adjust mappings
- approve for publishing

### Current MVP

The current UI substantially satisfies the core review requirement.

The admin experience already includes:

- brief panel
- output panel
- stage-by-stage pipeline cards
- final save action

### Practical Impact

The biggest functional gap is rerun granularity.

Today, the editor cannot:

- rerun a specific stage only
- regenerate a specific section only
- adjust mapping in a dedicated mapping UI

So the review UI is good enough for MVP editorial review, but it is not yet a fine-grained editorial workspace.

## 6. State Management and Persistent Draft Storage

### Original Target

The original system design included persistent draft storage through tables such as:

- `blog_topic_drafts`
- `blog_article_drafts`

It also included a formal status model such as:

- `DRAFT_GENERATING`
- `DRAFT_READY`
- `MAPPING_READY`
- `VALIDATION_FAILED`
- `NEEDS_EDITOR_REVIEW`
- `APPROVED`
- `PUBLISHED`

### Current MVP

The current system has no persistent draft layer.

Today:

- pipeline state exists in React state
- stage artifacts disappear if the page is refreshed
- there is no draft reopening flow
- there is no stored editorial status between generation and publishing

### Practical Impact

This is the second largest gap after Topic Agent.

Without persistent draft storage:

- work is session-bound
- failed or interrupted runs are not resumable
- editors cannot reopen prior in-progress drafts
- there is no durable editorial workflow state

This is the biggest structural reason the current implementation is still an MVP pipeline rather than a complete editorial system.

## 7. Publishing Layer

### Original Target

The original short-term publish strategy was:

- article as `.md`
- sidecar schema as `.schema.json`
- save into `apps/public-web/content/blog`

### Current MVP

This is fully implemented.

The current save flow writes:

- `slug.md`
- `slug.schema.json`

into the expected blog content folder.

### Practical Impact

This part of the system matches the original design as intended.

## What The MVP Already Does Well

Even with the missing system layers, the MVP already does several important things very well:

- it produces higher-quality output than a one-pass generator
- it separates planning from writing
- it makes review explicit rather than implied
- it treats packaging as a real publish gate
- it exposes artifacts in a debuggable admin UI

So the right way to describe the current system is:

- not a full editorial operating system yet
- but already a high-quality editorial content generation pipeline

## What Is Missing To Reach The Original Vision

To move from the current MVP to the original system vision, the missing pieces are primarily:

1. topic discovery and prioritization
2. validated product and category mapping
3. system-aware validation against live catalog and routes
4. persistent draft storage
5. formal editorial state transitions
6. more granular regeneration controls

## Recommended Next-Step Plan

The next steps should not try to build the entire original system at once.

The best path is to preserve the strong current content pipeline and add system layers around it in the right order.

## Phase 1: Strengthen The MVP As A Durable Workflow

Goal:
Keep the current generation pipeline, but make it safer, traceable, and easier to evolve.

### Step 1. Add Run Metadata

Add:

- `runId`
- per-stage timing
- per-stage model metadata
- structured logs tied to one run

Why first:

- this improves debugging immediately
- it prepares the system for persistence later

### Step 2. Add Deterministic Validation

Add validation that does not rely on the reviewer model, including:

- slug checks
- required frontmatter fields
- excerpt and metadata checks
- internal link shape checks
- markdown generation consistency

Why now:

- this closes some real MVP reliability gaps without needing database persistence yet

### Step 3. Add Partial Rerun

Allow rerunning:

- planner only
- writer only
- reviewer only
- packaging only

Why now:

- this gives the editor a better tool without rebuilding the whole system
- it reduces friction before draft persistence exists

## Phase 2: Add Persistent Editorial State

Goal:
Move from session-bound generation to resumable editorial work.

### Step 4. Introduce Draft Storage

Add persistent records for:

- brief snapshot
- stage outputs
- current final package
- validation output
- editor notes

Recommended initial table focus:

- `blog_article_drafts`

Why first:

- article-level persistence gives immediate value without requiring topic automation first

### Step 5. Add Editorial Status Flow

Introduce status values such as:

- `DRAFT_GENERATING`
- `DRAFT_READY`
- `VALIDATION_FAILED`
- `NEEDS_EDITOR_REVIEW`
- `APPROVED`
- `PUBLISHED`

Why now:

- once data is persistent, status becomes meaningful
- this is the first step from generator toward editorial system

### Step 6. Add Reopen and Resume Flow

Allow editors to:

- reopen existing drafts
- continue reviewing prior runs
- resave without regenerating everything

Why now:

- this turns the current page from a one-shot tool into an actual workflow surface

## Phase 3: Add Real Mapping And Environment-Aware Validation

Goal:
Connect article output to real catalog truth.

### Step 7. Add Dedicated Mapper

Introduce a dedicated mapping layer that takes article output and validates or builds:

- category targets
- collection targets
- product targets when appropriate

The mapper should prefer stable commercial destinations first.

### Step 8. Validate Targets Against Real Data

The system should check:

- target routes exist
- mapped categories are populated
- mapped products are published and valid

Why this matters:

- this closes one of the biggest gaps between plausible AI output and operationally correct content

## Phase 4: Add Topic Discovery

Goal:
Restore the most commercially valuable part of the original design.

### Step 9. Build Topic Intake Layer

Create a system that can ingest:

- search query signals
- analytics signals
- site search signals
- catalog and sales signals
- manual campaign priorities

### Step 10. Build Topic Agent

Generate prioritized topic candidates with:

- title
- intent
- audience
- why now
- recommended targets
- priority score

Why this comes later:

- the generation and review engine is already strong
- topic automation is most valuable once the editorial workflow can store and manage draft state

## Suggested Build Order

If implementation needs a concrete order, use this:

1. run metadata and structured logging
2. deterministic validation
3. partial rerun
4. persistent article draft storage
5. editorial status flow
6. reopen and resume workflow
7. dedicated mapper
8. target validation against catalog and routes
9. topic intake layer
10. topic agent

## Strategic Summary

The current system is not a failed version of the original spec.

It is a successful first-version MVP of the most quality-sensitive part of the spec.

What has been built well:

- content generation quality control
- editorial stage separation
- reviewer and rewriter loop
- packaging and save flow

What still needs to be built to realize the original vision:

- topic discovery
- persistent state
- true mapper logic
- environment-aware validation
- formal editorial workflow lifecycle

That framing matters because the next step is not "replace the MVP."

The next step is to keep the current pipeline as the editorial core and build the missing system layers around it.

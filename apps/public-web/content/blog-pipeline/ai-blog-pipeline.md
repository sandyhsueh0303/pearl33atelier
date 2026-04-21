# 33 Pearl Atelier AI Blog Pipeline

This document describes what the AI blog pipeline does, why each stage exists, and how the stages work together to produce a publishable blog post.

## Purpose

The AI blog pipeline is a structured editorial workflow for generating 33 Pearl Atelier blog content with better consistency, quality control, and publishability.

Instead of asking one model to do everything in a single pass, the pipeline splits the work into separate editorial stages. Each stage has a different job:
- planning the article direction
- drafting the article
- reviewing the draft critically
- rewriting based on real feedback
- packaging the final output into the exact format the site needs

This separation helps reduce common AI writing failures such as:
- generic structure
- repetitive or padded content
- weak editorial judgment
- reviewer grade inflation
- metadata that does not match the article
- output that looks valid but is not actually ready to save or publish

## High-Level Flow

The pipeline currently works like this:

1. `article brief`
2. `planner`
3. `writer`
4. `reviewer`
5. `rewriter` when needed
6. `packaging`
7. final article package / Markdown document

At every stage, the system uses the shared brand and schema references to keep outputs aligned.

## Shared References

These files act as the main contracts for the pipeline:

- `blog-ai-handbook.md`
  Defines brand voice, article standards, SEO rules, and content boundaries.
- `article-brief.schema.json`
  Defines the input structure for a human-authored article brief.
- `article-package.schema.json`
  Defines the final output structure for a publishable article package.

The prompt files for each stage also act as behavioral contracts for the AI agents.

## Stage 1: Article Brief

The article brief is the human-authored input to the pipeline.

It defines:
- the article slug
- the working title
- the primary keyword and search intent
- the audience
- the article type
- the editorial goal
- required topics to cover
- CTA direction
- optional factual or brand context

This is the source of truth for what the article is supposed to do.

## Stage 2: Planner

Prompt: [planner-prompt.md](/Users/sandyhsueh/pearl33atelier/apps/public-web/content/blog-pipeline/planner-prompt.md)

The planner turns the brief into a writer-ready editorial plan.

Its job is to:
- identify the real reader question
- narrow the article angle
- define the article promise
- create a useful outline with real direction
- draft frontmatter direction
- call out risks and writer guidance

The planner should not write the article body.

Its output is meant to make the next stage easier and safer by preventing vague, repetitive, or generic article structures.

## Stage 3: Writer

Prompt: [writer-prompt.md](/Users/sandyhsueh/pearl33atelier/apps/public-web/content/blog-pipeline/writer-prompt.md)

The writer turns the planner output into a full article package draft.

Its job is to:
- write the article body in 33 Pearl Atelier's voice
- follow the planner's structure and angle
- produce usable metadata
- return the article in the schema-aligned package format

The writer is expected to produce real editorial substance, not just polished prose.

The writer output typically includes:
- `slug`
- `frontmatter`
- `bodyMarkdown`
- `markdownDocument`
- `internalLinks`
- `qa`

## Stage 4: Reviewer

Prompt: [reviewer-prompt.md](/Users/sandyhsueh/pearl33atelier/apps/public-web/content/blog-pipeline/reviewer-prompt.md)

The reviewer acts like a skeptical editor.

Its job is to:
- verify alignment with the brief and planner
- catch thin, generic, repetitive, or overpromising drafts
- check factual restraint and brand tone
- validate metadata quality
- decide whether the draft is truly ready or still needs revision

The reviewer is intentionally calibrated to avoid false positives. It should not approve a draft just because:
- it sounds smooth
- it is schema-valid
- nothing looks obviously broken

The reviewer can:
- approve a package that is genuinely publishable
- revise a package that still has meaningful editorial problems

## Stage 5: Rewriter

Prompt: [rewriter-prompt.md](/Users/sandyhsueh/pearl33atelier/apps/public-web/content/blog-pipeline/rewriter-prompt.md)

The rewriter exists for cases where the reviewer found real issues.

Its job is to:
- take reviewer feedback seriously
- fix blocking issues first
- improve weak sections materially
- preserve what already works
- return a revised package that is actually better than the prior version

This stage is important because "feedback received" is not the same as "article improved."

The rewriter should not only rephrase. It should solve the actual editorial problem the reviewer identified.

## Stage 6: Packaging

Prompt: [packaging-prompt.md](/Users/sandyhsueh/pearl33atelier/apps/public-web/content/blog-pipeline/packaging-prompt.md)

The packaging stage is the final publish gate.

Its job is to:
- normalize the final article package
- remove extra fields that the schema or loader cannot consume
- ensure frontmatter is publishable
- ensure `markdownDocument` is a clean `.md` representation
- make sure FAQ and image prompt inputs are handled correctly

This stage is not supposed to do fresh writing. It is supposed to ensure the final artifact is:
- schema-valid
- loader-friendly
- frontmatter-safe
- ready to save as Markdown

## Final Output

The final output is a JSON article package aligned to `article-package.schema.json`.

In practice, the most important publishable parts are:
- `frontmatter`
- `bodyMarkdown`
- `markdownDocument`

The `markdownDocument` should be the final `.md` file content:
- YAML frontmatter
- one blank line
- article body in Markdown

## Why This Pipeline Exists

This pipeline exists to make AI-generated blog content more editorially reliable.

A single-pass workflow often produces content that is:
- plausible but generic
- cleanly formatted but weak in substance
- SEO-shaped but not reader-useful
- hard to QA because planning, writing, and reviewing are mixed together

By separating responsibilities, this pipeline makes it easier to:
- plan with intent
- write with structure
- review with skepticism
- revise with accountability
- package for real publishing

## Practical Outcome

When the pipeline works well, the final article should be:
- on-brief
- on-brand
- structurally useful
- substantively clear
- metadata-aligned
- publishable without manual cleanup

That is the core goal of the 33 Pearl Atelier AI blog pipeline.

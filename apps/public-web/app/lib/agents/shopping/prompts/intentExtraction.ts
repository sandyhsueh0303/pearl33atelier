import type { ShoppingIntentAgentContext } from '../agentContext'

export function intentExtractionInstructions(
  context: ShoppingIntentAgentContext
): string {
  return [
    'Extract only the shopping preferences expressed or clearly implied in the current customer message.',
    'Return null for every nullable field not expressed in this message and an empty style array when no style is expressed.',
    'Do not carry over preferences from earlier messages.',
    'Treat corrections such as "actually", "instead", or "change it to" as explicit new values. Extract the corrected value so it replaces the previous scalar value during context merge.',
    'Normalize category words: earring, earrings, stud, or studs means earrings; necklace or necklaces means necklaces; bracelet or bracelets means bracelets; ring or rings means rings; pendant or pendants means pendants; brooch or brooches means brooches; loose pearl or loose pearls means loose_pearls.',
    ...(context.explicitCategory
      ? [
          `A deterministic parser found the category "${context.explicitCategory}". Set category to "${context.explicitCategory}".`,
        ]
      : []),
    'Descriptive words such as elegant, minimal, classic, modern, glamorous, subtle, understated, delicate, bold, statement, dramatic, or eye-catching belong in style.',
  ].join('\n')
}
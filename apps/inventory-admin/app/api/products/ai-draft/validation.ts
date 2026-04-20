export type AiDraft = {
  title: string
  subtitle: string
  category: string
  pearlType: string
  shape: string
  luster: string
  overtone: string
  why_youll_love_it?: string[]
  perfect_for?: string[]
  description: string
  seoTitle: string
  seoDescription: string
  seoKeywords?: string[]
  ogImageAlt: string
}

export type DraftValidationIssue = {
  severity: 'error' | 'warning'
  field: string
  message: string
  source?: 'validation' | 'consistency'
}

export type DraftValidationResult = {
  issues: DraftValidationIssue[]
  errorCount: number
  warningCount: number
  canCreateDraft: boolean
}

const VALID_CATEGORIES = new Set([
  'bracelets',
  'bracelet',
  'necklaces',
  'necklace',
  'earrings',
  'earring',
  'studs',
  'stud',
  'rings',
  'ring',
  'pendants',
  'pendant',
  'loose pearls',
  'loose pearl',
  'brooches',
  'brooch',
])

const VALID_PEARL_TYPES = new Set([
  'whiteakoya',
  'greyakoya',
  'grayakoya',
  'whitesouthsea',
  'white south sea',
  'goldensouthsea',
  'golden south sea',
  'tahitian',
])

const VALID_SHAPES = new Set([
  'round',
  'near round',
  'near-round',
  'drop',
  'button',
  'oval',
  'baroque',
])

const VALID_LUSTERS = new Set(['high', 'soft'])

function pushIssue(
  issues: DraftValidationIssue[],
  severity: DraftValidationIssue['severity'],
  field: string,
  message: string,
  source: DraftValidationIssue['source'] = 'validation'
) {
  issues.push({ severity, field, message, source })
}

function normalize(value: string | null | undefined) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function normalizePearlTypeForValidation(value: string | null | undefined) {
  const readable = normalize(value).replace(/\bpearls?\b/g, '').replace(/\s+/g, ' ').trim()

  if (readable === 'whiteakoya') return 'whiteakoya'
  if (readable === 'greyakoya' || readable === 'grayakoya') return 'greyakoya'
  if (readable === 'whitesouthsea') return 'whitesouthsea'
  if (readable === 'goldensouthsea') return 'goldensouthsea'
  return readable
}

function hasThreeNonEmptyItems(values: string[] | undefined) {
  return (values || []).filter((value) => String(value || '').trim()).length === 3
}

function hasAtLeastThreeNonEmptyItems(values: string[] | undefined) {
  return (values || []).filter((value) => String(value || '').trim()).length >= 3
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function includesPhrase(text: string, value: string) {
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(value)}($|[^a-z0-9])`, 'i')
  return pattern.test(text)
}

function includesAny(text: string, values: string[]) {
  return values.some((value) => includesPhrase(text, value))
}

function findFirstMatch(text: string, values: string[]) {
  return values.find((value) => includesPhrase(text, value)) || null
}

function getPearlTypeSignals(value: string) {
  switch (value) {
    case 'greyakoya':
    case 'grayakoya':
      return {
        expected: ['grey akoya', 'gray akoya'],
        conflicting: ['white akoya', 'south sea', 'tahitian', 'freshwater'],
      }
    case 'whiteakoya':
    case 'akoya':
      return {
        expected: ['white akoya', 'akoya'],
        conflicting: ['grey akoya', 'gray akoya', 'south sea', 'tahitian', 'freshwater'],
      }
    case 'whitesouthsea':
    case 'white south sea':
      return {
        expected: ['white south sea', 'south sea'],
        conflicting: ['akoya', 'tahitian', 'freshwater', 'golden south sea'],
      }
    case 'goldensouthsea':
    case 'golden south sea':
      return {
        expected: ['golden south sea', 'south sea'],
        conflicting: ['akoya', 'tahitian', 'freshwater', 'white south sea'],
      }
    case 'tahitian':
      return {
        expected: ['tahitian'],
        conflicting: ['akoya', 'south sea', 'freshwater'],
      }
    case 'freshwater':
      return {
        expected: ['freshwater'],
        conflicting: ['akoya', 'south sea', 'tahitian'],
      }
    default:
      return null
  }
}

function getCategorySignals(value: string) {
  switch (value) {
    case 'earrings':
    case 'earring':
    case 'studs':
    case 'stud':
      return {
        expected: ['earring', 'earrings', 'stud', 'studs'],
        conflicting: ['necklace', 'bracelet', 'ring', 'pendant', 'brooch'],
      }
    case 'necklaces':
    case 'necklace':
      return {
        expected: ['necklace', 'strand', 'station'],
        conflicting: ['earring', 'stud', 'bracelet', 'ring', 'brooch'],
      }
    case 'bracelets':
    case 'bracelet':
      return {
        expected: ['bracelet'],
        conflicting: ['earring', 'stud', 'necklace', 'ring', 'brooch'],
      }
    case 'rings':
    case 'ring':
      return {
        expected: ['ring'],
        conflicting: ['earring', 'stud', 'necklace', 'bracelet', 'brooch'],
      }
    case 'pendants':
    case 'pendant':
      return {
        expected: ['pendant'],
        conflicting: ['earring', 'stud', 'bracelet', 'ring', 'brooch'],
      }
    case 'brooches':
    case 'brooch':
      return {
        expected: ['brooch'],
        conflicting: ['earring', 'stud', 'necklace', 'bracelet', 'ring'],
      }
    default:
      return null
  }
}

function getShapeSignals(value: string) {
  switch (value) {
    case 'round':
      return { expected: ['round'], conflicting: ['baroque', 'drop', 'oval', 'button'] }
    case 'drop':
      return { expected: ['drop'], conflicting: ['round', 'baroque', 'oval', 'button'] }
    case 'oval':
      return { expected: ['oval'], conflicting: ['round', 'baroque', 'drop', 'button'] }
    case 'button':
      return { expected: ['button'], conflicting: ['round', 'baroque', 'drop', 'oval'] }
    case 'baroque':
      return { expected: ['baroque'], conflicting: ['round', 'drop', 'oval', 'button'] }
    default:
      return null
  }
}

function runConsistencyChecks(draft: AiDraft, issues: DraftValidationIssue[]) {
  const text = [draft.title, draft.subtitle, draft.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const pearlType = getPearlTypeSignals(normalize(draft.pearlType))
  if (pearlType) {
    if (includesAny(text, pearlType.conflicting)) {
      pushIssue(
        issues,
        'warning',
        'pearlType',
        'Structured pearl type conflicts with wording in the generated copy.',
        'consistency'
      )
    } else if (!includesAny(text, pearlType.expected)) {
      pushIssue(
        issues,
        'warning',
        'pearlType',
        'Generated copy does not clearly reinforce the selected pearl type.',
        'consistency'
      )
    }
  }

  const category = getCategorySignals(normalize(draft.category))
  if (category) {
    const conflictingWord = findFirstMatch(text, category.conflicting)
    if (conflictingWord) {
      pushIssue(
        issues,
        'error',
        'category',
        `Structured category conflicts with wording in the generated copy. Detected "${conflictingWord}".`,
        'consistency'
      )
    }
  }

  const shape = getShapeSignals(normalize(draft.shape))
  if (shape) {
    const conflictingWord = findFirstMatch(text, shape.conflicting)
    if (conflictingWord) {
      pushIssue(
        issues,
        'warning',
        'shape',
        `Structured shape conflicts with wording in the generated copy. Detected "${conflictingWord}".`,
        'consistency'
      )
    }
  }

  const overtone = normalize(draft.overtone)
  if (overtone) {
    const overtoneWords = overtone
      .split(/[\s-]+/)
      .map((value) => value.trim())
      .filter(Boolean)
      .filter((value) => !['iridescent'].includes(value))

    if (overtoneWords.length > 0 && !overtoneWords.some((value) => text.includes(value))) {
      pushIssue(
        issues,
        'warning',
        'overtone',
        'Generated copy does not clearly mention the overtone reflected in the structured field.',
        'consistency'
      )
    }
  }
}

export function validateAiDraft(draft: AiDraft): DraftValidationResult {
  const issues: DraftValidationIssue[] = []
  const title = String(draft.title || '').trim()
  const subtitle = String(draft.subtitle || '').trim()
  const combinedText = [draft.title, draft.subtitle, draft.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const category = normalize(draft.category)
  const pearlType = normalizePearlTypeForValidation(draft.pearlType)
  const shape = normalize(draft.shape)
  const luster = normalize(draft.luster)
  const overtone = String(draft.overtone || '').trim()
  const description = String(draft.description || '').trim()
  const seoTitle = String(draft.seoTitle || '').trim()
  const seoDescription = String(draft.seoDescription || '').trim()
  const seoKeywords = (draft.seoKeywords || []).map((value) => String(value || '').trim()).filter(Boolean)
  const ogImageAlt = String(draft.ogImageAlt || '').trim()

  if (!title) {
    pushIssue(issues, 'error', 'title', 'Title is required.')
  } else if (title.length < 8) {
    pushIssue(issues, 'warning', 'title', 'Title looks short. Consider a clearer product-focused title.')
  }

  if (!subtitle) {
    pushIssue(issues, 'error', 'subtitle', 'Subtitle is required.')
  } else {
    if (subtitle.length < 8) {
      pushIssue(issues, 'warning', 'subtitle', 'Subtitle looks short. Consider adding size or overtone.')
    }
    if (!/\d/.test(subtitle)) {
      pushIssue(issues, 'warning', 'subtitle', 'Subtitle does not include a visible size cue.')
    }
  }

  if (!VALID_CATEGORIES.has(category)) {
    pushIssue(issues, 'error', 'category', 'Category could not be mapped to a supported product category.')
  }

  if (!VALID_PEARL_TYPES.has(pearlType)) {
    pushIssue(
      issues,
      'error',
      'pearlType',
      'Pearl type must be one of WhiteAkoya, GreyAkoya, WhiteSouthSea, GoldenSouthSea, or Tahitian.'
    )
  }

  if (!VALID_SHAPES.has(shape)) {
    pushIssue(issues, 'warning', 'shape', 'Shape is missing or outside the supported shape list.')
  }

  if (!VALID_LUSTERS.has(luster)) {
    pushIssue(issues, 'warning', 'luster', 'Luster should usually be high or soft.')
  }

  if (!overtone) {
    pushIssue(issues, 'warning', 'overtone', 'Overtone is blank. Add one if the piece has a clear tone.')
  }

  if (!hasThreeNonEmptyItems(draft.why_youll_love_it)) {
    pushIssue(issues, 'error', 'why_youll_love_it', 'Why You’ll Love It should have exactly 3 bullet points.')
  }

  if (!hasThreeNonEmptyItems(draft.perfect_for)) {
    pushIssue(issues, 'error', 'perfect_for', 'Perfect For should have exactly 3 bullet points.')
  }

  if (!description) {
    pushIssue(issues, 'error', 'description', 'Description is required.')
  } else {
    if (!description.includes('WHY YOU’LL LOVE IT')) {
      pushIssue(
        issues,
        'error',
        'description',
        'Description is missing the WHY YOU’LL LOVE IT section heading.'
      )
    }
    if (!description.includes('PERFECT FOR')) {
      pushIssue(issues, 'error', 'description', 'Description is missing the PERFECT FOR section heading.')
    }
    if (!/pearl/i.test([title, subtitle, description].join(' '))) {
      pushIssue(
        issues,
        'warning',
        'description',
        'The draft does not explicitly mention pearl, which may make the copy feel too generic.'
      )
    }
  }

  if (!seoTitle) {
    pushIssue(issues, 'error', 'seoTitle', 'SEO title is required.')
  } else {
    if (seoTitle.length < 30) {
      pushIssue(issues, 'warning', 'seoTitle', 'SEO title looks short. Aim for a clearer search result title.')
    }
    if (seoTitle.length > 70) {
      pushIssue(issues, 'warning', 'seoTitle', 'SEO title is long and may be truncated in search results.')
    }
  }

  if (!seoDescription) {
    pushIssue(issues, 'error', 'seoDescription', 'SEO description is required.')
  } else {
    if (seoDescription.length < 110) {
      pushIssue(issues, 'warning', 'seoDescription', 'SEO description looks short. Aim for roughly 120-160 characters.')
    }
    if (seoDescription.length > 170) {
      pushIssue(issues, 'warning', 'seoDescription', 'SEO description is long and may be truncated in search results.')
    }
  }

  if (!hasAtLeastThreeNonEmptyItems(draft.seoKeywords)) {
    pushIssue(issues, 'warning', 'seoKeywords', 'Add at least 3 SEO keywords to improve targeting coverage.')
  }

  if (!ogImageAlt) {
    pushIssue(issues, 'error', 'ogImageAlt', 'Open Graph image alt text is required.')
  } else if (ogImageAlt.length < 20) {
    pushIssue(issues, 'warning', 'ogImageAlt', 'Open Graph image alt text looks short. Add more descriptive detail.')
  }

  runConsistencyChecks(draft, issues)

  const errorCount = issues.filter((issue) => issue.severity === 'error').length
  const warningCount = issues.length - errorCount

  return {
    issues,
    errorCount,
    warningCount,
    canCreateDraft: errorCount === 0,
  }
}

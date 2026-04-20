export const MATERIAL_OPTIONS = [
  '18K Gold',
  '18K White Gold',
  '925 Sterling Silver with 18K Gold Plating',
  '925 Sterling Silver with White Gold Plating',
  'Natural Diamond',
  'Lab-Grown Diamond',
  'Cubic Zirconia',
] as const

export const PEARL_TYPE_OPTIONS = [
  'WhiteAkoya',
  'GreyAkoya',
  'WhiteSouthSea',
  'GoldenSouthSea',
  'Tahitian',
  'Freshwater',
  'Other',
] as const

export const SHAPE_OPTIONS = [
  'round',
  'near-round',
  'drop',
  'button',
  'oval',
  'baroque',
] as const

export const LUSTER_OPTIONS = ['high', 'soft'] as const

export const OVERTONE_GROUPS = {
  'Warm Glow': ['white', 'cream', 'pink', 'rose', 'gold'],
  'Cool Tone': [
    'silver',
    'silver-blue',
    'peacock',
    'green peacock',
    'blue peacock',
    'aubergine',
    'charcoal',
    'dark green',
    'dark blue',
    'graphite',
  ],
  Iridescent: [
    'iridescent',
    'pink iridescent',
    'green iridescent',
    'blue iridescent',
    'gold iridescent',
    'pink-green iridescent',
    'pink-blue iridescent',
    'green-blue iridescent',
    'multi iridescent',
  ],
} as const

export const OVERTONE_OPTIONS = Object.values(OVERTONE_GROUPS).flat()

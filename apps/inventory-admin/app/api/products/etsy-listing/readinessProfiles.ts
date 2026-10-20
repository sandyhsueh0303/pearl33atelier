export type EtsyReadinessState = 'ready_to_ship' | 'made_to_order'

export type EtsyReadinessProfile = {
  readinessStateId: number
  readinessState: EtsyReadinessState
  minProcessingDays: number | null
  maxProcessingDays: number | null
  displayLabel: string | null
}

type CatalogAvailability = 'IN_STOCK' | 'PREORDER' | 'OUT_OF_STOCK'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function readinessStateForAvailability(
  availability: CatalogAvailability
): EtsyReadinessState {
  if (availability === 'IN_STOCK') return 'ready_to_ship'
  if (availability === 'PREORDER') return 'made_to_order'
  throw new Error(
    'This product is out of stock. Change its catalog availability before creating an Etsy Draft.'
  )
}

export function parseEtsyReadinessProfiles(payload: unknown): EtsyReadinessProfile[] {
  if (!isRecord(payload) || !Array.isArray(payload.results)) return []

  const profiles: EtsyReadinessProfile[] = []
  const seenIds = new Set<number>()
  for (const value of payload.results) {
    if (!isRecord(value)) continue
    const readinessStateId = Number(value.readiness_state_id)
    const readinessState = value.readiness_state
    if (
      !Number.isSafeInteger(readinessStateId) ||
      readinessStateId <= 0 ||
      (readinessState !== 'ready_to_ship' && readinessState !== 'made_to_order') ||
      seenIds.has(readinessStateId)
    ) {
      continue
    }

    seenIds.add(readinessStateId)
    profiles.push({
      readinessStateId,
      readinessState,
      minProcessingDays: optionalNumber(value.min_processing_days),
      maxProcessingDays: optionalNumber(value.max_processing_days),
      displayLabel:
        typeof value.processing_days_display_label === 'string' &&
        value.processing_days_display_label.trim()
          ? value.processing_days_display_label.trim()
          : null,
    })
  }
  return profiles
}

export function matchingReadinessProfiles(
  profiles: EtsyReadinessProfile[],
  readinessState: EtsyReadinessState
) {
  return profiles.filter((profile) => profile.readinessState === readinessState)
}

export function requireSelectedReadinessProfile(input: {
  profiles: EtsyReadinessProfile[]
  readinessState: EtsyReadinessState
  selectedProfileId: number
}) {
  const matchingProfiles = matchingReadinessProfiles(
    input.profiles,
    input.readinessState
  )
  if (matchingProfiles.length === 0) {
    throw new Error(
      `No existing Etsy ${input.readinessState} processing profile is available. Create one in Etsy Shop Manager, then refresh this page. This integration does not create processing profiles automatically; API creation would require reconnecting with the shops_w permission.`
    )
  }

  const selectedProfile = matchingProfiles.find(
    (profile) => profile.readinessStateId === input.selectedProfileId
  )
  if (!selectedProfile) {
    throw new Error(
      `Choose an existing Etsy ${input.readinessState} processing profile for this product and try again.`
    )
  }
  return selectedProfile
}

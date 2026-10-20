export type EtsyReadinessState = 'ready_to_ship' | 'made_to_order'

export type FrontendEtsyReadinessProfile = {
  readinessStateId: number
  readinessState: EtsyReadinessState
}

export type EtsyProfileSelection = {
  readinessStateId: number | null
  shippingProfileId: number | null
}

export type FrontendEtsyShippingProfile = {
  shipping_profile_id: number
  title: string
}

export function selectDefaultShippingProfileId(input: {
  currentId: number | null | undefined
  profiles: FrontendEtsyShippingProfile[]
}) {
  const validProfiles = input.profiles.filter(
    (profile) =>
      Number.isSafeInteger(profile.shipping_profile_id) &&
      profile.shipping_profile_id > 0
  )
  if (
    Number.isSafeInteger(input.currentId) &&
    validProfiles.some((profile) => profile.shipping_profile_id === input.currentId)
  ) {
    return input.currentId as number
  }

  return (
    validProfiles.find((profile) => profile.title.trim().toLowerCase() === 'shipping')
      ?.shipping_profile_id ??
    validProfiles[0]?.shipping_profile_id ??
    null
  )
}

export function isLatestEtsyOptionsRequest(
  requestVersion: number,
  currentVersion: number
) {
  return requestVersion === currentVersion
}

export function hasValidReadinessProfileSelection(input: {
  readinessStateId: number | null | undefined
  readinessState: EtsyReadinessState | null
  profiles: FrontendEtsyReadinessProfile[]
  profilesReady: boolean
}) {
  if (
    !input.profilesReady ||
    !input.readinessState ||
    !Number.isSafeInteger(input.readinessStateId) ||
    Number(input.readinessStateId) <= 0
  ) {
    return false
  }

  return input.profiles.some(
    (profile) =>
      profile.readinessState === input.readinessState &&
      profile.readinessStateId === input.readinessStateId
  )
}

export function reconcileEtsyProfileSelection(input: {
  selection: EtsyProfileSelection
  connected: boolean
  connectionChanged?: boolean
  profileRefresh: 'loading' | 'ready' | 'failed'
  readinessState: EtsyReadinessState | null
  profiles: FrontendEtsyReadinessProfile[]
}): EtsyProfileSelection {
  if (!input.connected || input.connectionChanged) {
    return { readinessStateId: null, shippingProfileId: null }
  }

  if (input.profileRefresh === 'loading') return input.selection
  if (input.profileRefresh === 'failed') {
    return { ...input.selection, readinessStateId: null }
  }

  return hasValidReadinessProfileSelection({
    readinessStateId: input.selection.readinessStateId,
    readinessState: input.readinessState,
    profiles: input.profiles,
    profilesReady: true,
  })
    ? input.selection
    : { ...input.selection, readinessStateId: null }
}

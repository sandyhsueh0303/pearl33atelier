'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import AdminPageHeader from '../../../components/AdminPageHeader'
import {
  DEFAULT_ETSY_ITEM_PACKAGE,
  ETSY_DIMENSION_UNITS,
  ETSY_WEIGHT_UNITS,
} from '@/app/lib/etsyListingPackage'
import styles from './EtsyListingClient.module.css'
import {
  hasValidReadinessProfileSelection,
  isLatestEtsyOptionsRequest,
  reconcileEtsyProfileSelection,
  selectDefaultShippingProfileId,
  type EtsyReadinessState,
} from './etsyProfileSelection'

type ListingDraft = {
  title: string
  description: string
  tags: string[]
  materials: string[]
  style: string[]
  imageOrder: string[]
  attributeSuggestions: Array<{ name: string; values: string[] }>
  price: number | null
  quantity: number | null
  taxonomyId: number | null
  whoMade: '' | 'i_did' | 'someone_else' | 'collective'
  whenMade: string
  isSupply: boolean
  shippingProfileId: number | null
  readinessStateId: number | null
  itemWeight: number | null
  itemWeightUnit: (typeof ETSY_WEIGHT_UNITS)[number]
  itemLength: number | null
  itemWidth: number | null
  itemHeight: number | null
  itemDimensionsUnit: (typeof ETSY_DIMENSION_UNITS)[number]
}

type ListingImage = { id: string; url: string; sortOrder: number }
type TaxonomyOption = { id: number; label: string; name: string }
type EtsyProperty = {
  property_id: number
  name: string
  supports_attributes: boolean
  possible_values?: Array<{ value_id: number; name: string }>
}
type EtsyOptions = {
  connected: boolean
  shop?: { shopId: number; shopName: string }
  taxonomy: TaxonomyOption[]
  properties?: EtsyProperty[]
  shippingProfiles: Array<{ shipping_profile_id: number; title: string }>
  readinessProfiles: Array<{
    readinessStateId: number
    readinessState: 'ready_to_ship' | 'made_to_order'
    minProcessingDays: number | null
    maxProcessingDays: number | null
    displayLabel: string | null
  }>
}

const whenMadeOptions = [
  ['made_to_order', 'Made to order'],
  ['2020_2026', '2020-2026'],
  ['2010_2019', '2010-2019'],
  ['2007_2009', '2007-2009'],
  ['before_2007', 'Before 2007'],
  ['2000_2006', '2000-2006'],
  ['1990s', '1990s'],
  ['1980s', '1980s'],
  ['1970s', '1970s'],
  ['1960s', '1960s'],
  ['1950s', '1950s'],
  ['1940s', '1940s'],
  ['1930s', '1930s'],
  ['1920s', '1920s'],
  ['1910s', '1910s'],
  ['1900s', '1900s'],
  ['1800s', '1800s'],
  ['1700s', '1700s'],
  ['before_1700', 'Before 1700'],
]

function emptyDraft(): ListingDraft {
  return {
    title: '',
    description: '',
    tags: Array.from({ length: 13 }, () => ''),
    materials: [],
    style: [],
    imageOrder: [],
    attributeSuggestions: [],
    price: null,
    quantity: 1,
    taxonomyId: null,
    whoMade: 'i_did',
    whenMade: 'made_to_order',
    isSupply: false,
    shippingProfileId: null,
    readinessStateId: null,
    ...DEFAULT_ETSY_ITEM_PACKAGE,
  }
}

function isPositiveNumber(value: number | null) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export default function EtsyListingClient({ productId }: { productId: string }) {
  const [options, setOptions] = useState<EtsyOptions | null>(null)
  const [optionsReady, setOptionsReady] = useState(false)
  const [connected, setConnected] = useState(false)
  const [connectionShopId, setConnectionShopId] = useState<number | null>(null)
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft)
  const [images, setImages] = useState<ListingImage[]>([])
  const [draftId, setDraftId] = useState('')
  const [notes, setNotes] = useState('')
  const [loadingConnection, setLoadingConnection] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ listingId: number; url: string } | null>(null)
  const [taxonomySearch, setTaxonomySearch] = useState('')
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({})
  const [suggestedTaxonomy, setSuggestedTaxonomy] = useState<TaxonomyOption | null>(null)
  const [productReadinessState, setProductReadinessState] =
    useState<EtsyReadinessState | null>(null)
  const optionsRequestVersion = useRef(0)
  const previousConnectionShopId = useRef<number | null>(null)

  const reconcileDraftSelection = (input: {
    connected: boolean
    connectionChanged?: boolean
    profileRefresh: 'loading' | 'ready' | 'failed'
    readinessState: EtsyReadinessState | null
    profiles: EtsyOptions['readinessProfiles']
  }) => {
    setDraft((current) => {
      const selection = reconcileEtsyProfileSelection({
        selection: {
          readinessStateId: current.readinessStateId,
          shippingProfileId: current.shippingProfileId,
        },
        ...input,
      })
      if (
        selection.readinessStateId === current.readinessStateId &&
        selection.shippingProfileId === current.shippingProfileId
      ) {
        return current
      }
      return { ...current, ...selection }
    })
  }

  useEffect(() => {
    let active = true
    let connectionConfirmed = false
    const requestVersion = ++optionsRequestVersion.current
    setOptionsReady(false)
    void (async () => {
      try {
        const response = await fetch('/api/etsy/connection', { cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to load Etsy connection.')
        if (!active || !isLatestEtsyOptionsRequest(requestVersion, optionsRequestVersion.current)) return
        const isConnected = Boolean(data.connected)
        connectionConfirmed = isConnected
        setConnected(isConnected)
        setConnectionShopId(isConnected && Number.isSafeInteger(data.shopId) ? data.shopId : null)
        setLoadingConnection(false)
        if (data.connected) {
          const optionResponse = await fetch('/api/etsy/options', { cache: 'no-store' })
          const optionData = await optionResponse.json()
          if (!optionResponse.ok) throw new Error(optionData.error || 'Failed to load Etsy settings.')
          if (!active || !isLatestEtsyOptionsRequest(requestVersion, optionsRequestVersion.current)) return
          setOptions(optionData)
          setOptionsReady(true)
        } else {
          setOptions(null)
          reconcileDraftSelection({
            connected: false,
            profileRefresh: 'failed',
            readinessState: productReadinessState,
            profiles: [],
          })
        }
      } catch (requestError) {
        if (active && isLatestEtsyOptionsRequest(requestVersion, optionsRequestVersion.current)) {
          setOptions(null)
          setOptionsReady(false)
          reconcileDraftSelection({
            connected: connectionConfirmed,
            profileRefresh: 'failed',
            readinessState: productReadinessState,
            profiles: [],
          })
          setError(requestError instanceof Error ? requestError.message : 'Failed to load Etsy settings.')
        }
      } finally {
        if (active && isLatestEtsyOptionsRequest(requestVersion, optionsRequestVersion.current)) setLoadingConnection(false)
      }
    })()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!draft.taxonomyId || !connected) return
    let active = true
    const requestVersion = ++optionsRequestVersion.current
    setOptionsReady(false)
    void fetch(`/api/etsy/options?taxonomyId=${draft.taxonomyId}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to load Etsy attributes.')
        if (!active || !isLatestEtsyOptionsRequest(requestVersion, optionsRequestVersion.current)) return
        setOptions(data)
        setOptionsReady(true)
      })
      .catch((requestError) => {
        if (!active || !isLatestEtsyOptionsRequest(requestVersion, optionsRequestVersion.current)) return
        setOptions(null)
        setOptionsReady(false)
        reconcileDraftSelection({
          connected: true,
          profileRefresh: 'failed',
          readinessState: productReadinessState,
          profiles: [],
        })
        setError(requestError instanceof Error ? requestError.message : 'Failed to load Etsy attributes.')
      })
    return () => { active = false }
  }, [draft.taxonomyId, connected])

  useEffect(() => {
    const connectionChanged = previousConnectionShopId.current !== connectionShopId
    previousConnectionShopId.current = connectionShopId
    if (!connectionChanged) return
    reconcileDraftSelection({
      connected,
      connectionChanged: true,
      profileRefresh: optionsReady ? 'ready' : 'loading',
      readinessState: productReadinessState,
      profiles: options?.readinessProfiles || [],
    })
  }, [connectionShopId, connected])

  useEffect(() => {
    if (!optionsReady || !options) return
    reconcileDraftSelection({
      connected,
      profileRefresh: 'ready',
      readinessState: productReadinessState,
      profiles: options.readinessProfiles,
    })
    setDraft((current) => {
      const shippingProfileId = selectDefaultShippingProfileId({
        currentId: current.shippingProfileId,
        profiles: options.shippingProfiles,
      })
      return shippingProfileId === current.shippingProfileId
        ? current
        : { ...current, shippingProfileId }
    })
  }, [connected, options, optionsReady, productReadinessState])

  const orderedImages = useMemo(() => {
    const byId = new Map(images.map((image) => [image.id, image]))
    return draft.imageOrder.map((id) => byId.get(id)).filter((image): image is ListingImage => Boolean(image))
  }, [draft.imageOrder, images])

  const setField = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const updateArrayText = (value: string) => value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/products/${productId}/etsy-listing/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          taxonomyOptions: options?.taxonomy.map(({ id, label }) => ({ id, label })) || [],
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not generate listing.')
      setDraft({
        ...emptyDraft(),
        ...data.draft,
        tags: data.draft.tags,
        price: data.draft.price,
        taxonomyId: data.taxonomySuggestion?.id || null,
        shippingProfileId: selectDefaultShippingProfileId({
          currentId: draft.shippingProfileId,
          profiles: options?.shippingProfiles || [],
        }),
        readinessStateId: null,
      })
      setSuggestedTaxonomy(data.taxonomySuggestion || null)
      setProductReadinessState(data.product?.readinessState || null)
      setImages(data.images || [])
      setDraftId(crypto.randomUUID())
      setSelectedAttributes({})
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not generate listing.')
    } finally {
      setGenerating(false)
    }
  }

  const validationMessages = useMemo(() => {
    const errors: string[] = []
    if (!draft.title.trim()) errors.push('Title is required.')
    if (draft.tags.length !== 13 || draft.tags.some((tag) => !tag.trim() || tag.trim().length > 20)) {
      errors.push('Enter 13 non-empty tags, each 20 characters or fewer.')
    }
    if (draft.tags.some((tag) => !/^[\p{L}\p{N}\p{Zs}\-'™©®]+$/u.test(tag.trim()))) {
      errors.push('Tags may contain letters, numbers, spaces, hyphens, apostrophes, ™, ©, or ®.')
    }
    if (!draft.materials.length) errors.push('At least one material is required.')
    if (draft.materials.some((material) => !/^[\p{L}\p{N}\p{Zs}]+$/u.test(material.trim()))) {
      errors.push('Materials may contain only letters, numbers, and spaces.')
    }
    if (draft.style.length > 2 || draft.style.some((style) => style.trim().length > 45)) {
      errors.push('Use up to 2 styles, each 45 characters or fewer.')
    }
    if (!draft.taxonomyId) errors.push('Choose an Etsy category.')
    if (!draft.price || draft.price <= 0) errors.push('Enter a positive price.')
    if (!draft.quantity || draft.quantity <= 0) errors.push('Enter a positive listing quantity.')
    if (!draft.whoMade || !draft.whenMade) errors.push('Confirm who made this and when it was made.')
    if (!draft.shippingProfileId) errors.push('Choose an Etsy shipping profile.')
    if (!isPositiveNumber(draft.itemWeight)) errors.push('Enter a positive item weight.')
    if (
      !isPositiveNumber(draft.itemLength) ||
      !isPositiveNumber(draft.itemWidth) ||
      !isPositiveNumber(draft.itemHeight)
    ) {
      errors.push('Enter positive item length, width, and height.')
    }
    if (!hasValidReadinessProfileSelection({
      readinessStateId: draft.readinessStateId,
      readinessState: productReadinessState,
      profiles: options?.readinessProfiles || [],
      profilesReady: optionsReady && Boolean(options),
    })) {
      errors.push('Choose a current Etsy processing profile for this product.')
    }
    if (!draft.imageOrder.length) errors.push('At least one image is required.')
    if (Object.values(selectedAttributes).some((valueId) => !valueId)) errors.push('Complete selected Etsy attributes.')
    return errors
  }, [draft, selectedAttributes, options, optionsReady, productReadinessState])

  const matchingReadinessProfiles = (options?.readinessProfiles || []).filter(
    (profile) => profile.readinessState === productReadinessState
  )

  const handleCreateDraft = async () => {
    if (!draftId || validationMessages.length) return
    setCreating(true)
    setError(null)
    try {
      const attributes = Object.entries(selectedAttributes).map(([propertyId, valueId]) => {
        const property = options?.properties?.find((item) => item.property_id === Number(propertyId))
        const value = property?.possible_values?.find((item) => item.value_id === valueId)
        return {
          propertyId: Number(propertyId),
          valueIds: value ? [value.value_id] : [],
          values: value ? [value.name] : [],
        }
      })
      const response = await fetch(`/api/products/${productId}/etsy-listing/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          draft: { ...draft, attributes },
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not create Etsy Draft.')
      setSuccess({ listingId: data.listingId, url: data.url || `https://www.etsy.com/your/shops/me/tools/listings/${data.listingId}/edit` })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create Etsy Draft.')
    } finally {
      setCreating(false)
    }
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= draft.imageOrder.length) return
    const imageOrder = [...draft.imageOrder]
    ;[imageOrder[index], imageOrder[target]] = [imageOrder[target], imageOrder[index]]
    setField('imageOrder', imageOrder)
  }

  const filteredTaxonomy = (options?.taxonomy || []).filter((item) =>
    item.label.toLowerCase().includes(taxonomySearch.toLowerCase())
  )
  const attributeProperties = (options?.properties || []).filter((item) =>
    item.supports_attributes && item.possible_values?.length
  )

  return (
    <main className="admin-page">
      <AdminPageHeader
        title="Etsy Listing Agent"
        actions={<Link href={`/admin/products/${productId}`} className="admin-link-btn admin-btn-secondary">Back to product</Link>}
      />

      {error && <div className="admin-banner admin-banner-error">{error}</div>}
      {success && (
        <div className="admin-banner admin-banner-success">
          Etsy Draft #{success.listingId} created. It has not been published. <a href={success.url} target="_blank" rel="noreferrer">Review on Etsy</a>
        </div>
      )}

      <section className={`admin-card ${styles.connection}`}>
        <div>
          <h2>Etsy shop</h2>
          <p>{loadingConnection ? 'Checking connection…' : connected ? `Connected to ${options?.shop?.shopName || 'your shop'}` : 'Connect your shop to create Etsy Drafts.'}</p>
        </div>
        {!connected ? (
          <a href="/api/etsy/connect" className="admin-link-btn admin-btn-secondary">Connect Etsy</a>
        ) : (
          <button type="button" className="admin-link-btn admin-btn-secondary" onClick={async () => {
            const response = await fetch('/api/etsy/connection', { method: 'DELETE' })
            const data = await response.json()
            if (!response.ok) {
              setError(data.error || 'Failed to disconnect Etsy.')
              return
            }
            optionsRequestVersion.current += 1
            setConnected(false)
            setConnectionShopId(null)
            setOptions(null)
            setOptionsReady(false)
            reconcileDraftSelection({
              connected: false,
              connectionChanged: true,
              profileRefresh: 'failed',
              readinessState: productReadinessState,
              profiles: [],
            })
          }}>Disconnect</button>
        )}
      </section>

      <section className={`admin-card ${styles.generator}`}>
        <label className={styles.label} htmlFor="etsy-notes">Generation notes</label>
        <textarea id="etsy-notes" className="admin-control" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional facts or tone guidance. Do not include guesses about origin, grade, or certification." />
        <button type="button" className="admin-link-btn admin-link-btn-primary" onClick={() => void handleGenerate()} disabled={generating}>
          {generating ? 'Generating…' : draft.title ? 'Regenerate listing' : 'Generate Etsy listing'}
        </button>
      </section>

      {draft.title && (
        <div className={styles.reviewGrid}>
          <section className={`admin-card ${styles.fields}`}>
            <h2>Listing copy</h2>
            <label className={styles.label}>Title <span>{draft.title.length}/140</span></label>
            <input className="admin-control" maxLength={140} value={draft.title} onChange={(event) => setField('title', event.target.value)} />
            <label className={styles.label}>Description</label>
            <textarea className="admin-control" rows={12} value={draft.description} onChange={(event) => setField('description', event.target.value)} />
            <label className={styles.label}>Materials</label>
            <textarea className="admin-control" rows={3} value={draft.materials.join('\n')} onChange={(event) => setField('materials', updateArrayText(event.target.value))} />
            <label className={styles.label}>Styles (up to 2)</label>
            <textarea className="admin-control" rows={2} value={draft.style.join('\n')} onChange={(event) => setField('style', updateArrayText(event.target.value).slice(0, 2))} />
            <h2>13 Etsy tags</h2>
            <div className={styles.tagGrid}>
              {draft.tags.map((tag, index) => (
                <label className={styles.tagField} key={index}>
                  <span>Tag {index + 1} · {tag.length}/20</span>
                  <input className="admin-control" maxLength={20} value={tag} onChange={(event) => setField('tags', draft.tags.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
                </label>
              ))}
            </div>
          </section>

          <aside className={styles.sideColumn}>
            <section className={`admin-card ${styles.fields}`}>
              <h2>Listing details</h2>
              <label className={styles.label}>Etsy category</label>
              <input className="admin-control" placeholder="Search Etsy categories" value={taxonomySearch} onChange={(event) => setTaxonomySearch(event.target.value)} />
              <select className="admin-control" value={draft.taxonomyId || ''} onChange={(event) => setField('taxonomyId', event.target.value ? Number(event.target.value) : null)}>
                <option value="">Choose category</option>
                {filteredTaxonomy.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
              {suggestedTaxonomy ? (
                <p>AI suggestion: {suggestedTaxonomy.label}</p>
              ) : null}
              <label className={styles.label}>Price</label>
              <input className="admin-control" type="number" min="0.01" step="0.01" value={draft.price ?? ''} onChange={(event) => setField('price', event.target.value ? Number(event.target.value) : null)} />
              <label className={styles.label}>Quantity</label>
              <input className="admin-control" type="number" min="1" step="1" value={draft.quantity ?? ''} onChange={(event) => setField('quantity', event.target.value ? Number(event.target.value) : null)} />
              <label className={styles.label}>Who made this?</label>
              <select className="admin-control" value={draft.whoMade} onChange={(event) => setField('whoMade', event.target.value as ListingDraft['whoMade'])}>
                <option value="">Choose one</option>
                <option value="i_did">I did</option>
                <option value="someone_else">Someone else</option>
                <option value="collective">A collective</option>
              </select>
              <label className={styles.label}>When was it made?</label>
              <select className="admin-control" value={draft.whenMade} onChange={(event) => setField('whenMade', event.target.value)}>
                <option value="">Choose one</option>
                {whenMadeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <label className={styles.checkbox}><input type="checkbox" checked={draft.isSupply} onChange={(event) => setField('isSupply', event.target.checked)} /> This listing is a supply</label>
              <label className={styles.label}>Shipping profile</label>
              <select className="admin-control" value={draft.shippingProfileId || ''} onChange={(event) => setField('shippingProfileId', event.target.value ? Number(event.target.value) : null)}>
                <option value="">Choose shipping profile</option>
                {(options?.shippingProfiles || []).map((profile) => <option key={profile.shipping_profile_id} value={profile.shipping_profile_id}>{profile.title}</option>)}
              </select>
              <h2>Shipping item</h2>
              <p>Enter the item weight and its size after preparation for packaging, but before it is boxed.</p>
              <label className={styles.label}>Item weight</label>
              <div className={styles.measurementField}>
                <input className="admin-control" aria-label="Item weight" type="number" min="0.01" step="0.01" value={draft.itemWeight ?? ''} onChange={(event) => setField('itemWeight', event.target.value ? Number(event.target.value) : null)} />
                <select className="admin-control" aria-label="Item weight unit" value={draft.itemWeightUnit} onChange={(event) => setField('itemWeightUnit', event.target.value as ListingDraft['itemWeightUnit'])}>
                  {ETSY_WEIGHT_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
              <label className={styles.label}>Item size</label>
              <div className={styles.dimensionGrid}>
                <label><span>Length</span><input className="admin-control" type="number" min="0.01" step="0.01" value={draft.itemLength ?? ''} onChange={(event) => setField('itemLength', event.target.value ? Number(event.target.value) : null)} /></label>
                <label><span>Width</span><input className="admin-control" type="number" min="0.01" step="0.01" value={draft.itemWidth ?? ''} onChange={(event) => setField('itemWidth', event.target.value ? Number(event.target.value) : null)} /></label>
                <label><span>Height</span><input className="admin-control" type="number" min="0.01" step="0.01" value={draft.itemHeight ?? ''} onChange={(event) => setField('itemHeight', event.target.value ? Number(event.target.value) : null)} /></label>
              </div>
              <label className={styles.label}>Dimensions unit</label>
              <select className="admin-control" value={draft.itemDimensionsUnit} onChange={(event) => setField('itemDimensionsUnit', event.target.value as ListingDraft['itemDimensionsUnit'])}>
                {ETSY_DIMENSION_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
              <label className={styles.label}>Processing profile</label>
              <select className="admin-control" disabled={!optionsReady} value={draft.readinessStateId || ''} onChange={(event) => setField('readinessStateId', event.target.value ? Number(event.target.value) : null)}>
                <option value="">Choose processing profile</option>
                {matchingReadinessProfiles.map((profile) => (
                  <option key={profile.readinessStateId} value={profile.readinessStateId}>
                    {profile.displayLabel || `${profile.readinessState.replaceAll('_', ' ')} (${profile.minProcessingDays ?? '?'}–${profile.maxProcessingDays ?? '?'} days)`}
                  </option>
                ))}
              </select>
              {productReadinessState && matchingReadinessProfiles.length === 0 ? (
                <p>
                  No existing Etsy {productReadinessState.replaceAll('_', ' ')} processing profile is available. Create one in Etsy Shop Manager, then refresh this page.
                </p>
              ) : null}
              {draft.taxonomyId ? (
                <>
                  <h2>Attributes</h2>
                  {attributeProperties.length ? attributeProperties.map((property) => (
                    <label className={styles.label} key={property.property_id}>
                      {property.name}
                      <select className="admin-control" value={selectedAttributes[property.property_id] || ''} onChange={(event) => setSelectedAttributes((current) => ({ ...current, [property.property_id]: Number(event.target.value) || 0 }))}>
                        <option value="">Not set</option>
                        {property.possible_values?.map((value) => <option key={value.value_id} value={value.value_id}>{value.name}</option>)}
                      </select>
                    </label>
                  )) : <p>{options ? 'No Etsy attributes available for this category.' : 'Loading Etsy attributes…'}</p>}
                  {draft.attributeSuggestions.length > 0 && <details><summary>AI attribute suggestions</summary>{draft.attributeSuggestions.map((item) => <p key={item.name}><strong>{item.name}:</strong> {item.values.join(', ')}</p>)}</details>}
                </>
              ) : null}
            </section>

            <section className={`admin-card ${styles.fields}`}>
              <h2>Image order</h2>
              <p>Choose the Etsy image sequence. The source product order will not change.</p>
              <ol className={styles.imageList}>
                {orderedImages.map((image, index) => (
                  <li key={image.id}>
                    <img src={image.url} alt={`Product image ${index + 1}`} />
                    <span>{index + 1}</span>
                    <div>
                      <button type="button" aria-label="Move image up" disabled={index === 0} onClick={() => moveImage(index, -1)}>↑</button>
                      <button type="button" aria-label="Move image down" disabled={index === orderedImages.length - 1} onClick={() => moveImage(index, 1)}>↓</button>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      )}

      {draft.title ? (
        <section className={`admin-card ${styles.submit}`}>
          <div>
            <h2>Review and create Draft</h2>
            {validationMessages.length ? <ul>{validationMessages.map((message) => <li key={message}>{message}</li>)}</ul> : <p>All required fields are ready. This creates an Etsy Draft only; it will not publish.</p>}
          </div>
          <button type="button" className="admin-link-btn admin-link-btn-primary" disabled={!connected || !optionsReady || creating || validationMessages.length > 0 || !draftId} onClick={() => void handleCreateDraft()}>
            {creating ? 'Creating Etsy Draft…' : 'Create Etsy Draft'}
          </button>
        </section>
      ) : null}
    </main>
  )
}

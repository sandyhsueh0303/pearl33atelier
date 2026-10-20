import EtsyListingClient from './EtsyListingClient'

export default async function EtsyListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EtsyListingClient productId={id} />
}

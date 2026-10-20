import Link from 'next/link'

type EtsyListingButtonProps = { productId: string }

export default function EtsyListingButton({ productId }: EtsyListingButtonProps) {
  return (
    <Link
      href={`/admin/products/${productId}/etsy-listing`}
      className="admin-link-btn admin-btn-secondary"
    >
      Etsy Listing
    </Link>
  )
}

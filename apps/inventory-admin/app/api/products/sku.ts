function parseSkuNumber(sku: string): number | null {
  const match = /^PA(\d{4})$/.exec(sku)
  if (!match) return null
  return Number(match[1])
}

function formatSku(value: number): string {
  return `PA${String(value).padStart(4, '0')}`
}

export async function getNextProductSku(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from('catalog_products')
    .select('sku')
    .not('sku', 'is', null)
    .ilike('sku', 'PA%')
    .order('sku', { ascending: false })
    .limit(100)

  if (error) throw error

  let max = 0
  for (const row of data || []) {
    const n = parseSkuNumber(String(row.sku || ''))
    if (n && n > max) max = n
  }

  return formatSku(max + 1)
}

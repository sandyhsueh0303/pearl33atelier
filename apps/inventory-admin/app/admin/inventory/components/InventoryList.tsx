'use client'

interface InventoryItem {
  id: string
  vendor: string | null
  purchase_date: string | null
  unit_cost: number
  quantity_total: number
  quantity_available: number
  quantity_used: number
  total_value: number
  remaining_value: number
  notes: string | null
  created_at: string
  updated_at: string
}

interface Props {
  items: InventoryItem[]
}

export default function InventoryList({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No inventory items found. Add your first item to get started.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Purchase Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit Cost
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Available
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Used
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Remaining Value
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.vendor || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.purchase_date 
                  ? new Date(item.purchase_date).toLocaleDateString('zh-TW')
                  : '-'
                }
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                ${item.unit_cost.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-medium">
                {item.quantity_available}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {item.quantity_used}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                {item.quantity_total}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                ${item.remaining_value.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <a
                  href={`/admin/inventory/${item.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
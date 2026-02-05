import InventoryForm from "../components/InventoryForm"

export default function NewInventoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Inventory</h1>
      <InventoryForm />
    </div>
  )
}
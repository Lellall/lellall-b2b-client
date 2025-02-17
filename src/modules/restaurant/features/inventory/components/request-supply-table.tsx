import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface InventoryItem {
  id: number
  name: string
  price: number
  measurement: string
  quantity: number
  note: string
}

const initialItems: InventoryItem[] = [
  { id: 1, name: "Apple", price: 45.5, measurement: "Plate", quantity: 0, note: "Two pieces" },
  { id: 2, name: "Mango", price: 45.5, measurement: "Bag", quantity: 2, note: "Two pieces" },
  { id: 3, name: "Maggi", price: 55.5, measurement: "Carton", quantity: 3, note: "Two carton" },
  { id: 4, name: "Spaghetti", price: 65.5, measurement: "Carton", quantity: 4, note: "Two carton" },
  { id: 5, name: "Malt", price: 75.5, measurement: "Carton", quantity: 5, note: "Two carton" },
]

const InventoryTable = ({ setStep }: { setStep: (step: number) => void }) => {
  const [items, setItems] = useState<InventoryItem[]>(initialItems)

  const handleChange = (id: number, field: keyof InventoryItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          // Convert value to number for numeric fields
          const processedValue = field === "price" || field === "quantity" ? Number(value) || 0 : value
          return { ...item, [field]: processedValue }
        }
        return item
      })
    )
  }

  const deleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const addItem = () => {
    const newId = Math.max(...items.map((item) => item.id)) + 1
    setItems([
      ...items,
      {
        id: newId,
        name: "",
        price: 0,
        measurement: "",
        quantity: 0,
        note: "",
      },
    ])
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Measurement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Special Note
                </th>
                <th className="px-6 py-3 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border whitespace-nowrap">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleChange(item.id, "name", e.target.value)}
                      className="w-20 bg-transparent text-sm text-gray-900 border rounded-md p-2 focus:outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 border whitespace-nowrap">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleChange(item.id, "price", e.target.value)}
                      className="w-20 bg-transparent text-sm text-gray-900 border rounded-md p-2 focus:outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 border whitespace-nowrap">
                    <input
                      type="text"
                      value={item.measurement}
                      onChange={(e) => handleChange(item.id, "measurement", e.target.value)}
                      className="w-20 bg-transparent text-sm text-gray-900 border rounded-md p-2 focus:outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 border whitespace-nowrap">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleChange(item.id, "quantity", e.target.value)}
                      className="w-20 bg-transparent text-sm text-gray-900 border rounded-md p-2 focus:outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 border-t whitespace-nowrap">
                    <input
                      type="text"
                      value={item.note}
                      onChange={(e) => handleChange(item.id, "note", e.target.value)}
                      className="w-32 bg-transparent text-sm text-gray-500 border rounded-md p-2 focus:outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-t font-medium">
                    <div className="bg-[#FFF1F3] h-8 w-8 rounded-md">
                      <Button variant="ghost" size="icon" className="text-[#EE4266]" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={addItem}>
            + Add Another
          </Button>
        </div>
      </div>
      <div className="bg-[#0F2116]/[.07] w-full flex justify-end p-4 mt-8 rounded-lg">
        <Button onClick={() => setStep(2)}>Save & Continue</Button>
      </div>
    </>
  )
}

export default InventoryTable

"use client"

import * as React from "react"
import { Search, Folder, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
// import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Item {
  name: string
  quantity: string
  selected: boolean
}

export default function SupplyList() {
  const [items, setItems] = React.useState<Item[]>([
    { name: "Apple", quantity: "10pcs", selected: false },
    { name: "Mango", quantity: "13pcs", selected: false },
    { name: "Maggi", quantity: "2 carton", selected: false },
    { name: "Spaghetti", quantity: "1 carton", selected: false },
  ])
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const selectedItems = items.filter((item) => item.selected)

  //   const toggleItem = (index: number) => {
  //     setItems(items.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item)))
  //   }

  const clearSelection = () => {
    setItems(items.map((item) => ({ ...item, selected: false })))
  }

  return (
    <>
      <div>
        <h3 className="mb-8">Review & Submit</h3>
      </div>
      <div className=" flex flex-row space-x-4">
        {/* List Section */}
        <div className="border rounded-lg shadow-sm w-[300px]">
          <div className="bg-green-800 text-white p-4 rounded-t-lg">
            <h2 className="text-sm font-medium">List Of New Item To Be Supplied</h2>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search items"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <div className="space-y-2 h-[200px] overflow-y-auto">
              <div className="text-sm text-gray-600 mb-2">All Items</div>
              {filteredItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div>
                    <Button variant="ghost" size="icon" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="flex-1">{item.name}</span>
                  <span className="text-gray-600">{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Items Section */}
        <div className="border rounded-lg shadow-sm w-[300px] h-[350px]">
          <div className="bg-red-100 text-red-800 p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-sm font-medium">
              {selectedItems.length === 0 ? "No Existing Items To Be Restock" : "Selected Items"}
            </h2>
            {selectedItems.length > 0 && (
              <button onClick={clearSelection} className="text-sm text-red-600 hover:text-red-800">
                Clear
              </button>
            )}
          </div>

          <div className="p-8">
            {selectedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <Folder className="h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-900">No items selected</p>
                <p className="text-sm text-gray-500">Selected items will be displayed here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="text-gray-600">{item.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full mt-16 flex justify-between p-4 rounded-lg">
      <Button variant="ghost" onClick={() => null}>Back</Button>
        <Button variant="default" onClick={() => null}>Save</Button>
      </div>
    </>
  )
}

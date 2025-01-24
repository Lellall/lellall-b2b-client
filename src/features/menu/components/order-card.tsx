import { Button } from "@/components/ui/button"
import { PenLine, Trash2, Banknote, CreditCard, Wallet2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl } from "@/components/ui/form"
import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"

interface OrderItem {
  name: string
  qty: string
  price: string
}

interface OrderCardProps {
  orderNumber: string
  status: "Ready" | "Pending"
  date: string
  time: string
  items: OrderItem[]
  subtotal: string
}

const OrderCard = ({ orderNumber, status, date, time, items, subtotal }: OrderCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const methods = useForm({
    defaultValues: {
      status: status.toLowerCase(),
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Pending":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <>
      <div className="bg-white shadow-none p-4 space-y-4 hover:shadow-md transition-shadow font-[Lato]">
        <div className="flex justify-between items-start">
          <div className="mt-2">
            <span className="bg-primary text-white text-lg font-semibold text-center rounded-md p-3">
              {orderNumber}
            </span>
            <span className="text-xs text-gray-500 align-baseline ml-2 mt-4">Order #{orderNumber}</span>
          </div>
          <div>
            <Badge className={getStatusColor(status) + " w-[110px] text-xs"}>
              {status === "Ready" ? "Ready to serve" : "completed"}
            </Badge>
            <FormProvider {...methods}>
              <form className="border-none">
                <Select
                  defaultValue={status.toLowerCase()}
                  onValueChange={(value) => {
                    console.log(`Status changed to: ${value}`)
                  }}
                >
                  <FormControl className="border-none bg-white shadow-none">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="progress">In Progress</SelectItem>
                    <SelectItem value="cancel">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </form>
            </FormProvider>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="text-sm text-gray-500">{date}</div>
          <div className="text-sm text-gray-500">{time}</div>
        </div>
        {/* <div className="border-b pt-3"/> */}
        <Separator className="bg-gray-500" />

        <div className="space-y-3">
          <div className="grid grid-cols-4 text-base text-gray-500">
            <div>Qty</div>
            <div className="col-span-2">Items</div>
            <div className="text-right">Price</div>
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-4 text-base">
              <div>{item.qty}</div>
              <div className="col-span-2">{item.name}</div>
              <div className="text-right">{item.price}</div>
            </div>
          ))}
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between text-base">
            <div>SubTotal</div>
            <div className="font-semibold">{subtotal}</div>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <PenLine />
            </Button>
            <Button variant="outline" size="icon">
              <Trash2 />
            </Button>
          </div>
          <Button variant="default" className="text-white w-full mx-4" onClick={() => setIsOpen(true)}>
            Pay Bill
          </Button>
        </div>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="bg-white sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-medium">Table 01</SheetTitle>
            <span className="text-base text-gray-500">Watson Joyce</span>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            {/* Order Items */}
            <div className="space-y-4 mb-16">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 bg-[#E7E7E7] rounded-xl px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-gray-900 text-white text-xs flex items-center justify-center rounded-full">{String(index + 1).padStart(2, "0")}</div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#E7E7E7] p-4 rounded-lg">
              {/* Calculations */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax 5%</span>
                  <span>₦5.5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tip</span>
                  <span>₦20</span>
                </div>
                <div className="pt-5 pb-1">
                  <Separator className="border border-dashed border-[#5E5E5E]" />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total</span>
                  <span>₦17.5</span>
                </div>
              </div>

              <Separator className="border border-dashed border-[#5E5E5E] mt-48" />
              {/* Payment Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Received</span>
                  <span>₦17.5</span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-3">Payment Method</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="flex flex-col gap-2 h-auto py-3 border-primary">
                        <Banknote fill="green" />
                      <span className="text-xs">Cash</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col gap-2 h-auto py-3 border-primary">
                        <CreditCard fill="green" />
                      <span className="text-xs">Debit Card</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col gap-2 h-auto py-3 border-primary">
                        <Wallet2 fill="green" />
                      <span className="text-xs">E-wallet</span>
                    </Button>
                  </div>
                </div>
                <Button variant="default" className="w-full text-white mt-4">Order Completed</Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default OrderCard

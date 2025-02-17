import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InventoryStepper from "./stepper"
import FileUploadSection from "./file-upload"
import InventoryTable from "./request-supply-table"
import SupplyList from "./items-requested"

export function RequestSupplyDialog() {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(1)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Request Supply</Button>
      </DialogTrigger>
      <DialogContent className="bg-[#F8F9FA] sm:max-w-[425px] md:max-w-[95vw] max-h-screen min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Side - Stepper */}
            <div className="md:col-span-4">
              <InventoryStepper />
            </div>

            {/* Right Side - Main Content */}
            <div className="md:col-span-8 bg-white mx-8 p-8 rounded-3xl">
              {step === 1 && (
                <Tabs defaultValue="new" className="w-full">
                  <div className="w-full border-b border-gray-500 mb-6">
                    <TabsList>
                      <TabsTrigger
                        value="new"
                        className="rounded-none py-[10px] px-4 text-xs text-center text-gray-600 hover:text-gray-800 focus:outline-none"
                      >
                        Request New Items
                      </TabsTrigger>
                      <TabsTrigger
                        value="restock"
                        className="rounded-none py-[10px] px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none"
                      >
                        Restock Existing Items
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="new" className="space-y-6">
                    <FileUploadSection />
                    <InventoryTable setStep={setStep} />
                  </TabsContent>

                  <TabsContent value="restock">
                    <div className="flex justify-end">
                      <Button variant="link" className="text-orange-700 my-4">
                        Download Low Stocks
                      </Button>
                    </div>
                    <InventoryTable setStep={setStep} />
                  </TabsContent>
                </Tabs>
              )}
              {step === 2 && <SupplyList />}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

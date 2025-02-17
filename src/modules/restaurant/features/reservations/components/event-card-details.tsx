import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Event {
  image: string
  title: string
  customer: string
  time: string
  pax: number
}

interface Props {
  setIsEventModalOpen: (isOpen: boolean) => void
  setSelectedEvent: (event: Event | null) => void
  selectedEvent: Event
}

function EventCardDetails({ setIsEventModalOpen, setSelectedEvent, selectedEvent }: Props) {
  const navigation = useNavigate()
  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Reservation Details</h3>
            <button
              onClick={() => {
                setIsEventModalOpen(false)
                setSelectedEvent(null)
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            <img
              className="w-full h-48 object-cover rounded-lg mb-4"
              src={selectedEvent.image}
              alt={selectedEvent.title}
            />
            <div className="space-y-2">
              <h3 className="font-medium text-lg">{selectedEvent.title}</h3>
              <p className="text-sm">Booked for {selectedEvent.customer}</p>
              <p className="text-sm text-gray-500">{selectedEvent.time}</p>
              <p className="text-sm text-gray-500">{selectedEvent.pax} Person(s)</p>
              <div className="pt-4">
                <Button onClick={() => navigation("/reservations/123")} className="w-full text-green-800 border ">
                  View Full Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCardDetails

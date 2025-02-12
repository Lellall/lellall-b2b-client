import { Calendar, momentLocalizer } from "react-big-calendar"
import { useState, useEffect } from "react"
import moment from "moment"
import Modal from "@/components/modal/modal"
import ReservationForm from "./components/reservation-form"
import EventCardDetails from "./components/event-card-details"
import StyledCalendar from "./components/mod-calender"

function Reservations() {
  const [modalOpen, setModalOpen] = useState(false)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedDate, setSelectedDate] = useState({ start: "", end: "" })
  const [formValues, setFormValues] = useState({
    tableNumber: "",
    paxNumber: "",
    reservationDate: "",
    reservationTime: "",
    depositFee: "",
    status: "Confirmed",
    title: "Mr",
    fullName: "",
    phoneNumber: "",
    email: "",
    customerId: "#12354564",
    paymentMethod: "Visa **** 1234",
  })
  const localizer = momentLocalizer(moment)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalOpen && event.target.classList.contains("modal-overlay")) {
        setModalOpen(false)
        setSelectedEvent(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [modalOpen])

  const handleDateSelect = (slotInfo) => {
    const startDate = moment(slotInfo.start).format("YYYY-MM-DD HH:mm:ss")
    const endDate = moment(slotInfo.end).format("YYYY-MM-DD HH:mm:ss")
    setSelectedDate({ start: startDate, end: endDate })
    setFormValues({
      ...formValues,
      reservationDate: moment(slotInfo.start).format("YYYY-MM-DD"),
      reservationTime: moment(slotInfo.start).format("HH:mm"),
    })
    setModalOpen(true)
  }

  const events = [
    {
      id: 1,
      title: "Sample Reservation",
      start: new Date(2025, 0, 22),
      end: new Date(2025, 0, 22),
      customer: "John Doe",
      time: "09:00 PM",
      pax: 5,
      image:
        " https://img.freepik.com/free-vector/ai-technology-brain-background-vector-digital-transformation-concept_53876-117812.jpg?t=st=1738063882~exp=1738067482~hmac=5a962f2c3ce5e2962dacd5a10f72a2da786e677c3d722c7aec770484fc3d30f7&w=2000",
    },
    {
      id: 2,
      title: "Sample Reservation 2",
      start: new Date(2025, 0, 21),
      end: new Date(2025, 0, 23),
      customer: "Jane Smith",
      time: "07:30 PM",
      pax: 3,
      image:
        " https://img.freepik.com/free-vector/ai-technology-brain-background-vector-digital-transformation-concept_53876-117812.jpg?t=st=1738063882~exp=1738067482~hmac=5a962f2c3ce5e2962dacd5a10f72a2da786e677c3d722c7aec770484fc3d30f7&w=2000",
    },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues({
      ...formValues,
      [name]: value,
    })
  }

  const EventCard = ({ event }) => {
    return (
      <div
        className="flex items-center transition-colors w-full h-full p-1 cursor-pointer"
        onClick={() => {
          setSelectedEvent(event)
          setIsEventModalOpen(true)
        }}
      >
        <strong className="text-sm font-medium">{event.title}</strong>
      </div>
    )
  }

  return (
    <div>
      {/* <h1>Reservations</h1> */}

      <div>
        <StyledCalendar />

        {/* Custom Modal */}
        {isEventModalOpen && selectedEvent && (
          <EventCardDetails
            selectedEvent={selectedEvent}
            setIsEventModalOpen={setIsEventModalOpen}
            setSelectedEvent={selectedEvent}
          />
        )}
      </div>

      <div className="overflow-y-auto">
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} position={"right"}>
          <ReservationForm
            formValues={formValues}
            handleChange={handleChange}
            setFormValues={setFormValues}
            setModalOpen={setModalOpen}
          />
        </Modal>
      </div>
    </div>
  )
}

export default Reservations

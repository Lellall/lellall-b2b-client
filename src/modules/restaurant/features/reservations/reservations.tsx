import { useState, useEffect } from "react"
import moment from "moment"
import Modal from "@/components/modal/modal"
import ReservationForm from "./components/reservation-form"
import StyledCalendar from "./components/mod-calender"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useForm } from "react-hook-form"

const schema = yup.object().shape({
  tableNumber: yup.string().required("Table number is required"),
  reservationDate: yup.date().required("Reservation date is required"),
  reservationTime: yup.string().required("Reservation time is required"),
  depositFee: yup.number().required("Deposit fee is required"),
  customerTitle: yup.string().required("Title is required"),
  customerFirstName: yup.string().required("First name is required"),
  customerLastName: yup.string().required("Last name is required"),
  customerEmail: yup.string().email("Invalid email").required("Email is required"),
  customerPhone: yup.string().required("Phone number is required"),
  status: yup.string().default("CONFIRMED"),
})

function Reservations() {
  const [modalOpen, setModalOpen] = useState(false)
  // const [selectedEvent, setSelectedEvent] = useState(null)
  // const [selectedDate, setSelectedDate] = useState({ start: "", end: "" })

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalOpen && event.target.classList.contains("modal-overlay")) {
        setModalOpen(false)
        // setSelectedEvent(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [modalOpen])

  const handleDateSelect = (slotInfo: { start: moment.MomentInput }) => {
    // const startDate = moment(slotInfo.start).format("YYYY-MM-DD HH:mm:ss")
    // const endDate = moment(slotInfo.end).format("YYYY-MM-DD HH:mm:ss")

    // setSelectedDate({ start: startDate, end: endDate })
    setValue("reservationDate", moment(slotInfo.start).format("YYYY-MM-DD") as unknown as Date)
    // setValue("reservationTime", moment(slotInfo.start).format("HH:mm"))
    setModalOpen(true)
  }

  return (
    <div>
      {/* <h1>Reservations</h1> */}

      <div>
        <StyledCalendar handleDateSelect={handleDateSelect} />

        {/* Custom Modal */}
        {/* {isEventModalOpen && selectedEvent && (
          <EventCardDetails
            selectedEvent={selectedEvent}
            setIsEventModalOpen={setIsEventModalOpen}
            setSelectedEvent={selectedEvent}
          />
        )} */}
      </div>

      <div className="overflow-y-auto">
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} position={"right"}>
          <ReservationForm
            register={register}
            handleSubmit={handleSubmit}
            setValue={setValue}
            clearErrors={clearErrors}
            errors={errors}
            setModalOpen={setModalOpen}
            watch={watch}
            reset={reset}
          />
        </Modal>
      </div>
    </div>
  )
}

export default Reservations

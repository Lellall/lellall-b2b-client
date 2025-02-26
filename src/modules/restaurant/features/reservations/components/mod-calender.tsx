import { useState } from "react"
import styled from "styled-components"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { StyledButton } from "@/components/button/button-lellall"
import SearchBar from "@/components/search-bar/search-bar"
import { Add } from "iconsax-react"
import { useReservationsQuery } from "@/redux/api/reservations/reservation.api"

const localizer = momentLocalizer(moment)

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 350px;
  text-align: center;
`

const CloseButton = styled.button`
  color: #333;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
`

const CalendarWrapper = styled.div`
  position: relative;
  .rbc-calendar {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    font-size: 11px !important;
    font-weight: 300 !important;
  }
  .rbc-event {
    border-radius: 6px !important;
    padding: 5px 10px !important;
    font-weight: 300 !important;
    border-left: 2px solid orange !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
  }
  .rbc-btn-group {
    font-size: 11px !important;
    font-weight: 300 !important;
    button {
      border: transparent !important;
    }
  }
  .rbc-off-range-bg {
    background: #fff !important;
  }
`

const eventPropGetter = (event: { status: string }) => {
  let backgroundColor = "#7a5af5" // Default color
  switch (event.status) {
    case "CONFIRMED":
      backgroundColor = "#7a5af5"
      break
    case "PENDING":
      backgroundColor = "#ff66a1"
      break
    case "CANCELLED":
      backgroundColor = "#ff9f40"
      break
    default:
      backgroundColor = "#7a5af5"
  }
  return {
    style: {
      backgroundColor,
      borderRadius: "6px",
      padding: "5px 10px",
      fontWeight: "bold",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
  }
}
interface eventProps {
  title: string
  start: Date
  end: Date
  status: string
  type: string
}
export default function StyledCalendar({ handleDateSelect }) {
  const [selectedEvent, setSelectedEvent] = useState<eventProps | null>(null)
  const { data, isLoading } = useReservationsQuery()

  const events =
    data?.map((reservation) => ({
      title: `${reservation.customerFirstName} ${reservation.customerLastName} ${moment(reservation.reservationTime, "HH:mm:ss").format("h:mm a")}`,
      start: new Date(`${reservation.reservationDate}T${reservation.reservationTime}`),
      end: new Date(`${reservation.reservationDate}T${reservation.reservationTime}`),
      status: reservation.status,
      type: reservation.status.toLowerCase(),
    })) || []

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    handleDateSelect(slotInfo)
  }

  return (
    <div>
      <div className="flex mb-5 justify-between">
        <div>
          <SearchBar
            placeholder="Search reservations"
            width="300px"
            height="42px"
            border="1px solid #fff"
            borderRadius="10px"
            backgroundColor="#ffffff"
            shadow={false}
            fontSize="11px"
            color="#444"
            inputPadding="10px"
            placeholderColor="#bbb"
            iconColor="#ccc"
            iconSize={15}
          />
        </div>
        <StyledButton
          style={{ padding: "19px 15px", fontWeight: 300 }}
          background={"#fff"}
          color="#000"
          width="130px"
          variant="outline"
        >
          <Add size="32" color="#000" /> Add Reservations
        </StyledButton>
      </div>
      <CalendarWrapper>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={["month", "week", "day"]}
          defaultView="month"
          style={{ height: 600 }}
          eventPropGetter={eventPropGetter}
          onSelectEvent={(event) => setSelectedEvent(event)}
          onSelectSlot={handleSelectSlot} // Add this line
          selectable={true} // Enable slot selection
        />

        {selectedEvent && (
          <ModalOverlay>
            <ModalContent>
              <h3>{selectedEvent.title}</h3>

              <p>
                <strong>Status:</strong> {selectedEvent.status}
              </p>
              <p>
                <strong>Start:</strong> {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm a")}
              </p>
              <p>
                <strong>End:</strong> {moment(selectedEvent.end).format("MMMM Do YYYY, h:mm a")}
              </p>
              <CloseButton onClick={() => setSelectedEvent(null)}>Close</CloseButton>
            </ModalContent>
          </ModalOverlay>
        )}
      </CalendarWrapper>
    </div>
  )
}

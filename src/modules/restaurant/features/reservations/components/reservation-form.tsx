import { ChangeEvent, useEffect } from "react"
// import PaymentMethodDropdown from "../select"
import { Button } from "@/components/ui/button"
import Input from "@/components/input/input"
import { usePostReservationMutation } from "@/redux/api/reservations/reservation.api"

function ReservationForm({ setModalOpen, reset, watch, errors, register, handleSubmit, setValue, clearErrors }) {
  const [handlePostReservation, { isLoading, isSuccess }] = usePostReservationMutation()
  const onSubmit = (data) => {
    const { reservationDate, ...rest } = data

    const timeZoneOffset = reservationDate.getTimezoneOffset() * 60000

    // Create a new date adjusted for the time zone offset
    const localDate = new Date(reservationDate.getTime() - timeZoneOffset)

    // Format the date as YYYY-MM-DD
    const formattedDate = localDate.toISOString().split("T")[0]

    console.log(reservationDate) // Original date with time zone
    console.log(formattedDate) // Formatted date in local time zone
    const dataToSubmit = { ...rest, reservationDate: formattedDate }
    console.log(dataToSubmit)
    // handlePostReservation(dataToSubmit)
    //   .unwrap()
    //   .then(() => {
    //     setModalOpen(false)
    //     reset()
    //   })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Reservation Details */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Table Number"
          placeholder="Table Number"
          type="text"
          value={watch("tableNumber")}
          register={register}
          {...register("tableNumber", { required: "Table Number is required" })}
          error={errors.tableNumber?.message}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setValue("tableNumber", e.target.value)
            clearErrors("tableNumber")
          }}
        />
        <Input
          label="Reservation Date"
          placeholder="Reservation Date"
          type="date"
          value={watch("reservationDate")}
          error={errors.reservationDate?.message}
          register={register}
          {...register("reservationDate", { required: "Reservation Date is required" })}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setValue("reservationDate", e.target.value)
            clearErrors("reservationDate")
          }}
        />
        <Input
          label="Reservation Time"
          placeholder="Reservation Time"
          type="time"
          value={watch("reservationTime")}
          error={errors.reservationTime?.message}
          register={register}
          {...register("reservationTime", { required: "Reservation Time is required" })}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setValue("reservationTime", e.target.value)
            clearErrors("reservationTime")
          }}
        />
        <Input
          label="Deposit Fee"
          placeholder="Deposit Fee"
          type="text"
          value={watch("depositFee")}
          error={errors.depositFee?.message}
          register={register}
          {...register("depositFee", { required: "Deposit Fee is required" })}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setValue("depositFee", e.target.value)
            clearErrors("depositFee")
          }}
        />
      </div>

      {/* Customer Details */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Customer Details</h2>
        <div className="my-3">
          <Input
            label="Title"
            placeholder="Title"
            type="text"
            value={watch("customerTitle")}
            error={errors.customerTitle?.message}
            register={register}
            {...register("customerTitle", { required: "Title is required" })}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setValue("customerTitle", e.target.value)
              clearErrors("customerTitle")
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="First Name"
            type="text"
            value={watch("customerFirstName")}
            error={errors.customerFirstName?.message}
            register={register}
            {...register("customerFirstName", { required: "First Name is required" })}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setValue("customerFirstName", e.target.value)
              clearErrors("customerFirstName")
            }}
          />
          <Input
            label="Last Name"
            placeholder="Last Name"
            type="text"
            value={watch("customerLastName")}
            error={errors.customerLastName?.message}
            register={register}
            {...register("customerLastName", { required: "Last Name is required" })}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setValue("customerLastName", e.target.value)
              clearErrors("customerLastName")
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Phone Number"
            placeholder="Phone Number"
            type="text"
            value={watch("customerPhone")}
            error={errors.customerPhone?.message}
            register={register}
            {...register("customerPhone", { required: "Phone Number is required" })}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setValue("customerPhone", e.target.value)
              clearErrors("customerPhone")
            }}
          />
          <Input
            label="Email Address"
            placeholder="Email Address"
            type="email"
            value={watch("customerEmail")}
            error={errors.customerEmail?.message}
            register={register}
            {...register("customerEmail", { required: "Email Address is required" })}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setValue("customerEmail", e.target.value)
              clearErrors("customerEmail")
            }}
          />
        </div>
      </div>

      {/* Additional Information */}
      {/* <div className="space-y-1">
      <h2 className="text-2xl font-semibold">Additional Information</h2>
      <PaymentMethodDropdown />
    </div> */}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button onClick={() => setModalOpen(false)} className="text-gray-500">
          Cancel
        </Button>
        <Button type="submit" className="bg-green-900 text-white">
          {isLoading ? "Reserving" : "Save"}
        </Button>
      </div>
    </form>
  )
}

export default ReservationForm

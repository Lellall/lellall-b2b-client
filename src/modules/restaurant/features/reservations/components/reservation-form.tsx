import { User } from "iconsax-react"
import { useState } from "react"
import PaymentMethodDropdown from "../select"
import { Button } from "@/components/ui/button"

function ReservationForm({ formValues, setFormValues, setModalOpen, handleChange }) {
  return (
    <>
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Reservation Details */}
        <div className="grid grid-cols-2 gap-2 ">
          <div className="space-y-2 ">
            <label className="block text-gray-900">Table Number</label>
            <input
              type="text"
              name="tableNumber"
              value={formValues.tableNumber}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-900">Number of Person </label>
            <input
              type="text"
              name="paxNumber"
              value={formValues.paxNumber}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-900">Reservation Date</label>
            <input
              type="date"
              name="reservationDate"
              value={formValues.reservationDate}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-900">Reservation Time</label>
            <input
              type="time"
              name="reservationTime"
              value={formValues.reservationTime}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-900">Deposit Fee</label>
            <input
              type="text"
              name="depositFee"
              value={formValues.depositFee}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-900">Status</label>
            <input
              type="text"
              name="status"
              value={formValues.status}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg text-pink-500"
            />
          </div>
        </div>

        {/* Customer Details */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Customer Details</h2>

          <div className="space-y-2">
            <div className="space-y-1">
              <label className="block text-gray-900">Title</label>
              <input
                type="text"
                name="title"
                value={formValues.title}
                onChange={handleChange}
                className="w-full bg-gray-100 p-3 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-gray-900">First Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formValues.fullName}
                  onChange={handleChange}
                  className="w-full bg-gray-100 p-3 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-gray-900">Surname</label>
                <input
                  type="text"
                  value={formValues.fullName.split(" ")[1] || ""}
                  className="w-full bg-gray-100 p-3 rounded-lg"
                  onChange={(e) => {
                    const fullName = e.target.value.split(" ")
                    setFormValues({
                      ...formValues,
                      fullName: fullName.join(" "),
                    })
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-gray-900">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formValues.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-gray-100 p-3 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-gray-900">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  className="w-full bg-gray-100 p-3 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Additional Information</h2>

          <div className="flex items-center space-x-2  py-3 rounded-lg">
            <p className="bg-green-900 p-2 rounded-full text-white">
              <User size={16} />
            </p>
            <span className="flex-grow">Customer ID</span>
            <p>#12345</p>
          </div>

          {/* <div className="flex items-center space-x-2 bg-white py-2 rounded-lg">
                <p className="bg-green-900 p-2 rounded-full text-white">
                  <User size={16} />
                </p>

                <span className="flex-grow">Payment Method</span>
              </div> */}
          <PaymentMethodDropdown />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button onClick={() => setModalOpen(false)} className="text-gray-500 ">
            Cancel
          </Button>
          <Button onClick={() => setModalOpen(false)} className="bg-green-900 text-white">
            Save
          </Button>
        </div>
      </div>
    </>
  )
}

export default ReservationForm

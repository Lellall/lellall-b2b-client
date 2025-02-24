import { Camera, User } from "iconsax-react"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"

function StaffForm({ formValues, setFormValues, setModalOpen, handleChange }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  return (
    <>
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className=" w-fit rounded-md">
          <div onClick={handleImageClick} className="relative w-fit cursor-pointer group">
            <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
              {selectedImage ? (
                <img src={selectedImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-sm">Select icon here</span>
                </div>
              )}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

          <button
            onClick={handleImageClick}
            className="mt-1 text-[#05431E] p-0 m-0 hover:text-green-800 font-medium transition-colors duration-200"
          >
            Change Profile Picture
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 ">
          <div className="space-y-2 ">
            <label className="block text-[#05431E]">Full name</label>
            <input
              type="text"
              name="fullname"
              value={formValues.tableNumber}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[#05431E]">Email</label>
            <input
              type="text"
              name="email"
              value={formValues.paxNumber}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[#05431E]">Role</label>
            <input
              type="text"
              name="role"
              value={formValues.reservationDate}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[#05431E]">Phone number</label>
            <input
              type="tel"
              name="reservationTime"
              value={formValues.reservationTime}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[#05431E]">Salary</label>
            <input
              type="text"
              name="salary"
              value={formValues.depositFee}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[#05431E]">Date of Birth</label>
            <input
              type="date"
              name="status"
              value={formValues.status}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 ">
          <div className="space-y-1">
            <label className="block text-[#05431E]">Shifiting Start timing</label>
            <input
              type="time"
              name="title"
              value={formValues.title}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[#05431E]">Shifiting end timing</label>
            <input
              type="time"
              name="fullName"
              value={formValues.fullName}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="block text-[#05431E]">Address</label>
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

        <div className="grid grid-cols-1 gap-2">
          <div className="space-y-1">
            <label className="block text-[#05431E]">Additional Details</label>
            <textarea
              name="details"
              value={formValues.phoneNumber}
              onChange={handleChange}
              className="w-full bg-gray-100 p-3 rounded-lg"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={() => setModalOpen(false)} className="bg-green-900 text-white">
            Save
          </Button>
        </div>
      </div>
    </>
  )
}

export default StaffForm

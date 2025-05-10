import { Camera } from "iconsax-react"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"

function StaffForm({ formValues, setFormValues, setModalOpen, handleChange, onSubmit }) {
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

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  // Available roles excluding SUPER_ADMIN
  const availableRoles = [
    "ADMIN",
    "MANAGER",
    // "STAFF",
    // "RIDER",
    // "MARKET_AGENT",
    // "OPERATIONS",
    // "LOGISTICS",
    "CHEF",
    "WAITER",
    "BARTENDER",
    "HOST",
    "KITCHEN_STAFF"
  ]

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-2 space-y-8">
      {/* <div className="w-fit rounded-md">
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
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        <button
          type="button"
          onClick={handleImageClick}
          className="mt-1 text-[#05431E] p-0 m-0 hover:text-green-800 font-medium transition-colors duration-200"
        >
          Change Profile Picture
        </button>
      </div> */}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="block text-[#05431E]">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formValues.firstName}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[#05431E]">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formValues.lastName}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[#05431E]">Email</label>
          <input
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[#05431E]">Password</label>
          <input
            type="password"
            name="password"
            value={formValues.password}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[#05431E]">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formValues.phoneNumber}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[#05431E]">Role</label>
          <select
            name="role"
            value={formValues.role}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="space-y-2">
          <label className="block text-[#05431E]">Address</label>
          <input
            type="text"
            name="address"
            value={formValues.address}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          />
        </div>
      </div>

      <input
        type="hidden"
        name="restaurantId"
        value={formValues.restaurantId}
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" onClick={() => setModalOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-900 text-white">
          Save
        </Button>
      </div>
    </form>
  )
}

export default StaffForm
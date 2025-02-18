import { Button } from "@/components/ui/button"
import LellallSwitch from "@/components/ui/switch.component"
import { Camera } from "iconsax-react"
import { useRef, useState } from "react"
import { IoIosCheckmark } from "react-icons/io"

function StaffProfile() {
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
    <div className="flex gap-2 ">
      <div className="w-[30%] ">
        <h2 className="text-xl font-[500] text-[#05431E]">Profiel Image</h2>
        <div className="w-full  rounded-md">
          <div onClick={handleImageClick} className="relative w-full cursor-pointer group">
            <div className="w-full h-44 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
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
            className="mt-4 text-[#05431E] p-0 m-0 hover:text-green-800 font-medium transition-colors duration-200"
          >
            Change Profile Picture
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <Button>Edit Profile</Button>
          <Button variant={"outline"}>Delete Profile</Button>
        </div>
      </div>
      <div className="w-[70%]">
        <div className="">
          <h2 className="text-xl font-[500] text-[#05431E]">Employee Personal Details</h2>
          <div className="bg-white grid grid-cols-2 py-2 px-4 rounded-md">
            <LabelData label={"Full Name"} value={"Watson Joyce"} />
            <LabelData label={"Email"} value={"WatsonJoyce@gmail.com"} />
            <LabelData label={"Phone Number"} value={"+1 (123) 1234 4654"} />
            <LabelData label={"Date of birth"} value={"01-Jan-1983"} />
            <LabelData label={"Address"} value={"House Number 23 Street Abuja Nigeria"} />
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-[500] text-[#05431E]">Employee Job Details</h2>
          <div className="bg-white grid grid-cols-2 py-2 px-4 rounded-md">
            <LabelData label={"Role"} value={"Manager"} />
            <LabelData label={"Salary"} value={"N2000"} />
            <LabelData label={"Shifting Start timing"} value={"9am"} />
            <LabelData label={"Shifting end timing"} value={"6pm"} />
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-[500] text-[#05431E]">System Roles and Permission</h2>
          <div className="bg-white flex flex-wrap gap-3  py-4 px-4 rounded-md">
            <div className="flex items-start  gap-3 ">
              <LellallSwitch labelLeft="" labelRight="Inventory" checked={true} onChange={() => {}} />
              <div>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Edit
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Add
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Delete
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  View
                </label>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <LellallSwitch labelLeft="" labelRight="Staff" checked={true} onChange={() => {}} />
              <div>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Edit
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Add
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Delete
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  View
                </label>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <LellallSwitch labelLeft="" labelRight="Menus" checked={true} onChange={() => {}} />
              <div>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Edit
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Add
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Delete
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  View
                </label>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <LellallSwitch labelLeft="" labelRight="Supplier" checked={true} onChange={() => {}} />
              <div>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Edit
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Add
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  Delete
                </label>
                <label className="flex gap-1 items-center mb-2">
                  <Checkbox checked={true} onClick={() => {}} />
                  View
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffProfile

const LabelData = ({ label, value }) => {
  return (
    <p className="flex flex-col my-3">
      <p className="text-[#05431E] text-[16px] font-[300]">{label}</p>
      <p className="text-[#05431E] text-[16px] font-[300]">{value}</p>
    </p>
  )
}

type CheckboxProps = {
  checked: boolean
  onClick?: () => void
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onClick }) => (
  <div
    className={`w-5 h-5 flex items-center justify-center border rounded cursor-pointer ${
      checked ? "bg-green-600 border-green-600" : "border-gray-400"
    }`}
    onClick={onClick}
  >
    {checked && <IoIosCheckmark className="text-white" />}
  </div>
)

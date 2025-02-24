import Modal from "@/components/modal/modal"
import SearchBar from "@/components/search-bar/search-bar"
import { TabButton, TabContainer, TabPanel } from "@/components/tab"
import { Button } from "@/components/ui/button"
import { Eye, Trash } from "iconsax-react"
import { Pencil } from "lucide-react"
import { useState } from "react"
import StaffForm from "./components/staff-form"
import { useNavigate } from "react-router-dom"

// Sample data for staff management
const staffData = [
  {
    id: 123,
    name: "John Doe",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    position: "Manager",
    email: "john.doe@company.com",
    phone: "+1 234-567-8901",
    age: 35,
    salary: "$85,000",
    timing: "9:00 AM - 5:00 PM",
  },
  {
    id: 124,
    name: "Sarah Miller",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    position: "Team Lead",
    email: "sarah.m@company.com",
    phone: "+1 234-567-8902",
    age: 32,
    salary: "$75,000",
    timing: "9:00 AM - 5:00 PM",
  },
  {
    id: 125,
    name: "James Wilson",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    position: "Developer",
    email: "james.w@company.com",
    phone: "+1 234-567-8903",
    age: 28,
    salary: "$65,000",
    timing: "10:00 AM - 6:00 PM",
  },
  {
    id: 126,
    name: "Emma Thompson",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    position: "Designer",
    email: "emma.t@company.com",
    phone: "+1 234-567-8904",
    age: 30,
    salary: "$70,000",
    timing: "9:30 AM - 5:30 PM",
  },
  {
    id: 127,
    name: "Michael Brown",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    position: "Developer",
    email: "michael.b@company.com",
    phone: "+1 234-567-8905",
    age: 27,
    salary: "$68,000",
    timing: "9:00 AM - 5:00 PM",
  },
]

const sampleAttendanceData = [
  {
    recordId: 101,
    imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    name: "Watson Joyce",
    position: "Manager",
    date: "16-apr-2025",
    time: "09:00",
  },
  {
    recordId: 102,
    imageUrl: "https://randomuser.me/api/portraits/women/2.jpg",
    name: "Sarah Miller",
    position: "Team Lead",
    date: "16-apr-2025",
    time: "09:15",
  },
  {
    recordId: 103,
    imageUrl: "https://randomuser.me/api/portraits/men/3.jpg",
    name: "James Wilson",
    position: "Developer",
    date: "16-apr-2025",
    time: "08:45",
  },
  {
    recordId: 104,
    imageUrl: "https://randomuser.me/api/portraits/women/4.jpg",
    name: "Emma Thompson",
    position: "Designer",
    date: "16-apr-2025",
    time: "09:30",
  },
  {
    recordId: 105,
    imageUrl: "https://randomuser.me/api/portraits/men/5.jpg",
    name: "Michael Brown",
    position: "Developer",
    date: "16-apr-2025",
    time: "09:05",
  },
  {
    recordId: 106,
    imageUrl: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Lisa Anderson",
    position: "QA Engineer",
    date: "16-apr-2025",
    time: "08:55",
  },
  {
    recordId: 107,
    imageUrl: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "David Garcia",
    position: "DevOps",
    date: "16-apr-2025",
    time: "09:20",
  },
  {
    recordId: 108,
    imageUrl: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Jennifer Lee",
    position: "Product Manager",
    date: "16-apr-2025",
    time: "09:10",
  },
  {
    recordId: 109,
    imageUrl: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Robert Martinez",
    position: "Developer",
    date: "16-apr-2025",
    time: "08:50",
  },
  {
    recordId: 110,
    imageUrl: "https://randomuser.me/api/portraits/women/10.jpg",
    name: "Patricia White",
    position: "UX Designer",
    date: "16-apr-2025",
    time: "09:25",
  },
]

interface AttendanceRecordProps {
  recordId: string | number
  imageUrl: string
  name: string
  position: string
  date: string
  time: string
  onStatusChange?: (status: "present" | "absent" | "half" | "leave") => void
  className?: string
}

function Staff() {
  const [activeTab, setActiveTab] = useState("staff")
  const navigation = useNavigate()
  const handleTabSwitch = (val: string) => {
    setActiveTab(val)
  }
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
  const [modalOpen, setModalOpen] = useState(false)
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues({
      ...formValues,
      [name]: value,
    })
  }

  return (
    <div className="p-6">
      <div>
        <div className="flex justify-between">
          {activeTab === "staff" ? <p>Staff ({staffData.length})</p> : <SearchBar />}
          <div className="flex gap-3">
            <Button variant={"ghost"}>Sort By</Button>
            <Button onClick={() => setModalOpen(true)}>Add Staff</Button>
          </div>
        </div>
        <TabContainer className="!w-[300px] my-5">
          <TabButton onClick={() => handleTabSwitch("staff")} active={activeTab === "staff"}>
            Staff Management
          </TabButton>
          <TabButton onClick={() => handleTabSwitch("attendance")} active={activeTab === "attendance"}>
            Attendance
          </TabButton>
        </TabContainer>
      </div>

      <main>
        <TabPanel active={activeTab === "staff"}>
          <div className="overflow-x-auto">
            <table className="min-w-full  rounded-lg">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#05431E]  tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#05431E]  tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#05431E]  tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#05431E]  tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#05431E]  tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#05431E]  tracking-wider">Timing</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#05431E]  tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className=" ">
                {staffData.map((staff) => (
                  <tr key={staff.id} className="even:bg-[#5e676a03] odd:bg-[white]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 items-center">
                        <div>#{staff.id}</div>
                        <div className="flex gap-2">
                          <img
                            className="w-[40px] h-[40px] rounded-full border border-[#565656]"
                            src={staff.image}
                            alt={`${staff.name}'s profile`}
                          />
                          <div>
                            <p className="text-[#00190B] text-[14px]">{staff.name}</p>
                            <p className="text-[#565656] text-[12px] font-[400]">{staff.position}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#05431E]">{staff.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#05431E]">{staff.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#05431E]">{staff.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#05431E]">{staff.salary}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#05431E]">{staff.timing}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button>
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            navigation(`/staffs/${staff.id}`)
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button>
                          <Trash size={16} className="text-[red]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabPanel>
        <TabPanel active={activeTab === "attendance"}>
          {sampleAttendanceData.map((item) => (
            <AttendanceRecord key={item.recordId} {...item} />
          ))}
        </TabPanel>
      </main>
      <div className="overflow-y-auto">
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} position={"right"}>
          <StaffForm
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

const AttendanceRecord = ({
  recordId,
  imageUrl,
  name,
  position,
  date,
  time,
  onStatusChange,
  className = "",
}: AttendanceRecordProps) => {
  const handleStatusClick = (status: "present" | "absent" | "half" | "leave") => {
    onStatusChange?.(status)
  }

  return (
    <div className={`flex justify-between items-center gap-2 my-3 ${className}`}>
      <div className="flex gap-2 items-center">
        <div>#{recordId}</div>
        <div className="flex gap-2">
          <img
            className="w-[40px] h-[40px] rounded-full border border-[#565656]"
            src={imageUrl}
            alt={`${name}'s profile`}
          />
          <div>
            <p className="text-[#00190B] text-[14px]">{name}</p>
            <p className="text-[#565656] text-[12px] font-[400]">{position}</p>
          </div>
        </div>
      </div>
      <div>{date}</div>
      <div>{time}</div>
      <div className="flex gap-2">
        <Button className="bg-[#FAC1D9] text-[#000]" onClick={() => handleStatusClick("present")} size="sm">
          Present
        </Button>
        <Button className="bg-[#FFDF6B] text-[#000]" onClick={() => handleStatusClick("absent")} size="sm">
          Absent
        </Button>
        <Button className="bg-[#6BE4FF] text-[#000]" onClick={() => handleStatusClick("half")} size="sm">
          Half shift
        </Button>
        <Button className="bg-[#FF6A6A] text-[#000]" onClick={() => handleStatusClick("leave")} size="sm">
          Leave
        </Button>
      </div>
    </div>
  )
}

export default Staff

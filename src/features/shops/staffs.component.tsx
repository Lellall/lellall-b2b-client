import { StyledButton } from "@/components/button/button-lellall"
import StatusDropdown from "@/components/ui/drop-down-btn";
import NavigationTabs, { Tab } from "@/components/ui/navigation-tab";
import Table from "@/components/ui/table";
import { theme } from "@/theme/theme"
import { Add, More } from "iconsax-react"

const Staffs = () => {
  const statuses = ["Active", "On Leave", "In Active"];
  const StatusTag = ({ status }: { status: string }) => {
    const statusColors: Record<string, string> = {
      "Active": "text-xs bg-green-100 text-green-700",
      "Inactive": "text-xs bg-red-100 text-red-700",
      "On Leave": "text-xs bg-blue-100 text-blue-700",
    }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
        {status}
      </span>
    );
  };
  const handleStatusChange = (status: string) => {
    console.log("Selected Status:", status);
  };
  const tabs: Tab[] = [
    { name: "Staffs Management", active: true },
    { name: "Attendace", active: false },
  ];
  const columns = [
    { key: "staffId", label: "Staff ID" },
    { key: "name", label: "Name" },
    { key: "phoneNumber", label: "Phone Number" },
    { key: "age", label: "Age" },
    { key: "role", label: "Role" },
    { key: "shift", label: "Shift" },
    { key: "status", label: "Status", render: (row: any) => <StatusTag status={row.status} /> },
    { key: "salary", label: "Salary" },
  ];

  const data = [
    { staffId: "#STF1001", name: "John Doe", phoneNumber: "+1 (123) 456 7890", age: 29, role: "Software Engineer", shift: "Morning", status: "Active", salary: "₦300,000" },
    { staffId: "#STF1002", name: "Jane Smith", phoneNumber: "+1 (987) 654 3210", age: 35, role: "HR Manager", shift: "Day", status: "Inactive", salary: "₦400,000" },
    { staffId: "#STF1003", name: "Michael Johnson", phoneNumber: "+1 (555) 123 4567", age: 41, role: "Product Manager", shift: "Evening", status: "Active", salary: "₦500,000" },
    { staffId: "#STF1004", name: "Emily Williams", phoneNumber: "+1 (777) 987 6543", age: 27, role: "Marketing Lead", shift: "Night", status: "On Leave", salary: "₦350,000" },
  ];

  return (
    <div>
      <div className='flex w-full justify-between'>
        <div className="text-2xl ml-1 font-bold text-green-900" >
          Staffs
        </div>
        <div className="flex">
          <div className="mr-2">
            <StatusDropdown options={statuses} onSelect={handleStatusChange} initialStatus="Active" />
          </div>
          <StyledButton onClick={() => { }} style={{ padding: '21px 15px', fontWeight: 300 }} background={theme.colors.active} color={theme.colors.secondary} width='150px' variant="outline">
            <Add size="32" color="#fff" /> Add Staff
          </StyledButton>
        </div>
      </div>
      <div className="mt-5">
        <NavigationTabs tabs={tabs} width="270px" />
      </div>
      <div className="mt-5">
        <Table columns={columns} data={data}
          selectable
          actions={(row) => (
            <div className="flex items-center gap-2">
              <button
                className="text-blue-500 ml-2"
              // onClick={() => handleViewInvoice(row.invoiceId)}
              >
                <More size="18" color={theme.colors.active} />
              </button>
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default Staffs
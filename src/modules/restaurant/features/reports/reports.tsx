import { StyledButton } from "@/components/button/button-lellall";
import DateRangePicker from "@/components/ui/date-range";
import NavigationTabs, { Tab } from "@/components/ui/navigation-tab";
import { theme } from "@/theme/theme";
import { useState } from "react";
import PieChart from "./components/pie-chart.component";
import LineChart from "./components/xy-chart.component";
import Table from "@/components/ui/table";
import InfoCard from "../shops/components/info-card";
import users from '@/assets/users.svg';
import confirmed from '@/assets/confirmed.svg';
import failed from '@/assets/failed.svg';


const Reports = () => {
    const tabs: Tab[] = [
        { name: "Reservations Reports", active: true },
        { name: "Revenue Reports", active: false },
        { name: "Staffs Reports", active: false },
    ];
    const [selectedRange, setSelectedRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
    });

    const columns = [
        { key: "reservationId", label: "Reservation ID" },
        { key: "customerName", label: "Customer Name" },
        { key: "phoneNumber", label: "Phone Number" },
        { key: "reservationDate", label: "Reservation Date" },
        { key: "checkIn", label: "Check In" },
        { key: "checkOut", label: "Check Out" },
        { key: "total", label: "Total" },
    ];

    const data = [
        { reservationId: "#12354564", customerName: "Watson Joyce", phoneNumber: "+1 (123) 123 4654", reservationDate: "28.03.2024", checkIn: "03:18 PM", checkOut: "05:00 PM", total: "₦250.00" },
        { reservationId: "#335545d64", customerName: "Karen Boyd", phoneNumber: "+1 (123) 123 4654", reservationDate: "28.03.2024", checkIn: "03:18 PM", checkOut: "05:00 PM", total: "₦250.00" },
        { reservationId: "#445545d64", customerName: "Zayyad Baba", phoneNumber: "+1 (123) 123 4654", reservationDate: "28.03.2024", checkIn: "03:18 PM", checkOut: "05:00 PM", total: "₦250.00" },
        { reservationId: "#785545d64", customerName: "Dr Umar Isa", phoneNumber: "+1 (123) 123 4654", reservationDate: "28.03.2024", checkIn: "03:18 PM", checkOut: "05:00 PM", total: "₦250.00" },
    ];

    const handleDateChange = (range: { startDate: Date; endDate: Date }) => {
        setSelectedRange(range);
        console.log("Selected Date Range:", range);
    };
    return (
        <div>
            <div className="mt-10 flex justify-between">
                <div className="flex ">
                    <div>
                        <NavigationTabs tabs={tabs} width="470px" />
                    </div>
                </div>
                <div className="flex">
                    <div className="mr-5">
                        <DateRangePicker onChange={handleDateChange} initialRange={selectedRange} />
                    </div>
                    <StyledButton
                        background={theme.colors.active}
                        color={theme.colors.secondary}
                        width='150px'
                        variant="outline"
                        type="submit"
                    >
                        Generate Reports
                    </StyledButton>
                </div>
            </div>
            <div className="mx-auto bg-white flex justify-between items-center p-6 rounded-xl mt-10 ">
                <div className="mx-5 pr-10 border-r h-[80px] flex items-center justify-center">
                    <div>
                        <InfoCard title="Total Customers" value="1,200" icon={<img src={users} alt="Packages Supplied" />} />
                    </div>
                </div>
                <div className="pr-10 border-r h-[80px] flex items-center justify-center">
                    <div>
                        <InfoCard title="Confirmed Checked In" value="1,990" icon={<img src={confirmed} alt="Packages Supplied" />} />
                    </div>
                </div>
                <div className="mx-5 h-[80px] flex items-center justify-center">
                    <div>
                        <InfoCard title="Missed or Cancelled" value="10" icon={<img src={failed} alt="Packages Supplied" />} />
                    </div>
                </div>
            </div>
            <div className="flex justify-between mt-10 w-full">
                <div className="bg-white rounded-xl p-4 w-[45%] mr-2">
                    <div className="mt-5">
                        <div className="text-xl ml-1 font-light text-green-900" >
                            Total Reservations
                        </div>
                        <PieChart />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 w-[50%]">
                    <div className="">
                        <LineChart />
                    </div>
                </div>
            </div>
            <div className="mt-10">
                <Table columns={columns} data={data} />
            </div>
        </div>
    )
}

export default Reports
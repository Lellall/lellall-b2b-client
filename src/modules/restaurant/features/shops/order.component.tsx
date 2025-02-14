import { useState } from "react";
import NavigationTabs, { Tab } from "@/components/ui/navigation-tab";
import DateRangePicker from "@/components/ui/date-range";
import StatusDropdown from "@/components/ui/drop-down-btn";
import { StyledButton } from "@/components/button/button-lellall";
import { theme } from "@/theme/theme";
import Table from "@/components/ui/table";

const Order = () => {
    const statuses = ["Active", "Pending", "Completed", "Cancelled"];
    const handleStatusChange = (status: string) => {
        console.log("Selected Status:", status);
    };
    const [selectedRange, setSelectedRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
    });

    const handleDateChange = (range: { startDate: Date; endDate: Date }) => {
        setSelectedRange(range);
        console.log("Selected Date Range:", range);
    };

    const tabs: Tab[] = [
        { name: "Reservations", active: true },
        { name: "Dine In", active: false },
        { name: "Take-outs", active: false },
        { name: "Delivery", active: false },
    ];
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

    return (
        <div className="">
            <div className="">
                <div>
                    <div className="flex justify-between">
                        <div className="w-full flex">
                            <NavigationTabs tabs={tabs} />
                            <div className="flex ml-5 ">
                                <DateRangePicker onChange={handleDateChange} initialRange={selectedRange} />
                                <div className="ml-5">
                                    <StatusDropdown options={statuses} onSelect={handleStatusChange} initialStatus="Pending" />
                                </div>
                            </div>
                        </div>
                        <div>
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
                    <div className="mt-5">
                        <Table columns={columns} data={data} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Order;
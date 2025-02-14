import { StyledButton } from '@/components/button/button-lellall'
import SearchBar from '@/components/search-bar/search-bar'
import StatusDropdown from '@/components/ui/drop-down-btn'
import Table from '@/components/ui/table'
import { theme } from '@/theme/theme'
import { Add, Eye, Filter, More } from 'iconsax-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Operation = () => {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const navigation = useNavigate()
    // const statuses = ["Active", "Pending", "Completed", "Cancelled"];

    // const handleStatusChange = (status: string) => {
    //     console.log("Selected Status:", status);
    //     setOpenDropdown(null); // Close the dropdown after selecting
    // };

    // const toggleDropdown = (index: number) => {
    //     setOpenDropdown((prev) => (prev === index ? null : index));
    // };

    const columns = [
        { key: "title", label: "Title", sortable: true },
        { key: "date", label: "Date", sortable: true },
        { key: "amount", label: "Amount", sortable: true },
        { key: "status", label: "Status", sortable: true },
    ];

    const data = [
        { title: "Supply request from Green Fork", date: "10/01/2025", amount: "₦199,000", status: "Cancelled" },
        { title: "Supply request from Green Fork", date: "15/01/2025", amount: "₦195,000", status: "Pending" },
        { title: "Supply request from Green Fork", date: "20/01/2025", amount: "₦109,000", status: "Processing" },
        { title: "Supply request from Green Fork", date: "25/01/2025", amount: "₦129,000", status: "Processing" },
        { title: "Supply request from Green Fork", date: "30/01/2025", amount: "₦199,000", status: "Processing" },
        { title: "Supply request from Tina’s Dine", date: "20/01/2025", amount: "₦199,000", status: "Processing" },
        { title: "Supply request from Tina’s Dine", date: "20/01/2025", amount: "₦199,000", status: "Processing" },
        { title: "Supply request from Blue Spoon", date: "20/01/2025", amount: "₦199,000", status: "Delivered" },
        { title: "Supply request from Thyne Spot", date: "20/01/2025", amount: "₦199,000", status: "Delivered" },
        { title: "Supply request from Cool Spot", date: "20/01/2025", amount: "₦199,000", status: "Delivered" },
    ];

    return (
        <div>
            <div className="flex mb-5 justify-between">
                <div className="flex">
                    <SearchBar
                        placeholder="Search orders"
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
                    <div className="ml-4">
                        <StyledButton style={{ padding: '19px 15px', fontWeight: 300 }} background="#fff" color="#000" width='130px' variant="outline">
                            <Filter size="32" color="#000" /> Filter
                        </StyledButton>
                    </div>
                </div>
                <StyledButton style={{ padding: '19px 15px', fontWeight: 300 }} background={theme.colors.active} color="#fff" width='130px' variant="outline">
                    <Add size="32" color="#fff" /> Create Order
                </StyledButton>
            </div>

            <div className="mt-10">
                <Table
                    selectable
                    bordered
                    columns={columns}
                    data={data}
                    actions={(row, index) => (
                        <div className="relative flex items-center gap-2">
                            {/* More button to toggle dropdown */}
                            <button
                                className="text-blue-500 ml-2"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents event bubbling
                                    setOpenDropdown(openDropdown === index ? null : index);
                                }}
                            >
                                <More size="18" color={theme.colors.active} />
                            </button>

                            {/* Dropdown appears only for the clicked row */}
                            {openDropdown === index && (
                                <div
                                    className="absolute top-5 right-2 bg-white shadow-md rounded-md p-2 z-10 w-24"
                                >
                                    <button
                                        className="flex block w-full text-left px-4 py-2 hover:bg-gray-100"
                                        onClick={() => navigation(`/operations/${index}`)}
                                    >
                                        <div className="mt-1 mr-1"><Eye size="15" color={theme.colors.active} /></div> view 
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                />


            </div>
        </div>
    );
};

export default Operation;

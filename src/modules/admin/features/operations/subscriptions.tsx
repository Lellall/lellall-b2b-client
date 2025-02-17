import { StyledButton } from "@/components/button/button-lellall";
import SearchBar from "@/components/search-bar/search-bar";
import Table from "@/components/ui/table";
import { theme } from "@/theme/theme";
import { Add, Eye, Filter, More } from "iconsax-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PackageCard from "./components/package-card";
import PackageSheet from "./components/package-modal";

const Subscriptions = () => {
    const [activeTab, setActiveTab] = useState('tab-1');
    const openTab = (tab: string) => setActiveTab(tab);
    const [isSheetOpen, setSheetOpen] = useState(false);

    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const navigation = useNavigate();

    const columns = [
        { key: "customer", label: "Customer", sortable: true },
        { key: "date", label: "Date", sortable: true },
        { key: "renew", label: "Auto Renew", sortable: true },
        { key: "package", label: "Package", sortable: true },
    ];

    const packageColors: { [key: string]: string } = {
        Basic: "text-xs bg-blue-500 text-white rounded-xl",
        Premium: "text-xs bg-yellow-500 text-white rounded-xl",
        Standard: "text-xs bg-green-500 text-white rounded-xl",
    };

    const data = [
        { customer: "The Green Fork", start: "10/01/2025", end: "10/01/2026", renew: true, package: "Basic" },
        { customer: "Tina’s Dine", start: "20/01/2025", end: "20/01/2026", renew: false, package: "Premium" },
        { customer: "Blue Spoon", start: "20/01/2025", end: "20/01/2026", renew: false, package: "Standard" },
        { customer: "Thyne Spot", start: "20/01/2025", end: "20/01/2026", renew: true, package: "Standard" },
        { customer: "Cool Spot", start: "20/01/2025", end: "20/01/2026", renew: false, package: "Standard" },
    ].map(row => ({
        ...row,
        date: (
            <div className="flex justify-evenly">
                <span className="text-xs  text-green-700 px-2 py-1 rounded-xl">Starts: {row.start}</span>
                <span className="text-xs  text-red-700 px-2 py-1 rounded-xl ml-1">Ends: {row.end}</span>
            </div>
        ),
        renew: row.renew
            ? <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-xl">Turned On</span>
            : <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-xl">Turned Off</span>,
        package: (
            <span className={`px-2 py-1 rounded-md ${packageColors[row.package] || "bg-gray-100 text-gray-700"}`}>
                {row.package}
            </span>
        ),
    }));

    return (
        <div>
            <div className="flex mb-4 border-b border-gray-200">
                <button
                    className={`py-2 px-4 text-xs text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-1' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-1')}
                >
                    Subscribers
                </button>
                <button
                    className={`py-2 px-4 text-xs text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-2' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-2')}
                >
                    Package Configurations
                </button>
            </div>

            <div className="pt-4">
                {activeTab === 'tab-1' && (
                    <div>
                        <div className="flex mb-5 justify-between">
                            <div className="flex">
                                <SearchBar
                                    placeholder="Search subscribers"
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
                                <Add size="32" color="#fff" /> Add Subscriber
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
                                        <button
                                            className="text-blue-500 ml-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdown(openDropdown === index ? null : index);
                                            }}
                                        >
                                            <More size="18" color={theme.colors.active} />
                                        </button>

                                        {openDropdown === index && (
                                            <div className="absolute top-5 right-2 bg-white shadow-md rounded-md p-2 z-10 w-24">
                                                <button
                                                    className="flex block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => navigation(`/operations/${index}`)}
                                                >
                                                    <div className="mt-1 mr-1">
                                                        <Eye size="15" color={theme.colors.active} />
                                                    </div>
                                                    View
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                )}
                {activeTab === 'tab-2' && (
                    <div>
                        <div className="flex mb-5 justify-between">
                            <div className="flex">
                                <SearchBar
                                    placeholder="Search package"
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
                            <StyledButton onClick={() => setSheetOpen(true)} style={{ padding: '19px 15px', fontWeight: 300 }} background={theme.colors.active} color="#fff" width='150px' variant="outline">
                                <Add size="32" color="#fff" /> Configure Package
                            </StyledButton>
                        </div>
                        <div className="my-1">
                            <PackageCard
                                name="Starter Package"
                                minPrice={10000}
                                maxPrice={110000}
                                participants={22}
                                progress={14}
                                isActive={true}
                                onToggle={() => console.log("Toggled!")}
                                background="bg-white"
                                packageColor="bg-purple-600"
                            />
                        </div>
                        <div className="my-1">
                            <PackageCard
                                name="Basic Package"
                                minPrice={18000}
                                maxPrice={198000}
                                participants={90}
                                progress={79}
                                isActive={true}
                                onToggle={() => console.log("Toggled!")}
                                background="#9197B3"
                                packageColor="bg-teal-200"
                            />
                        </div>
                        <div className="my-1">
                            <PackageCard
                                name="Starter Package"
                                minPrice={25000}
                                maxPrice={275000}
                                participants={97}
                                progress={86}
                                isActive={true}
                                onToggle={() => console.log("Toggled!")}
                                background="bg-white"
                                packageColor="bg-blue-900"
                            />
                        </div>
                        <div className="my-1">
                            <PackageCard
                                name="Premium Package"
                                minPrice={35000}
                                maxPrice={385000}
                                participants={66}
                                progress={56}
                                isActive={true}
                                onToggle={() => console.log("Toggled!")}
                                background="#9197B3"
                                packageColor="bg-orange-400"
                            />
                        </div>
                    </div>
                )}
            </div>
            <PackageSheet open={isSheetOpen} onClose={() => setSheetOpen(false)} />
        </div>
    );
};

export default Subscriptions;

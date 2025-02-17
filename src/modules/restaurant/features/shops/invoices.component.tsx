import InfoCard from "./components/info-card";
import packageIcon from '@/assets/package.svg';
import totalIcon from '@/assets/total.svg';
import pendingIcon from '@/assets/pending.svg';
import financeIcon from '@/assets/finance.svg';
import Table from "@/components/ui/table";
import { Eye } from "iconsax-react";
import { theme } from "@/theme/theme";

const StatusTag = ({ status }: { status: string }) => {
    const statusColors: Record<string, string> = {
        "Paid": "text-xs bg-green-100 text-green-700",
        "Pending": "text-xs bg-yellow-100 text-yellow-700",
        "Overdue": "text-xs bg-red-100 text-red-700",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
            {status}
        </span>
    );
};

const Invoices = () => {
    const columns = [
        { key: "invoiceId", label: "Invoice ID" },
        { key: "phoneNumber", label: "Phone Number" },
        { key: "invoiceDate", label: "Invoice Date" },
        { key: "dueDate", label: "Due Date" },
        { key: "status", label: "Status", render: (row: any) => <StatusTag status={row.status} /> },
        { key: "totalAmount", label: "Total Amount" },
    ];

    const data = [
        { invoiceId: "#INV12345", phoneNumber: "+1 (123) 123 4654", invoiceDate: "28.03.2024", dueDate: "05.04.2024", status: "Paid", totalAmount: "₦250.00" },
        { invoiceId: "#INV33554", phoneNumber: "+1 (123) 123 4654", invoiceDate: "28.03.2024", dueDate: "06.04.2024", status: "Pending", totalAmount: "₦320.00" },
        { invoiceId: "#INV44554", phoneNumber: "+1 (123) 123 4654", invoiceDate: "28.03.2024", dueDate: "07.04.2024", status: "Overdue", totalAmount: "₦500.00" },
        { invoiceId: "#INV78554", phoneNumber: "+1 (123) 123 4654", invoiceDate: "28.03.2024", dueDate: "08.04.2024", status: "Paid", totalAmount: "₦750.00" },
    ];

    const handleViewInvoice = (invoiceId: string) => {
        console.log("Viewing invoice:", invoiceId);
    };

    return (
        <>
            <div className="flex gap-8">
                <InfoCard title="Packages Delivered" value="200" icon={<img src={packageIcon} alt="Packages Supplied" />} />
                <InfoCard title="Total Invoices" value="150" icon={<img src={totalIcon} alt="Total Paid" />} />
                <InfoCard title="Pending Invoices" value="50" icon={<img src={pendingIcon} alt="Pending Invoices" />} />
                <InfoCard title="Total Amount" value="₦250,000.00" icon={<img src={financeIcon} alt="Finance Approved" />} />
            </div>
            <div className="mt-5">
                <Table columns={columns} data={data}
                    actions={(row) => (
                        <div className="flex items-center gap-2">
                            <button
                                className="text-blue-500 ml-2"
                                onClick={() => handleViewInvoice(row.invoiceId)}
                            >
                                <Eye size="18" color={theme.colors.active} />
                            </button>
                        </div>
                    )}
                />
            </div>
        </>
    );
};

export default Invoices;

import React, { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";

type LineItem = {
    description: string;
    qty: number;
    unitPrice: number;
};

type InvoiceProps = {
    shopName: string;
    shopAddress: string;
    invoiceNumber?: string;
    date?: string;
    items: LineItem[];
};

const formatNaira = (n: number) =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
    }).format(n);

const InvoiceContent = React.forwardRef<HTMLDivElement, InvoiceProps>(
    ({ shopName, shopAddress, invoiceNumber, date, items }, ref) => {
        const subtotal = items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);
        const total = subtotal; // No VAT or service fee

        return (
            <div ref={ref} className="w-full max-w-sm mx-auto p-4 bg-white text-black font-sans relative">
                {/* Watermark */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 text-gray-500 text-6xl font-bold pointer-events-none">
                    <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 origin-center rotate-[-45deg]"
                        style={{ width: "400px", height: "400px" }}
                    >
                        WISAL COMPUTERS
                    </div>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-lg font-bold text-blue-800">RECEIPT</h1>
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div> {/* Logo Placeholder */}
                </div>

                {/* Shop Details */}
                <div className="text-xs mb-2">
                    <p>{shopName}</p>
                    <p>{shopAddress}</p>
                </div>

                {/* Receipt Details */}
                <div className="text-xs mb-3 text-right">
                    <p>
                        <strong>Receipt #:</strong> {invoiceNumber || "WEASF-345001"}
                    </p>
                    <p>
                        <strong>Receipt Date:</strong>{" "}
                        {date || new Date().toLocaleDateString("en-US")}
                    </p>
                </div>

                {/* Table Header */}
                <div className="border-t border-b py-1 mb-2 font-semibold text-xs">
                    <div className="flex">
                        <div className="w-1/6 text-center">QTY</div>
                        <div className="w-2/6">DESCRIPTION</div>
                        <div className="w-1/6 text-right">UNIT PRICE</div>
                        <div className="w-1/6 text-right">AMOUNT</div>
                    </div>
                </div>

                {/* Table Items */}
                <div>
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex py-1 border-b last:border-none text-xs"
                        >
                            <div className="w-1/6 text-center">{item.qty}</div>
                            <div className="w-2/6">{item.description}</div>
                            <div className="w-1/6 text-right">
                                {formatNaira(item.unitPrice)}
                            </div>
                            <div className="w-1/6 text-right">
                                {formatNaira(item.qty * item.unitPrice)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="mt-3 flex justify-end">
                    <div className="w-full max-w-[180px] text-xs">
                        <div className="flex justify-between">
                            <span className="font-medium">Subtotal:</span>
                            <span>{formatNaira(subtotal)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1 font-bold">
                            <span>Total:</span>
                            <span>{formatNaira(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-3 text-center text-[10px] text-gray-600">
                    <p>Thank you</p>
                    <div className="border-l-2 border-gray-400 pl-2 mt-1 text-left">
                        <p>Please proceed to make payment</p>
                        <p>Please make checks payable to: {shopName}</p>
                    </div>
                </div>
            </div>
        );
    }
);

InvoiceContent.displayName = "InvoiceContent";

export const PrintableInvoice = () => {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: "Pre-Receipt-Wisal-Computers",
    });

    const items: LineItem[] = [
        { description: "Battery (Dell XPS 13 9360)", qty: 1, unitPrice: 50000 },
        { description: "SSD (M.2 NVMe)", qty: 1, unitPrice: 32000 },
    ];

    // Automatically trigger print dialog when component mounts
    useEffect(() => {
        if (handlePrint && invoiceRef.current && items.length > 0) {
            setTimeout(() => handlePrint(), 0);
        }
    }, [handlePrint, items]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 gap-4">
            <style>
                {`
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                        .print-content {
                            visibility: visible !important;
                            height: auto !important;
                            width: 100% !important;
                            overflow: visible !important;
                        }
                        .print-content .watermark {
                            opacity: 0.1 !important;
                        }
                    }
                `}
            </style>
            <div className="invisible h-0 w-0 overflow-hidden print-content">
                <InvoiceContent
                    ref={invoiceRef}
                    shopName="Wisal Computers"
                    shopAddress="Wunti Street, Rafawa Plaza Shop 95, Bauchi State"
                    invoiceNumber="INV-2025-0001"
                    date={new Date().toLocaleDateString("en-US")}
                    items={items}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4 no-print">
                <button
                    onClick={handlePrint}
                    className="px-4 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-800 transition"
                >
                    Print Pre-Receipt
                </button>
                <button
                    onClick={() => alert("Redirect to payment page...")}
                    className="px-4 py-1 bg-green-700 text-white rounded text-sm hover:bg-green-800 transition"
                >
                    Proceed to Pay
                </button>
            </div>
        </div>
    );
};
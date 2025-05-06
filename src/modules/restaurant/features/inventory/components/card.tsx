import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import ReceiptPDF from '../../menu/ReceiptPDF';
import { ArrowSquareDown, ArrowSquareUp } from 'iconsax-react';

const Card = ({ orders, expandedOrders, toggleExpand, handleStatusUpdate }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {orders.map((order) => {
                const contentRef = useRef<HTMLDivElement>(null);
                const reactToPrintFn = useReactToPrint({ contentRef });

                return (
                    <div
                        key={order.id}
                        className="bg-white rounded-lg p-3 sm:p-4 flex flex-col hover:bg-gray-50 transition-all duration-300"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs sm:text-sm font-semibold text-gray-800">
                                #{order.id.substring(0, 6)}
                            </span>
                            <span
                                className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${
                                    order.status === 'PENDING'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : order.status === 'PREPARING'
                                        ? 'bg-blue-100 text-blue-800'
                                        : order.status === 'SERVED'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {order.status}
                            </span>
                            <div ref={contentRef}>
                                <ReceiptPDF orderData={order} reactToPrintFn={reactToPrintFn} />
                            </div>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-600 mb-2">
                            {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <div className="text-xs sm:text-sm text-gray-900">
                            <button
                                onClick={() => toggleExpand(order.id)}
                                className="flex items-center text-[#05431E] hover:underline mb-1 focus:outline-none text-[10px] sm:text-sm"
                                aria-label={expandedOrders.includes(order.id) ? 'Hide order items' : 'Show order items'}
                            >
                                {expandedOrders.includes(order.id) ? (
                                    <>
                                        Hide Items <ArrowSquareUp size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                                    </>
                                ) : (
                                    <>
                                        Show Items <ArrowSquareDown size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                                    </>
                                )}
                            </button>
                            {expandedOrders.includes(order.id) ? (
                                <ul className="list-disc pl-4 text-[10px] sm:text-sm">
                                    {order.orderItems.map((item, index) => (
                                        <li key={index} className="truncate" title={item.menuItem.name}>
                                            {item.menuItem.name} (x{item.quantity})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p
                                    className="truncate text-[10px] sm:text-sm"
                                    title={order.orderItems
                                        .map((item) => `${item.menuItem.name} (x${item.quantity})`)
                                        .join(', ')}
                                >
                                    {order.orderItems
                                        .map((item) => `${item.menuItem.name} (x${item.quantity})`)
                                        .join(', ')}
                                </p>
                            )}
                            {/* Add specialNote display */}
                            {order.specialNote && (
                                <p className="text-[10px] sm:text-xs text-gray-600 mt-2 italic">
                                    Note: {order.specialNote}
                                </p>
                            )}
                        </div>
                        <div className="mt-3 sm:mt-4">
                            <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                ₦{order.orderItems
                                    .reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0)
                                    .toLocaleString()}
                            </p>
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                className="mt-2 w-full border rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="PREPARING">In Process</option>
                                <option value="SERVED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Card;
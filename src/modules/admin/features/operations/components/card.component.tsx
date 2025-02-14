import React from "react";
import phoneImg from '@/assets/phone.svg'
import emailImg from '@/assets/email.svg'
import addressImg from '@/assets/address.svg'
import { StyledButton } from "@/components/button/button-lellall";
import { IoChevronDownSharp } from "react-icons/io5";

interface CardProps {
    restaurantName: string;
    customerType: string;
    date: string;
    products: number;
    agentName: string;
    phone: string;
    email: string;
    address: string;
    status: "Pending" | "Completed" | "Cancelled";
}

const OrderCard: React.FC<CardProps> = ({
    restaurantName,
    customerType,
    date,
    products,
    agentName,
    phone,
    email,
    address,
    status,
}) => {
    const statusColors = {
        Pending: "bg-yellow-500",
        Completed: "bg-green-500",
        Cancelled: "bg-red-500",
    };

    return (
        <div className="bg-white rounded-lg  p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-black text-sm">{restaurantName}</span>
                    <p className="text-gray-500 text-sm font-light mb-1 mt-1">{customerType}</p>
                </div>
                <button className="bg-orange-400 flex p-2 rounded-lg text-xs text-white" >
                    • {status} <div className="ml-1 mt-1"><IoChevronDownSharp /></div>
                </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col">
                    <span className="text-black text-sm">{date}</span>
                    <p className="text-gray-500 text-sm font-light mb-1 mt-1">Date</p>
                </div>
                <div className="flex flex-col">
                    <span className="text-black text-sm">{products}</span>
                    <p className="text-gray-500 text-sm font-light mb-1 mt-1">Products</p>
                </div>
                <div className="flex flex-col">
                    <span className="text-black text-sm flex">{agentName} <div className="ml-1 mt-1"><IoChevronDownSharp /></div></span>
                    <p className="text-gray-500 text-sm font-light mb-1 mt-1">Agent Assigned </p>
                </div>
            </div>
            <div className="flex justify-start gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <img src={phoneImg} />
                    <div>
                        <p className="text-gray-500 text-sm font-light mb-1 mt-1">Phone</p>
                        <span className="text-black text-sm">{phone}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <img src={emailImg} />
                    <div>
                        <p className="text-gray-500 text-sm font-light mb-1 mt-1">Email</p>
                        <span className="text-black text-sm">{email}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <img src={addressImg} />
                    <div>
                        <p className="text-gray-500 text-sm font-light mb-1 mt-1">Address</p>
                        <span className="text-black text-sm">{address}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
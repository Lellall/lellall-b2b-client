import React from "react";
import LellallSwitch from "@/components/ui/switch.component";
import users from '@/assets/subs-users.svg';

interface PackageCardProps {
    name: string;
    minPrice: number;
    maxPrice: number;
    participants: number;
    progress: number;
    isActive: boolean;
    background?: string;
    packageColor?: string;
    onToggle: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
    name,
    minPrice,
    maxPrice,
    participants,
    progress,
    isActive,
    background = "bg-gray-50",
    packageColor = "bg-green-900",
    onToggle,
}) => {
    return (
        <div className={`flex cursor-pointer items-center justify-between rounded-xl p-6 min-h-[120px] px-10 ${background}`}>
            {/* Package Details */}
            <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center rounded-md text-white ${packageColor}`}>
                    <span>-</span>
                </div>
                <div>
                    <h3 className="text-sm font-semibold">{name}</h3>
                    <p className="text-xs text-gray-400">
                        ₦{minPrice.toLocaleString()} - ₦{maxPrice.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Package Stats */}
            <div className="flex items-center gap-10">
                <div className="flex flex-col items-center gap-1 text-blue-600 text-xs">
                    <img src={users} alt="Participants Icon" />
                    <p className={`text-${packageColor}`}></p>{participants} Participants
                </div>

                <div className={`w-10 h-10 rounded-md ${packageColor}`}></div>

                <div className="flex flex-col text-xs text-gray-400">
                    <span className="text-gray-900 text-center ">{progress}%</span>
                    <p className="text-center">Average Monthly <br /> subscriptions</p>
                </div>

                {/* Toggle Switch */}
                <LellallSwitch checked={isActive} onChange={onToggle} />
            </div>
        </div>
    );
};

export default PackageCard;

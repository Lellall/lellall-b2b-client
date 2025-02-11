import React from "react";

type InfoCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
};

const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-xl p-4 flex justify-between gap-4 w-64 transition-transform duration-200 hover:scale-105">
      <div className="flex flex-col">
        <span className="text-gray-500 text-sm font-light">{title}</span>
        <span className="text-lg mt-1 text-gray-900">{value}</span>
      </div>
      <div className="max-w-[60px]">{icon}</div>
    </div>
  );
};

export default InfoCard;

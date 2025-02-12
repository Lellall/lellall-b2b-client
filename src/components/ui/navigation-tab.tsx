import { useState } from "react";

export type Tab = {
    name: string;
    active: boolean;
    width?: string;
};

const NavigationTabs = ({ tabs, width }: { tabs: Tab[]; width?: string }) => {
    const [activeTab, setActiveTab] = useState(
        tabs.find((tab) => tab.active)?.name || tabs[0]?.name
    );

    return (
        <div
            className="flex font-light space-x-4 text-sm bg-white rounded font-medium"
            style={{ width: width ? width : "420px", height: '45px' }}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-4 rounded-lg transition-all font-light duration-300 ${activeTab === tab.name
                        ? "bg-[#05431E] text-white"
                        : "text-[#05431E] hover:text-opacity-70"
                        }`}
                >
                    {tab.name}
                </button>
            ))}
        </div>
    );
};

export default NavigationTabs;

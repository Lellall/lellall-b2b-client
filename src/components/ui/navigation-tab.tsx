import { useState, useEffect } from "react";

export type Tab = {
    name: string;
    active: boolean;
    width?: string;
};

interface NavigationTabsProps {
    tabs: Tab[];
    width?: string;
    onTabChange?: (tabName: string) => void;
}

const NavigationTabs = ({ tabs, width, onTabChange }: NavigationTabsProps) => {
    const [activeTab, setActiveTab] = useState(
        tabs.find((tab) => tab.active)?.name || tabs[0]?.name
    );

    // Update internal state when external tabs change
    useEffect(() => {
        const activeTabName = tabs.find((tab) => tab.active)?.name;
        if (activeTabName && activeTabName !== activeTab) {
            setActiveTab(activeTabName);
        }
    }, [tabs, activeTab]);

    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
        if (onTabChange) {
            onTabChange(tabName);
        }
    };

    return (
        <div
            className="flex font-light space-x-4 text-sm bg-white rounded font-medium"
            style={{ width: width ? width : "420px", height: '45px' }}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.name}
                    onClick={() => handleTabClick(tab.name)}
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

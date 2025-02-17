import { useState } from "react";
import Order from "./order.component";
import Invoices from "./Invoices.component";
import MenuCategory from "./menu-catetory.component";
import Staffs from "./staffs.component";

const TabsLayout = () => {
    const [activeTab, setActiveTab] = useState('tab-1');

    const openTab = (tab: string) => {
        setActiveTab(tab);
    };

    return (
        <div className="mt-5">
            <div className="flex mb-4 border-b border-gray-200">
                <button
                    className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-1' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-1')}
                >
                    Orders
                </button>
                <button
                    className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-2' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-2')}
                >
                    Inventory
                </button>
                <button
                    className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-3' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-3')}
                >
                    Invoices
                </button>
                <button
                    className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-4' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-4')}
                >
                    Menu & Caterory
                </button>
                <button
                    className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-5' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-5')}
                >
                    Staffs
                </button>
            </div>

            <div className="pt-4 mx-2">
                {activeTab === 'tab-1' &&
                    <Order />
                }
                {activeTab === 'tab-2' && <div>
                    <div>hello</div>
                </div>}
                {activeTab === 'tab-3' && <div>
                    <div><Invoices /></div>
                </div>}
                {activeTab === 'tab-4' && <div>
                    <div><MenuCategory /></div>
                </div>}
                {activeTab === 'tab-5' && <div>
                    <div><Staffs /></div>
                </div>}
            </div>
        </div>
    );
};

export default TabsLayout;
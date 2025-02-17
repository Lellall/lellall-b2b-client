import { useState } from "react";
import Shop from "./shop";
import { AccordionDemo } from "./branch";

const Shops = () => {
    const [activeTab, setActiveTab] = useState('tab-1');
    const openTab = (tab: string) => {
        setActiveTab(tab);
    };
    return (
        <div className="">
            <div className="flex mb-4 border-b border-gray-200">
                <button
                    className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-1' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-1')}
                >
                    Shops
                </button>
                <button
                    className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-2' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-2')}
                >
                    Branches
                </button>
            </div>

            <div className="pt-4">
                {activeTab === 'tab-1' && <div>
                    <Shop />
                </div>}
                {activeTab === 'tab-2' && <div>
                    <AccordionDemo />
                </div>}
            </div>
        </div>
    )
}

export default Shops
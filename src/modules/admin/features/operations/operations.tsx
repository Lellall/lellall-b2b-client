import { useState } from "react";
import Operation from "./operation";
import Subscriptions from "./subscriptions";

const Operations = () => {
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
                    Orders
                </button>
                <button
                    className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-2' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-2')}
                >
                    Customers
                </button>
                <button
                    className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-3' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-3')}
                >
                    Subscriptions
                </button>
                <button
                    className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-4' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
                    onClick={() => openTab('tab-4')}
                >
                    Transactions
                </button>
            </div>

            <div className="pt-4">
                {activeTab === 'tab-1' && <div>
                    <Operation />
                </div>}
                {activeTab === 'tab-2' && <div>
                  <div>Hello</div>
                </div>}
                {activeTab === 'tab-3' && <div>
                  <Subscriptions />
                </div>}
                {activeTab === 'tab-4' && <div>
                  <div>Hello</div>
                </div>}
            </div>
        </div>
    )
}

export default Operations
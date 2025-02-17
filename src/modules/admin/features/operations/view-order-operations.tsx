import React, { useState } from 'react'
import OrderCard from './components/card.component'
import ListCard, { Item } from '@/components/ui/list-group';
import Breadcrumb from '@/components/ui/breadcrumb';

const ViewOrderOperations = () => {
    const [items, setItems] = useState<Item[]>([
        { name: "Apple", quantity: "10pcs" },
        { name: "Mango", quantity: "13pcs" },
        { name: "Maggi", quantity: "2 carton" },
        { name: "Spaghetti", quantity: "1 carton" },
        { name: "Malt", quantity: '1 carton' },
    ]);
    const [selectedItems, setSelectedItems] = useState<Item[]>([
        { name: "Apple", quantity: "10pcs" },
        { name: "Mango", quantity: "13pcs" },
        { name: "Maggi", quantity: "2 carton" },
        { name: "Spaghetti", quantity: "1 carton" },
        { name: "Malt", quantity: '1 carton' },
    ]);

    const handleDelete = (name: string) => {
        setSelectedItems((prev) => prev.filter((item) => item.name !== name));
    };
    return (
        <div>
            <Breadcrumb items={[
                { label: 'Orders', href: '/operations' },
                { label: 'The Green Fork' }
            ]} />
            <div className="mx-10 my-10">

            <OrderCard
                restaurantName="Supply request from Green Fork"
                customerType="Customer"
                date="01/01/2025"
                products={28}
                agentName="Ibrahim Umar"
                phone="(+234)0812 983 3930"
                email="christy.oka4@outlook.com"
                address="No. 34 Ibadan street opposite Hilda Macca road, Wuse, Abuja"
                status="Pending"
            />
            <div className='rounded-lg mt-5 mb-10 flex justify-between bg-white w-full p-6'>
                <ListCard title="Products Requested" items={items} showSearch={true} />
                <ListCard title="Products Availble" onDelete={handleDelete} items={selectedItems} showSearch={false} showDelete={true} headerBgColor="bg-purple-600" />
            </div>
            </div>
        </div>
    )
}

export default ViewOrderOperations
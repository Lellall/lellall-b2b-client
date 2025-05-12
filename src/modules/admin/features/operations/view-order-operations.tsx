import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import OrderCard from './components/card.component';
import ListCard, { Item } from '@/components/ui/list-group';
import Breadcrumb from '@/components/ui/breadcrumb';
import { useGetSupplyRequestByIdQuery } from '@/redux/api/inventory/inventory.api';

const ViewOrderOperations = () => {
  const { id } = useParams<{ id: string }>(); // Extract id from URL params
  const { data, isLoading, isError } = useGetSupplyRequestByIdQuery(
    { id, subdomain: 'yax' },
    {
      skip: !id,
    }
  );
  

  // Initialize items (Products Requested) and selectedItems (Products Available)
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  // Map API data to ListCard items when data is available
  React.useEffect(() => {
    if (data) {
      const productItem = {
        name: data.productName,
        quantity: `${data.quantity} ${data.unitOfMeasurement || 'units'}`,
      };
      setItems([productItem]);
      setSelectedItems([]); // Start with no items in Products Available
    }
  }, [data]);

  // Handle selecting an item from Products Requested
  const handleSelect = (item: Item) => {
    setSelectedItems((prev) => {
      // Avoid adding duplicates
      if (prev.some((selected) => selected.name === item.name)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  // Handle deleting an item from Products Available
  const handleDelete = (name: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.name !== name));
  };

  // Handle loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle error state
  if (isError || !data) {
    return <div>Error loading supply request or no data found.</div>;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Orders', href: '/operations' },
          { label: data.restaurant.name || 'Restaurant' },
        ]}
      />
      <div className="mx-10 my-10">
        <OrderCard
          restaurantName={`Supply request from ${data.restaurant.name}`}
          customerType="Restaurant"
          date={new Date(data.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
          products={1} // Single product per API data
          agentName={`${data.requestedBy.firstName} ${data.requestedBy.lastName}`}
          phone={data.vendor.contactInfo || 'N/A'} // Assuming contactInfo might include phone
          email={data.vendor.contactInfo || 'N/A'} // Adjust if separate email field exists
          address={data.restaurant.address || data.vendor.address || 'N/A'}
          status={data.status}
        />
        <div className="rounded-lg mt-5 mb-10 flex justify-between bg-white w-full p-6">
          <ListCard
            title="Products Requested"
            items={items}
            showSearch={true}
            onSelect={handleSelect} // Handle item selection
          />
          <ListCard
            title="Products Available"
            items={selectedItems}
            showSearch={false}
            showDelete={true}
            headerBgColor="bg-purple-600"
            onDelete={handleDelete} // Handle item deletion
          />
        </div>
      </div>
    </div>
  );
};

export default ViewOrderOperations;
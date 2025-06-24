import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderCard from './components/card.component';
import ListCard, { Item } from '@/components/ui/list-group';
import Breadcrumb from '@/components/ui/breadcrumb';
import { useGetSupplyRequestByIdQuery, useGenerateInvoiceMutation } from '@/redux/api/inventory/inventory.api';
import { moneyFormatter } from '@/utils/moneyFormatter';


interface Item {
  name: string;
  quantity: string;
  rawQuantity?: number;
  unitPrice?: number;
}

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedItems: Item[];
  onConfirm: (options: { download: boolean; sendEmail: boolean }) => void;
  restaurantName?: string;
  phone?: string;
  email?: string;
  address?: string;
}> = ({ isOpen, onClose, selectedItems, onConfirm, restaurantName, phone, email, address }) => {
  const [download, setDownload] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{restaurantName || 'Restaurant'}</h2>
            <p className="text-sm text-gray-600">Customer</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'numeric', year: 'numeric' })}</p>
            <p className="text-sm text-gray-600">Invoice #: 05</p>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-green-500">📞</span>
            <p>Phone: {phone || 'N/A'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">📧</span>
            <p>Email: {email || 'N/A'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-500">🏠</span>
            <p>Address: {address || 'N/A'}</p>
          </div>
        </div>

        {/* Table Section */}
        {selectedItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No items selected.</p>
        ) : (
          <div className="mb-6">
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800">S/N</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800">Item</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-800">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-800">Unit Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-800">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-700">{item.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{item.rawQuantity}</td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        ₦{item.unitPrice ? item.unitPrice.toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        ₦{item.rawQuantity && item.unitPrice ? (item.rawQuantity * item.unitPrice).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Checkbox Section */}
        <div className="mb-6 space-y-3">
          <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={download}
              onChange={(e) => setDownload(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Download PDF</span>
          </label>
          <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Send as Email</span>
          </label>
        </div>

        {/* Buttons Section */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ download, sendEmail })}
            disabled={selectedItems.length === 0 || (!download && !sendEmail)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${selectedItems.length === 0 || (!download && !sendEmail)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewOrderOperations = () => {
  const { date, id } = useParams<{ date: string; id: string }>();
  const userId = '9c228302-4eed-46f3-853a-9a13cfa24d14';
  const subdomain = 'yax';

  const { data, isLoading, isError } = useGetSupplyRequestByIdQuery(
    { subdomain, date, restaurantId: id, userId },
    { skip: !date || !id || !userId }
  );

  const [generateInvoice, { isLoading: isGeneratingInvoice }] = useGenerateInvoiceMutation();

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (data && data.items && Array.isArray(data.items)) {
      const productItems = data.items.map((item) => ({
        name: item.productName,
        quantity: `${moneyFormatter(item.quantity * item.unitPrice)}`,
        rawQuantity: item.quantity, // Store raw quantity for invoice
        unitPrice: item.unitPrice, // Store unit price for invoice
      }));
      setItems(productItems);
      setSelectedItems([]);
    }
  }, [data]);

  const handleSelect = (item: Item) => {
    setSelectedItems((prev) => {
      if (prev.some((selected) => selected.name === item.name)) {
        return prev.filter((selected) => selected.name !== item.name);
      }
      return [...prev, item];
    });
  };

  const handleToggleAll = () => {
    setSelectedItems(items);
  };

  const handleDelete = (name: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.name !== name));
  };

  const handleGenerateInvoice = async (options: { download: boolean; sendEmail: boolean }) => {
    if (selectedItems.length === 0) return;

    const invoiceData = {
      restaurantId: id,
      items: selectedItems.map((item) => ({
        name: item.name,
        quantity: item.rawQuantity,
        unitPrice: item.unitPrice,
      })),
      customer: {
        name: data.restaurant.name,
        email: 'john.doe@gmail.com',
      },
      sendEmail: options.sendEmail,
      download: true, // Ensure download is true to get binary PDF
    };

    try {
      const response = await fetch('http://localhost:3333/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate invoice');
      }

      // Check Content-Type to confirm binary PDF
      const contentType = response.headers.get('Content-Type');
      console.log('Content-Type:', contentType);

      if (contentType.includes('application/pdf')) {
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const text = await response.text();
        console.log('Unexpected response:', text.slice(0, 100));
        throw new Error('Expected application/pdf, received ' + contentType);
      }
    } catch (error) {
      console.error('Download failed:', error.message);
      alert('Failed to download invoice: ' + error.message);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !data || !data.items) {
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
          setIsModalOpen={setIsModalOpen}
          selectedItems={selectedItems}
          restaurantName={`Supply request from ${data.restaurant.name}`}
          customerType="Restaurant"
          date={new Date(data.items[0]?.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}

          products={data.items.length}
          agentName={`${data.items[0]?.requestedBy.firstName} ${data.items[0]?.requestedBy.lastName}`}
          phone={data.items[0]?.vendor.contactInfo || 'N/A'}
          email={data.items[0]?.vendor.contactInfo || 'N/A'}
          address={data.restaurant.address || data.items[0]?.vendor.address || 'N/A'}
          status={data.items[0]?.status || 'Unknown'}
        />
        <div className="rounded-lg mt-5 mb-10 flex justify-between bg-white w-full p-6">
          <ListCard
            title="Products Requested"
            items={items}
            showSearch={true}
            selectedItems={selectedItems}
            onSelect={handleSelect}
            onToggleAll={handleToggleAll}
          />
          <ListCard
            title="Products Available"
            items={selectedItems}
            showSearch={true}
            showDelete={true}
            headerBgColor="bg-purple-600"
            selectedItems={selectedItems}
            onDelete={handleDelete}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={selectedItems.length === 0}
            className={`px-4 py-2 rounded ${selectedItems.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
              }`}
          >
            Generate Invoice
          </button>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedItems={selectedItems}
        onConfirm={handleGenerateInvoice}
        restaurantName={data.restaurant.name}
        phone={data.items[0]?.vendor.contactInfo || 'N/A'}
        email={data.items[0]?.vendor.contactInfo || 'N/A'}
        address={data.restaurant.address || data.items[0]?.vendor.address || 'N/A'}
      />
    </div>
  );
};

export default ViewOrderOperations;
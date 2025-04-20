// src/pages/Orders.tsx
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import OrderCard from "./components/order-card";
import SearchBar from "@/components/search-bar/search-bar";
import { Add, MinusCirlce, Send, Receipt, Edit } from "iconsax-react";
import { useCreateOrdersMutation, useUpdateOrdersMutation } from "@/redux/api/order/order.api";
import { useGetAllMenuItemsQuery } from "@/redux/api/menu/menu.api";
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { ColorRing } from 'react-loader-spinner';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  status: string;
}

const Orders = () => {
  const [order, setOrder] = useState({});
  const [orderSent, setOrderSent] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [tableNumber, setTableNumber] = useState("01");
  const [createdOrders, setCreatedOrders] = useState<any[]>([]);

  const { subdomain, user } = useSelector(selectAuth);

  const { data: menuItems = [], isLoading: isLoadingMenu, error: menuError } = useGetAllMenuItemsQuery({ subdomain });
  const [createOrders, { isLoading: isCreating }] = useCreateOrdersMutation();
  const [updateOrderStatus] = useUpdateOrdersMutation();

  const generateDarkColorFromId = (id: string) => {
    if (!id) return "bg-gray-700";
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const darkColors = ["bg-blue-700", "bg-green-700", "bg-purple-700", "bg-red-700", "bg-yellow-700", "bg-indigo-700"];
    return darkColors[hash % darkColors.length];
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setOrder((prev) => {
      const currentQty = prev[itemId]?.quantity || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      const item = menuItems.find((i: MenuItem) => i.id === itemId);
      return { ...prev, [itemId]: { quantity: newQty, price: item.price, name: item.name } };
    });
  };

  const calculateTotal = () => {
    const subtotal = Object.values(order).reduce((acc: number, { quantity, price }: any) => acc + quantity * price, 0);
    const tax = 100;
    return { subtotal, tax, total: subtotal + tax };
  };

  const sendOrderToKitchen = async () => {
    const orderData = {
      waiterId: user?.id,
      items: Object.entries(order).map(([id, { quantity }]: [string, any]) => ({
        menuItemId: id,
        quantity,
      })),
    };

    try {
      const response = await createOrders({ subdomain, data: orderData }).unwrap();
      setCreatedOrders((prev) => [
        ...prev,
        {
          ...response,
          orderNumber: response.id.slice(0, 8),
          items: orderData.items,
          timestamp: new Date().toISOString(),
          total: calculateTotal().total,
          status: "PENDING",
        },
      ]);
      setOrderSent(true);
      setOrder({});
    } catch (error) {
      console.error("Failed to send order:", error);
      alert("Failed to send order. Try again.");
    }
  };

  const generateReceipt = () => {
    const { subtotal, tax, total } = calculateTotal();
    const receiptData = {
      table: `Table ${tableNumber}`,
      items: Object.entries(order).map(([id, { quantity, price, name }]: [string, any]) => ({
        id,
        name,
        quantity,
        subtotal: quantity * price,
      })),
      subtotal,
      tax,
      total,
      date: new Date().toLocaleString(),
    };
    setReceipt(receiptData);
  };

  if (isLoadingMenu) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ColorRing
          height="80"
          width="80"
          radius="9"
          color="#05431E"
          ariaLabel="three-dots-loading"
          visible={true}
        />
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center text-red-500">
        Error loading menu items: {JSON.stringify(menuError)}
      </div>
    );
  }

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <SearchBar
              placeholder="Search Items"
              width="300px"
              height="42px"
              border="1px solid #fff"
              borderRadius="10px"
              backgroundColor="#ffffff"
              shadow={false}
              fontSize="11px"
              color="#444"
              inputPadding="10px"
              placeholderColor="#bbb"
              iconColor="#ccc"
              iconSize={15}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                className="bg-[#05431E] text-white hover:bg-[#04391A] text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
              >
                All
              </Button>
              <Button variant="ghost" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">
                In Process
              </Button>
              <Button variant="ghost" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">
                Completed
              </Button>
              <Button variant="ghost" className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2">
                Cancelled
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Items Grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Take Order</h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
              {menuItems.map((item: MenuItem) => (
                <div
                  key={item.id}
                  className={`p-2 sm:p-3 rounded-lg ${generateDarkColorFromId(item.id)} text-white transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:brightness-110`}
                >
                  <div className="flex flex-col space-y-1">
                    <h3 className="text-xs sm:text-sm font-semibold truncate ">{item.name}</h3>
                    <p className="text-[10px] sm:text-xs font-medium">₦{item.price.toLocaleString()}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="bg-white bg-opacity-20 p-1 rounded-full hover:bg-opacity-30 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <MinusCirlce size={12} className="sm:w-4 sm:h-4" />
                        </button>
                        <span className="text-xs sm:text-sm font-medium w-5 sm:w-6 text-center">
                          {order[item.id]?.quantity || 0}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="bg-white bg-opacity-20 p-1 rounded-full hover:bg-opacity-30 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Add size={12} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Created Orders */}
          <div className="space-y-6">
            {/* Current Order Summary */}
            <div className="bg-white p-4 rounded-lg  h-[80vh] sm:h-[70vh] flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs sm:text-sm font-semibold">Table {tableNumber}</p>
                <Edit
                  size={14}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer text-[#05431E]"
                  onClick={() => setTableNumber(prompt("Enter table number", tableNumber) || tableNumber)}
                  aria-label="Edit table number"
                />
              </div>
              <div className="flex-1 overflow-y-auto mb-3">
                {Object.entries(order).map(([id, { quantity, price, name }]: [string, any], index) => (
                  <div
                    key={id}
                    className="rounded-lg flex p-2 justify-between items-center mb-2 last:mb-0 bg-[#FAFBFF]"
                  >
                    <div className="flex items-center">
                      <div className="bg-[#05431E] p-1 text-center text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs flex items-center justify-center">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <p className="ml-2 text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-[150px]">
                        {name} x{quantity}
                      </p>
                    </div>
                    <p className="text-[10px] sm:text-xs">₦{(price * quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#FAFBFF] p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between">
                  <p className="text-xs sm:text-sm">Subtotal</p>
                  <p className="text-xs sm:text-sm">₦{subtotal.toLocaleString()}</p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-xs sm:text-sm">Tax</p>
                  <p className="text-xs sm:text-sm">₦{tax.toLocaleString()}</p>
                </div>
                <div className="mt-3 mb-3 border-t border-[#05431E] border-t-[0.5px] border-dashed" />
                <div className="flex justify-between">
                  <p className="text-xs sm:text-sm font-semibold">Total</p>
                  <p className="text-xs sm:text-sm font-semibold">₦{total.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex my-4 sm:my-5 flex-col sm:flex-row justify-between gap-2">
                <Button
                  onClick={sendOrderToKitchen}
                  disabled={!Object.keys(order).length || isCreating}
                  className="flex items-center bg-[#05431E] text-white px-3 py-2 rounded-lg hover:bg-[#04391A] text-xs sm:text-sm transition-all disabled:bg-gray-400 justify-center"
                >
                  {isCreating ? (
                    <ColorRing
                      height="20"
                      width="20"
                      radius="9"
                      color="#ffffff"
                      ariaLabel="three-dots-loading"
                      visible={true}
                    />
                  ) : (
                    <>
                      <Send size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Send To Kitchen
                    </>
                  )}
                </Button>
                <Button
                  onClick={generateReceipt}
                  disabled={!Object.keys(order).length}
                  className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-xs sm:text-sm transition-all disabled:bg-gray-400"
                >
                  <Receipt size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Receipt
                </Button>
              </div>
            </div>

            {/* Created Orders Display */}
            {createdOrders.length > 0 && (
              <div className="space-y-4">
                {createdOrders.map((createdOrder) => (
                  <OrderCard
                    key={createdOrder.id}
                    orderNumber={createdOrder.orderNumber}
                    date={new Date(createdOrder.timestamp).toLocaleDateString()}
                    time={new Date(createdOrder.timestamp).toLocaleTimeString()}
                    items={createdOrder.items.map((item: any) => ({
                      name: menuItems.find((i: MenuItem) => i.id === item.menuItemId)?.name || "Unknown",
                      qty: item.quantity.toString(),
                      price: `₦${(menuItems.find((i: MenuItem) => i.id === item.menuItemId)?.price * item.quantity).toLocaleString()}`,
                    }))}
                    subtotal={`₦${(createdOrder.total - 100).toLocaleString()}`}
                    status={createdOrder.status}
                    subdomain={subdomain}
                    id={createdOrder.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Receipt Modal */}
        {receipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100]">
            <div className="bg-white p-4 rounded-lg  w-full max-w-[90%] sm:max-w-[400px]">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Receipt</h2>
              <p className="text-[10px] sm:text-xs text-gray-600 mb-2">{receipt.date}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 mb-2">{receipt.table}</p>
              <ul className="space-y-1 mb-2 max-h-32 sm:max-h-40 overflow-y-auto">
                {receipt.items.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-[10px] sm:text-sm text-gray-700"
                  >
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">{item.name} (x{item.quantity})</span>
                    <span>₦{item.subtotal.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between text-[10px] sm:text-sm">
                <span>Subtotal</span>
                <span>₦{receipt.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] sm:text-sm mt-1">
                <span>Tax</span>
                <span>₦{receipt.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] sm:text-sm font-semibold mt-2">
                <span>Total</span>
                <span>₦{receipt.total.toLocaleString()}</span>
              </div>
              <Button
                onClick={() => setReceipt(null)}
                className="mt-4 bg-[#05431E] text-white hover:bg-[#04391A] w-full text-xs sm:text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
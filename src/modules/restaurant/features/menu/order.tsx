import { Button } from "@/components/ui/button";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Add, MinusCirlce, Send, Trash } from "iconsax-react";
import { GripVertical } from "lucide-react";
import OrderCard from "./components/order-card";
import PreReceipt from "./pre-receipt";
import SearchBar from "@/components/search-bar/search-bar";
import { useCreateOrdersMutation, useUpdateOrdersMutation } from "@/redux/api/order/order.api";
import { useGetAllMenuItemsQuery, useGetAllTagsQuery, useGetMenuItemsByTagQuery } from "@/redux/api/menu/menu.api";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
import { ColorRing } from "react-loader-spinner";
import { PrintableInvoice } from "./rafawa";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  tags: string[];
}

const Orders = () => {
  const [order, setOrder] = useState({});
  const [orderSent, setOrderSent] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [tableNumber, setTableNumber] = useState("01");
  const [specialNote, setSpecialNote] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [createdOrders, setCreatedOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState(""); // New: Search query state
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { subdomain, user } = useSelector(selectAuth);
  const { data: menuItems = [], isLoading: isLoadingMenu, error: menuError } = useGetAllMenuItemsQuery({ 
    subdomain,
    search: searchQuery // Pass search query to the backend
  });
  const { data: tags = [], isLoading: isLoadingTags, error: tagsError } = useGetAllTagsQuery({ subdomain });
  const { data: taggedItems = [], isLoading: isLoadingTaggedItems, error: taggedItemsError } = useGetMenuItemsByTagQuery(
    { subdomain, tag: activeTab, search: searchQuery }, // Pass search query to tagged items
    { skip: activeTab === "All" }
  );
  const [createOrders, { isLoading: isCreating }] = useCreateOrdersMutation();
  const [updateOrderStatus] = useUpdateOrdersMutation();

  const displayedItems = useMemo(() => {
    const items = activeTab === "All" ? menuItems : taggedItems;
    if (!searchQuery) return items;
    return items.filter((item: MenuItem) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, taggedItems, activeTab, searchQuery]);

  useEffect(() => {
    if (activeTab === "All") {
      return;
    }
    setOrder((prev) => {
      const validItemIds = new Set(taggedItems.map((item: MenuItem) => item.id));
      const filteredOrder = Object.fromEntries(
        Object.entries(prev).filter(([itemId]) => validItemIds.has(itemId))
      );
      return filteredOrder;
    });
  }, [activeTab, taggedItems]);

  const generateDarkColorFromId = (id: string) => {
    if (!id) return "bg-gray-700";
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const darkColors = ["bg-blue-700", "bg-green-700", "bg-purple-700", "bg-red-700", "bg-yellow-700", "bg-indigo-700"];
    return darkColors[hash % darkColors.length];
  };

  // Generate color gradient for tags
  const getTagColor = (tag: string) => {
    const hash = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorGradients = [
      { from: "from-orange-500", to: "to-red-500", hover: "hover:from-orange-600 hover:to-red-600" }, // Kitchen - warm colors
      { from: "from-blue-500", to: "to-cyan-500", hover: "hover:from-blue-600 hover:to-cyan-600" }, // Bar - cool colors
      { from: "from-purple-500", to: "to-pink-500", hover: "hover:from-purple-600 hover:to-pink-600" }, // Dessert
      { from: "from-green-500", to: "to-emerald-500", hover: "hover:from-green-600 hover:to-emerald-600" }, // Salad
      { from: "from-indigo-500", to: "to-blue-500", hover: "hover:from-indigo-600 hover:to-blue-600" }, // Beverages
      { from: "from-amber-500", to: "to-yellow-500", hover: "hover:from-amber-600 hover:to-yellow-600" }, // Appetizers
      { from: "from-rose-500", to: "to-pink-500", hover: "hover:from-rose-600 hover:to-pink-600" }, // Special
      { from: "from-teal-500", to: "to-cyan-500", hover: "hover:from-teal-600 hover:to-cyan-600" }, // Other
    ];
    return colorGradients[hash % colorGradients.length];
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

  const removeItem = (itemId: string) => {
    setOrder((prev) => {
      const { [itemId]: _, ...rest } = prev;
      return rest;
    });
  };

  const calculateTotal = () => {
    const subtotal = Object.values(order).reduce((acc: number, { quantity, price }: any) => acc + quantity * price, 0);
    const vatRate = 0.075;
    const serviceFeeRate = subdomain === "355" ? 0 : 0.10;
    const discountAmount = subtotal * (discountPercentage / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const vatTax = discountedSubtotal * vatRate;
    const serviceFee = subdomain === "355" ? 0 : discountedSubtotal * serviceFeeRate;
    const total = discountedSubtotal + vatTax + serviceFee;
    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      discountedSubtotal: Number(discountedSubtotal.toFixed(2)),
      vatTax: Number(vatTax.toFixed(2)),
      serviceFee: Number(serviceFee.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  };

  const sendOrderToKitchen = async (tag?: string) => {
    // If tag is provided, filter order items by that tag
    let filteredOrder = order;
    if (tag && activeTab === "All") {
      const itemsWithTag = menuItems.filter((item: MenuItem) => 
        item.tags && item.tags.includes(tag)
      );
      const itemIdsWithTag = new Set(itemsWithTag.map((item: MenuItem) => item.id));
      filteredOrder = Object.fromEntries(
        Object.entries(order).filter(([id]) => itemIdsWithTag.has(id))
      );
    }

    if (Object.keys(filteredOrder).length === 0) {
      alert("No items to send for this tag.");
      return;
    }

    const orderData = {
      waiterId: user?.id,
      items: Object.entries(filteredOrder).map(([id, { quantity }]: [string, any]) => ({
        menuItemId: id,
        quantity,
      })),
      specialNote,
      paymentType: null,
      discountPercentage,
    };

    try {
      const response = await createOrders({ subdomain, data: orderData }).unwrap();
      const { subtotal, discountAmount, discountedSubtotal, vatTax, serviceFee, total } = calculateTotal();
      setCreatedOrders((prev) => [
        ...prev,
        {
          ...response,
          orderNumber: response.id.slice(0, 8),
          items: orderData.items,
          timestamp: new Date().toISOString(),
          subtotal,
          discountAmount,
          discountedSubtotal,
          vatTax,
          serviceFee,
          total,
          status: "PENDING",
          specialNote,
          paymentType: null,
          discountPercentage,
        },
      ]);
      setOrderSent(true);
      
      // Remove sent items from order
      if (tag && activeTab === "All") {
        setOrder((prev) => {
          const itemsWithTag = menuItems.filter((item: MenuItem) => 
            item.tags && item.tags.includes(tag)
          );
          const itemIdsWithTag = new Set(itemsWithTag.map((item: MenuItem) => item.id));
          return Object.fromEntries(
            Object.entries(prev).filter(([id]) => !itemIdsWithTag.has(id))
          );
        });
      } else {
        setOrder({});
      }
      
      setSpecialNote("");
      setDiscountPercentage(0);
      setSearchQuery(""); // Reset search query after sending order
    } catch (error) {
      console.error("Failed to send order:", error);
      alert("Failed to send order. Try again.");
    }
  };

  const generateReceipt = () => {
    const { subtotal, discountAmount, discountedSubtotal, vatTax, serviceFee, total } = calculateTotal();
    const receiptData = {
      table: `Table ${tableNumber}`,
      items: Object.entries(order).map(([id, { quantity, price, name }]: [string, any]) => ({
        id,
        name,
        quantity,
        subtotal: Number((quantity * price).toFixed(2)),
      })),
      subtotal,
      discountAmount,
      discountedSubtotal,
      vatTax,
      serviceFee,
      total,
      date: new Date().toLocaleString(),
      specialNote,
      discountPercentage,
    };
    setReceipt(receiptData);
  };

  const getButtonText = () => {
    if (activeTab === "All") return "Place Order";
    return `Send to ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`;
  };

  // Get unique tags from items in the order (only for "All" tab)
  const orderTags = useMemo(() => {
    if (activeTab !== "All" || Object.keys(order).length === 0) return [];
    
    const tagsSet = new Set<string>();
    Object.keys(order).forEach((itemId) => {
      const item = menuItems.find((i: MenuItem) => i.id === itemId);
      if (item && item.tags && item.tags.length > 0) {
        item.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  }, [order, menuItems, activeTab]);

  // Count items per tag
  const itemsByTag = useMemo(() => {
    if (activeTab !== "All" || Object.keys(order).length === 0) return {};
    
    const counts: Record<string, number> = {};
    Object.keys(order).forEach((itemId) => {
      const item = menuItems.find((i: MenuItem) => i.id === itemId);
      if (item && item.tags && item.tags.length > 0) {
        item.tags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + (order[itemId]?.quantity || 0);
        });
      }
    });
    return counts;
  }, [order, menuItems, activeTab]);

  // Get detailed items by tag for summary
  const itemsDetailsByTag = useMemo(() => {
    if (activeTab !== "All" || Object.keys(order).length === 0) return {};
    
    const details: Record<string, Array<{ name: string; quantity: number }>> = {};
    Object.entries(order).forEach(([itemId, { quantity, name }]: [string, any]) => {
      const item = menuItems.find((i: MenuItem) => i.id === itemId);
      if (item && item.tags && item.tags.length > 0) {
        item.tags.forEach((tag) => {
          if (!details[tag]) details[tag] = [];
          details[tag].push({ name, quantity });
        });
      }
    });
    return details;
  }, [order, menuItems, activeTab]);

  // Drag handlers
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleDrag = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      if (dragRef.current) {
        const rect = dragRef.current.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        const newX = Math.max(0, Math.min(maxX, clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(maxY, clientY - dragOffset.y));
        
        setDragPosition({ x: newX, y: newY });
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDrag, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDrag);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, dragOffset]);

  if (isLoadingMenu || isLoadingTags) {
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

  if (menuError || tagsError || taggedItemsError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center text-red-500">
        Error loading data: {JSON.stringify(menuError || tagsError || taggedItemsError)}
      </div>
    );
  }

  const { subtotal, discountAmount, discountedSubtotal, vatTax, serviceFee, total } = calculateTotal();

  return (
    <div className="min-h-screen p-4 bg-gray-100 pb-24 sm:pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {["All", ...tags].map((tag) => (
              <Button
                key={tag}
                variant={activeTab === tag ? "default" : "ghost"}
                className={`text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 transition-all ${activeTab === tag ? "bg-[#05431E] text-white border-b-2 border-[#04391A]" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveTab(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Take Order</h1>
            </div>
            {/* New: Add SearchBar component */}
            <div className="mb-4">
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu items..."
                className="w-full"
              />
            </div>
            {isLoadingTaggedItems && activeTab !== "All" ? (
              <div className="flex items-center justify-center">
                <ColorRing
                  height="80"
                  width="80"
                  radius="9"
                  color="#05431E"
                  ariaLabel="three-dots-loading"
                  visible={true}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                {displayedItems?.length > 0 ? (
                  displayedItems.map((item: MenuItem) => (
                    <div
                      key={item.id}
                      className={`p-2 sm:p-3 rounded-lg ${generateDarkColorFromId(item.id)} text-white transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:brightness-110`}
                    >
                      <div className="flex flex-col space-y-1">
                        <h3 className="text-xs sm:text-sm font-semibold truncate">{item.name}</h3>
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
                  ))
                ) : (
                  <p className="text-gray-600">No items available for this tag or search.</p>
                )}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg h-[80vh] sm:h-[70vh] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-3">
                {Object.entries(order).map(([id, { quantity, price, name }]: [string, any], index) => (
                  <div
                    key={id}
                    className="rounded-lg flex p-2 justify-between items-center mb-2 last:mb-0 bg-[#FAFBFF]"
                  >
                    <div className="flex items-center flex-1">
                      <div className="bg-[#05431E] p-1 text-center text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs flex items-center justify-center">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <p className="ml-2 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[130px]">
                        {name} x{quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-[10px] sm:text-xs">₦{(price * quantity).toLocaleString()}</p>
                      <button
                        onClick={() => removeItem(id)}
                        className="text-red-500 hover:text-red-600"
                        aria-label={`Remove ${name} from order`}
                      >
                        <Trash size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-3 space-y-3">
                  <textarea
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    placeholder="Add special note (e.g., no onions, extra sauce)"
                    className="w-full p-2 rounded-lg bg-[#FAFBFF] text-[10px] sm:text-xs border border-gray-200 focus:outline-none focus:border-[#05431E]"
                    rows={3}
                  />
                  <div className="flex flex-col">
                    <label htmlFor="discount" className="text-xs sm:text-sm text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      id="discount"
                      value={discountPercentage}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= 100) {
                          setDiscountPercentage(value);
                        }
                      }}
                      placeholder="Enter discount percentage (0-100)"
                      className="w-full p-2 rounded-lg bg-[#FAFBFF] text-[10px] sm:text-xs border border-gray-200 focus:outline-none focus:border-[#05431E]"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
              {Object.keys(order).length > 0 && (
                <PreReceipt
                  order={order}
                  subdomain={subdomain}
                  tableNumber={tableNumber}
                  specialNote={specialNote}
                  discountPercentage={discountPercentage}
                />
              )}
              <div className="bg-[#FAFBFF] p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between">
                  <p className="text-xs sm:text-sm">Subtotal</p>
                  <p className="text-xs sm:text-sm">₦{subtotal.toLocaleString()}</p>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between mt-2">
                    <p className="text-xs sm:text-sm">Discount ({discountPercentage}%)</p>
                    <p className="text-xs sm:text-sm">₦{discountAmount.toLocaleString()}</p>
                  </div>
                )}
                <div className="flex justify-between mt-2">
                  <p className="text-xs sm:text-sm">VAT (7.5%)</p>
                  <p className="text-xs sm:text-sm">₦{vatTax.toLocaleString()}</p>
                </div>
                {subdomain !== "355" && (
                  <div className="flex justify-between mt-2">
                    <p className="text-xs sm:text-sm">Service Fee (10%)</p>
                    <p className="text-xs sm:text-sm">₦{serviceFee.toLocaleString()}</p>
                  </div>
                )}
                <div className="mt-3 mb-3 border-t border-[#05431E] border-t-[0.5px] border-dashed" />
                <div className="flex justify-between">
                  <p className="text-xs sm:text-sm font-semibold">Total</p>
                  <p className="text-xs sm:text-sm font-semibold">₦{total.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex my-4 sm:my-5 flex-col sm:flex-row justify-between gap-2">
                <Button
                  onClick={() => sendOrderToKitchen()}
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
                      <Send size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> {getButtonText()}
                    </>
                  )}
                </Button>
              </div>
            </div>
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
                    subtotal={`₦${createdOrder.subtotal.toLocaleString()}`}
                    discountAmount={createdOrder.discountAmount ? `₦${createdOrder.discountAmount.toLocaleString()}` : undefined}
                    vatTax={`₦${createdOrder.vatTax.toLocaleString()}`}
                    serviceFee={subdomain !== "355" ? `₦${createdOrder.serviceFee.toLocaleString()}` : undefined}
                    total={`₦${createdOrder.total.toLocaleString()}`}
                    status={createdOrder.status}
                    subdomain={subdomain}
                    id={createdOrder.id}
                    specialNote={createdOrder.specialNote}
                    paymentType={createdOrder.paymentType}
                    discountPercentage={createdOrder.discountPercentage}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {receipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100]">
            <div className="bg-white p-4 rounded-lg w-full max-w-[90%] sm:max-w-[400px]">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Receipt</h2>
              <p className="text-[10px] sm:text-xs text-gray-600 mb-2">{receipt.date}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 mb-2">{receipt.table}</p>
              {receipt.specialNote && (
                <p className="text-[10px] sm:text-xs text-gray-600 mb-2">Note: {receipt.specialNote}</p>
              )}
              {receipt.discountPercentage > 0 && (
                <p className="text-[10px] sm:text-xs text-gray-600 mb-2">Discount: {receipt.discountPercentage}%</p>
              )}
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
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-[10px] sm:text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>₦{receipt.subtotal.toLocaleString()}</span>
                </div>
                {receipt.discountPercentage > 0 && (
                  <div className="flex justify-between text-[10px] sm:text-sm text-gray-700 mt-1">
                    <span>Discount ({receipt.discountPercentage}%)</span>
                    <span>₦{receipt.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] sm:text-sm text-gray-700 mt-1">
                  <span>VAT (7.5%)</span>
                  <span>₦{receipt.vatTax.toLocaleString()}</span>
                </div>
                {subdomain !== "355" && (
                  <div className="flex justify-between text-[10px] sm:text-sm text-gray-700 mt-1">
                    <span>Service Fee (10%)</span>
                    <span>₦{receipt.serviceFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] sm:text-sm font-semibold text-gray-800 mt-1">
                  <span>Total</span>
                  <span>₦{receipt.total.toLocaleString()}</span>
                </div>
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

      {/* Floating Action Buttons for Tagged Items (Only in "All" tab) */}
      {activeTab === "All" && orderTags.length > 0 && Object.keys(order).length > 0 && (
        <div
          ref={dragRef}
          className={`fixed z-50 sm:max-w-md max-h-[85vh] overflow-y-auto transition-transform ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${
            dragPosition.x === 0 && dragPosition.y === 0 
              ? 'bottom-0 left-0 right-0 sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto' 
              : ''
          }`}
          style={
            dragPosition.x !== 0 || dragPosition.y !== 0
              ? {
                  left: `${dragPosition.x}px`,
                  top: `${dragPosition.y}px`,
                  right: 'auto',
                  bottom: 'auto',
                  width: 'calc(100% - 2rem)',
                  maxWidth: '28rem',
                }
              : {}
          }
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-t-3xl sm:rounded-3xl shadow-2xl">
            <div className="p-4 sm:p-5">
              {/* Drag Handle */}
              <div
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                className={`flex items-center gap-2 mb-3 sm:mb-4 select-none transition-all ${
                  isDragging 
                    ? 'cursor-grabbing opacity-75' 
                    : 'cursor-grab hover:bg-gray-50 rounded-lg p-2 -m-2'
                }`}
              >
                <GripVertical className={`w-5 h-5 transition-colors ${isDragging ? 'text-[#05431E]' : 'text-gray-400 hover:text-[#05431E]'}`} />
                <div className="w-1 h-5 bg-gradient-to-b from-[#05431E] to-[#0E5D37] rounded-full"></div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex-1">
                  Quick Send
                </h3>
                <span className="text-[10px] text-gray-400 hidden sm:inline">Drag to move</span>
              </div>
              
              {/* Summary Section */}
              <div className="mb-4 space-y-2.5 max-h-[200px] sm:max-h-[250px] overflow-y-auto pr-1">
                {orderTags.map((tag) => {
                  const tagColor = getTagColor(tag);
                  const items = itemsDetailsByTag[tag] || [];
                  // Get border color class based on tag color
                  const borderColorClass = tagColor.from.includes('orange') ? 'border-l-orange-500' :
                    tagColor.from.includes('blue') && !tagColor.from.includes('indigo') ? 'border-l-blue-500' :
                    tagColor.from.includes('purple') ? 'border-l-purple-500' :
                    tagColor.from.includes('green') ? 'border-l-green-500' :
                    tagColor.from.includes('indigo') ? 'border-l-indigo-500' :
                    tagColor.from.includes('amber') ? 'border-l-amber-500' :
                    tagColor.from.includes('rose') ? 'border-l-rose-500' :
                    'border-l-teal-500';
                  
                  return (
                    <div
                      key={tag}
                      className={`bg-gradient-to-r ${tagColor.from}/10 ${tagColor.to}/10 border-l-4 ${borderColorClass} rounded-lg p-2.5 sm:p-3`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs sm:text-sm font-semibold bg-gradient-to-r ${tagColor.from} ${tagColor.to} bg-clip-text text-transparent`}>
                          {tag}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-600">
                          {itemsByTag[tag]} {itemsByTag[tag] === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[10px] sm:text-xs text-gray-700">
                            <span className="truncate flex-1">{item.name}</span>
                            <span className="ml-2 font-medium text-gray-900">x{item.quantity}</span>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="text-[10px] sm:text-xs text-gray-500 italic">
                            +{items.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {orderTags.map((tag) => {
                  const tagColor = getTagColor(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => sendOrderToKitchen(tag)}
                      disabled={isCreating}
                      className={`flex-1 sm:flex-none px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r ${tagColor.from} ${tagColor.to} ${tagColor.hover} disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 disabled:scale-100 disabled:opacity-60 transform`}
                    >
                      <Send size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="font-medium">Send to {tag}</span>
                      {itemsByTag[tag] && (
                        <span className="bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-sm">
                          {itemsByTag[tag]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
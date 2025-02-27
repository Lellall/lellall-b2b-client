import { StyledButton } from "@/components/button/button-lellall"
import { useNavigate } from "react-router-dom"
import SearchBar from "@/components/search-bar/search-bar"
import { theme } from "@/theme/theme"
import { Add, ArrowRight, DocumentUpload, Edit, ArrowRight3, Filter, Setting2 } from "iconsax-react"
import pizza from "@/assets/pizza.svg"
import burger from "@/assets/burger.svg"
import bakery from "@/assets/bakery.svg"
import chicken from "@/assets/chicken.svg"
import sea from "@/assets/sea.svg"
import drinks from "@/assets/drinks.svg"
import { useState } from "react"
import Modal from "@/components/modal/modal"
import ConfigureMenu from "./configure-menu"
import { useGetMenuCategoriesQuery, useLazyGetMenuCategoryQuery } from "@/redux/api/menu/menu.api"
import { useCreateOrderMutation } from "@/redux/api/orders/order.api"
import { toast } from "react-toastify"

const menus = [
  { name: "Pizza", icon: pizza, count: 30 },
  { name: "Burger", icon: burger, count: 20 },
  { name: "Chicken", icon: chicken, count: 15 },
  { name: "Bakery", icon: bakery, count: 10 },
  { name: "Beverages", icon: drinks, count: 50 },
  { name: "Sea Foods", icon: sea, count: 40 },
]

const transformCountersToOrderPayload = (counters: Record<string, CounterItem>) => {
  const items = Object.entries(counters).map(([itemId, { count }]) => ({
    menuItemId: itemId, // Use the item ID as menuItemId
    quantity: count, // Use the count as quantity
  }))

  return {
    status: "PENDING", // Default status
    items,
  }
}

interface MenuItem {
  id: number
  name: string
  price: number
}
interface CounterItem {
  count: number
  item: MenuItem
}

const Menu = () => {
  const [counters, setCounters] = useState<Record<number, CounterItem>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const { data, error, isLoading } = useGetMenuCategoriesQuery({})
  const [fetchMenuCategory, { data: category, error: menuItemError, isLoading: isLoadingMenuItems }] =
    useLazyGetMenuCategoryQuery()
  const [createOrder, { isLoading: isCreatingOrder, error: createOrderError }] = useCreateOrderMutation()
  const navigate = useNavigate()

  const handlePlaceOrder = async () => {
    const orderPayload = transformCountersToOrderPayload(counters)

    try {
      const response = await createOrder(orderPayload).unwrap() // Use the mutation
      console.log("Order placed successfully:", response)
      setCounters({})
      toast.success("Order placed successfully")
      navigate("/menu/orders")
    } catch (error) {
      console.error("Error placing order:", error)
    }
  }

  const handleCounterChange = (itemId: number, action: "increment" | "decrement") => {
    setCounters((prevCounters) => {
      const item = category?.items.find((i) => i.id === itemId) // Find the item by ID
      if (!item) return prevCounters

      const currentCount = (prevCounters[itemId] || {}).count || 0

      if (action === "increment") {
        return {
          ...prevCounters,
          [itemId]: {
            count: currentCount + 1,
            item: { id: item.id, name: item.name, price: item.price },
          },
        }
      } else if (action === "decrement" && currentCount > 0) {
        const newCount = currentCount - 1

        // If the count reaches zero, remove the item from the counters
        if (newCount === 0) {
          const updatedCounters = { ...prevCounters }
          delete updatedCounters[itemId]
          return updatedCounters
        }

        return {
          ...prevCounters,
          [itemId]: {
            count: newCount,
            item: { id: item.id, name: item.name, price: item.price },
          },
        }
      }
      return prevCounters
    })
  }

  const calculateTotals = () => {
    return Object.values(counters).reduce(
      (acc, { count, item }) => {
        const itemSubtotal = count * item.price
        return {
          subtotal: acc.subtotal + itemSubtotal,
          total: acc.total + itemSubtotal,
        }
      },
      { subtotal: 0, total: 0 }
    )
  }

  const { subtotal, total } = calculateTotals()

  return (
    <div>
      <div className="flex mt-5 justify-between">
        <div className="flex">
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
          <div className="ml-3">
            <StyledButton
              style={{ padding: "20px 15px", fontWeight: 300 }}
              background={"#fff"}
              color="#000"
              width="100px"
              variant="outline"
            >
              <Add size="32" color="#000" /> <Filter size="32" color="#000" /> Filters
            </StyledButton>
          </div>
        </div>
        <div className="flex">
          <div className="ml-3">
            <StyledButton
              style={{ padding: "19px 15px", fontWeight: 300 }}
              background={theme.colors.active}
              color={theme.colors.secondary}
              width="130px"
              variant="outline"
            >
              <DocumentUpload size="32" color="#fff" /> Upload Items
            </StyledButton>
          </div>
          <div className="ml-3">
            <StyledButton
              style={{ padding: "19px 15px", fontWeight: 300 }}
              background={"#fff"}
              color="#000"
              width="130px"
              variant="outline"
            >
              <Add size="32" color="#000" /> Add Menu
            </StyledButton>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-10">
        <div className=" w-full sm:w-1/2 ">
          <div className="flex w-[570px] justify-between">
            <StyledButton
              style={{ padding: "21px 15px", fontWeight: 300 }}
              background={"#fff"}
              color="#000"
              width="160px"
              variant="outline"
            >
              <Add size="32" color="#000" /> View all categories
            </StyledButton>
            <StyledButton
              onClick={() => setModalOpen(true)}
              style={{ padding: "21px 15px", fontWeight: 300 }}
              background={theme.colors.active}
              color={theme.colors.secondary}
              width="150px"
              variant="outline"
            >
              <Setting2 size="32" color="#fff" /> Configure Menu
            </StyledButton>
          </div>
          <div className="flex  flex-wrap gap-4 mt-5">
            {isLoading ? (
              <div className="w-full text-center p-4">Loading...</div>
            ) : error ? (
              <div className="w-full text-center p-4 text-red-600">Error loading items. Please try again.</div>
            ) : (
              data?.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 bg-white w-[130px] h-[130px] rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
                  onClick={() => fetchMenuCategory(item.id)}
                >
                  <div className="flex justify-between">
                    <div></div>
                    <div>
                      <img src={menus[index].icon} alt={item.name} />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex text-xs flex-col mt-4">
                      <div>{item.name}</div>
                      <div>{item.items.length}</div>
                    </div>
                    <div></div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-5 border-t border-gray-300 border-t-[0.5px]" />
          <div className="flex  flex-wrap gap-4 mt-5">
            <div className="flex w-[570px] justify-between">
              <StyledButton
                style={{ padding: "21px 15px", fontWeight: 300 }}
                background={"#fff"}
                color="#000"
                width="160px"
                variant="outline"
              >
                <ArrowRight3 size="32" color="#000" /> View all Items
              </StyledButton>
              <div className="flex justify-between">
                <StyledButton
                  style={{ padding: "21px 15px", fontWeight: 300, marginRight: "10px" }}
                  background={"#fff"}
                  color="#000"
                  width="160px"
                  variant="outline"
                >
                  <DocumentUpload size="32" color="#000" /> Import Items
                </StyledButton>
                <StyledButton
                  style={{ padding: "21px 15px", fontWeight: 300 }}
                  background={theme.colors.active}
                  color={theme.colors.secondary}
                  width="150px"
                  variant="outline"
                >
                  <Add size="32" color="#fff" /> Add New Item
                </StyledButton>
              </div>
            </div>
            {isLoadingMenuItems ? (
              <div className="w-full text-center p-4">Loading...</div>
            ) : menuItemError ? (
              <div className="w-full text-center p-4 text-red-600">Error loading items. Please try again.</div>
            ) : (
              category?.items?.map((item: MenuItem) => (
                <div
                  key={item.id}
                  className="p-4 relative bg-white w-[130px] h-[130px] rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
                >
                  <div className="flex justify-between">
                    <div></div>
                    <div className="flex text-xs justify-between text-[#979797]">
                      <div>Order</div>
                      <div className="mt-[0.5px] ml-2 mr-2">
                        <ArrowRight size="12" color="#979797" />
                      </div>
                      <div>Kitchen</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex text-xs flex-col mt-4">
                      <div>{item.name}</div>
                      <div></div>
                    </div>
                    <div></div>
                  </div>
                  <div>
                    <div key={item.id}>
                      <div className="flex justify-center mt-5 absolute bottom-2 text-[#979797]">
                        <div className="flex items-center">
                          <button
                            className="bg-red-900 p-1 text-center text-white rounded-full w-[23px] text-xs"
                            onClick={() => handleCounterChange(item.id, "decrement")}
                          >
                            -
                          </button>
                          <span className="mx-2">{counters[item.id]?.count || 0}</span>
                          <button
                            className="bg-gray-900 p-1 text-center text-white rounded-full w-[23px] text-xs"
                            onClick={() => handleCounterChange(item.id, "increment")}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="w-[400px]">
          <div className="bg-white relative p-6 rounded-lg">
            <div className="flex justify-between">
              <p className="text-xs font-semibold">Table 01</p>
              <Edit size="14" color={theme.colors.active} className="cursor-pointer" />
            </div>
            <div className="flex mt-3 justify-between">
              <p className="text-sm ">Watson Joyce</p>
            </div>
            <div className="  mt-3 ">
              {/* Order Summary Section */}
              <div className="mt-3">
                {Object.entries(counters).map(([itemId, { count, item }], index) => (
                  <div
                    key={itemId}
                    className="rounded-lg flex p-2 justify-between items-center mb-3 last:mb-0 bg-[#FAFBFF]"
                  >
                    <div className="flex">
                      <div className="bg-gray-900 p-1 text-center text-white rounded-full w-[31px] text-xs">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <p className="ml-4 mt-1 text-xs">
                          {item.name} X{count}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-xs mt-1">₦{(item.price * count).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 relative p-6 bg-[#FAFBFF] rounded-lg h-[600px]">
              <div className="flex justify-between">
                <p className="text-sm">Subtotal</p>
                <div>
                  <p className="text-sm">₦{subtotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex mt-3 justify-between">
                <p className="text-sm">Tax</p>
                <div>
                  <p className="text-sm">₦{100}</p>
                </div>
              </div>
              <div className="mt-5 mb-3 border-t border-green-800 border-t-[0.5px] border-dashed" />
              <div className="flex justify-between">
                <p className="text-sm">Total</p>
                <div>
                  <p className="text-sm">₦{(total + 100).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-center mt-5 absolute bottom-5 text-[#979797]">
                <StyledButton
                  background={theme.colors.active}
                  color={theme.colors.secondary}
                  width="300px"
                  variant="outline"
                  onClick={handlePlaceOrder}
                >
                  {isCreatingOrder ? "Sending to Kitchen..." : "Send To Kitchen"}
                </StyledButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} position={"right"}>
        <h2 className=" mb-2 font-semibold">Configure New Menu</h2>
        <ConfigureMenu />
      </Modal>
    </div>
  )
}

export default Menu;
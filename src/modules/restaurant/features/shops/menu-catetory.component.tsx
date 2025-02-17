import pizza from '@/assets/pizza.svg'
import burger from '@/assets/burger.svg'
import bakery from '@/assets/bakery.svg'
import chicken from '@/assets/chicken.svg'
import sea from '@/assets/sea.svg'
import drinks from '@/assets/drinks.svg'
import { StyledButton } from '@/components/button/button-lellall'
import { Add, Eye, More, Setting2 } from 'iconsax-react'
import { theme } from '@/theme/theme'
import Table from '@/components/ui/table'
import StatusDropdown from '@/components/ui/drop-down-btn'
import NavigationTabs, { Tab } from '@/components/ui/navigation-tab'

const MenuCategory = () => {
    const menus = [
        { name: "Pizza", icon: pizza, count: 30 },
        { name: "Burger", icon: burger, count: 20 },
        { name: "Chicken", icon: chicken, count: 15 },
        { name: "Bakery", icon: bakery, count: 10 },
        { name: "Beverages", icon: drinks, count: 50 },
        { name: "Sea Foods", icon: sea, count: 40 },
    ];

    const StatusTag = ({ status }: { status: string }) => {
        const statusColors: Record<string, string> = {
            "Available": "text-xs bg-green-100 text-green-700",
            "Out of stock": "text-xs bg-red-100 text-red-700",
        }

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
                {status}
            </span>
        );
    };

    const handleStatusChange = (status: string) => {
        console.log("Selected Status:", status);
    };

    const columns = [
        { key: "image", label: "Image", render: (row: any) => <img src={row.image} className='w-[40px] h-[40px] rounded' /> },
        { key: "name", label: "Name" },
        { key: "count", label: "Count" },
        { key: "price", label: "Price" },
        { key: "availability", label: "Availability", render: (row: any) => <StatusTag status={row.availability === true ? 'Available' : 'Out of stock'} /> },
        { key: "stock", label: "Stock" },
        { key: "category", label: "Category" }
    ];
    const data = [
        { image: "https://cdn.pixabay.com/photo/2017/09/02/21/01/salmon-2702922_960_720.jpg", name: "Chicken Parmesan", count: 30, price: "₦8,500", availability: true, stock: 50, category: "Italian" },
        { image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/food-1239241_960_720.jpg", name: "Beef Stroganoff", count: 25, price: "₦10,200", availability: false, stock: 35, category: "Russian" },
        { image: "https://cdn.pixabay.com/photo/2017/12/09/08/18/fried-rice-3002508_960_720.jpg", name: "Spaghetti Carbonara", count: 40, price: "₦7,000", availability: true, stock: 60, category: "Italian" },
        { image: "https://cdn.pixabay.com/photo/2016/03/27/22/17/pasta-1283492_960_720.jpg", name: "Grilled Salmon", count: 15, price: "₦12,500", availability: false, stock: 20, category: "Seafood" },
        { image: "https://cdn.pixabay.com/photo/2016/06/10/15/32/food-1445123_960_720.jpg", name: "Vegetable Stir Fry", count: 20, price: "₦5,800", availability: true, stock: 25, category: "Vegetarian" },
        { image: "https://cdn.pixabay.com/photo/2014/04/22/02/56/bbq-329524_960_720.jpg", name: "BBQ Ribs", count: 18, price: "₦14,000", availability: false, stock: 15, category: "BBQ" },
        { image: "https://cdn.pixabay.com/photo/2017/06/06/22/48/miso-soup-2377616_960_720.jpg", name: "Shrimp Scampi", count: 12, price: "₦13,700", availability: true, stock: 5, category: "Seafood" },
        { image: "https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_960_720.jpg", name: "Margherita Pizza", count: 35, price: "₦6,800", availability: false, stock: 40, category: "Italian" },
        { image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/rolls-1239395_960_720.jpg", name: "Buffalo Wings", count: 45, price: "₦6,500", availability: true, stock: 55, category: "American" },
        { image: "https://cdn.pixabay.com/photo/2016/04/16/23/10/food-1332435_960_720.jpg", name: "Lobster Roll", count: 10, price: "₦18,000", availability: true, stock: 3, category: "Seafood" },
        { image: "https://cdn.pixabay.com/photo/2016/03/27/19/20/food-1283157_960_720.jpg", name: "Eggplant Parmesan", count: 14, price: "₦9,200", availability: false, stock: 7, category: "Vegetarian" },
        { image: "https://cdn.pixabay.com/photo/2017/07/16/11/55/tuna-2501828_960_720.jpg", name: "Miso Soup", count: 31, price: "₦3,500", availability: true, stock: 30, category: "Japanese" }
    ];

    const statuses = ["Available", "Out of Stock"];
    const tabs: Tab[] = [
        { name: "Normal", active: true },
        { name: "Special Deals", active: false },
        { name: "New Year", active: false },
        { name: "Deserts & Drinks", active: false },
    ];
    return (
        <div>
            <div className='flex w-full justify-between'>
                <div className="text-lg font-bold text-green-900" >
                    Menu & Categories
                </div>
                <StyledButton onClick={() => { }} style={{ padding: '21px 15px', fontWeight: 300 }} background={theme.colors.active} color={theme.colors.secondary} width='150px' variant="outline">
                    <Setting2 size="32" color="#fff" /> Configure Menu
                </StyledButton>
            </div>
            <div className='flex  flex-wrap gap-4 mt-5'>
                {menus.map((item, index) => (
                    <div
                        key={index}
                        className="p-4 bg-white w-[130px] h-[130px] rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
                    >
                        <div className="flex justify-between">
                            <div></div>
                            <div>
                                <img src={item.icon} alt={item.name} />
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="flex text-xs flex-col mt-4">
                                <div>
                                    {item.name}
                                </div>
                                <div>
                                    {item.count}
                                </div>
                            </div>
                            <div></div>
                        </div>
                    </div>
                ))}

            </div>
            <div className="mt-10 mb-3 w-full flex justify-between">
                <div className="flex">
                <div>
                    <NavigationTabs tabs={tabs} width="470px" />
                </div>
                <div>
                    <StatusDropdown options={statuses} onSelect={handleStatusChange} initialStatus="Available" />
                </div>
                </div>
                <div>
                    <StyledButton onClick={() => { }} style={{ padding: '21px 15px', fontWeight: 300 }} background={theme.colors.active} color={theme.colors.secondary} width='150px' variant="outline">
                        <Add size="32" color="#fff" /> Add item
                    </StyledButton>
                </div>
            </div>
            <div className="mt-10">
                <Table columns={columns} data={data}
                    selectable
                    actions={(row) => (
                        <div className="flex items-center gap-2">
                            <button
                                className="text-blue-500 ml-2"
                            // onClick={() => handleViewInvoice(row.invoiceId)}
                            >
                                <More size="18" color={theme.colors.active} />
                            </button>
                        </div>
                    )}
                />
            </div>
        </div>
    )
}

export default MenuCategory
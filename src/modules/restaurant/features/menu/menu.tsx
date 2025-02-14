import { StyledButton } from '@/components/button/button-lellall';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/search-bar/search-bar';
import { theme } from '@/theme/theme';
import { Add, ArrowRight, DocumentUpload, Edit, ArrowRight3, Filter, Setting2 } from 'iconsax-react';
import pizza from '@/assets/pizza.svg'
import burger from '@/assets/burger.svg'
import bakery from '@/assets/bakery.svg'
import chicken from '@/assets/chicken.svg'
import sea from '@/assets/sea.svg'
import drinks from '@/assets/drinks.svg'
import { useState } from 'react';
import Modal from '@/components/modal/modal';
import ConfigureMenu from './configure-menu';

const Menu = () => {
    const [counters, setCounters] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const handleCounterChange = (itemName, action) => {
        setCounters(prevCounters => {
            const item = items.find(i => i.name === itemName);
            if (!item) return prevCounters;

            const currentCount = (prevCounters[itemName] || {}).count || 0;
            const price = item.price;

            if (action === 'increment') {
                return {
                    ...prevCounters,
                    [itemName]: { count: currentCount + 1, price: price }
                };
            } else if (action === 'decrement' && currentCount > 0) {
                return {
                    ...prevCounters,
                    [itemName]: { count: currentCount - 1, price: price }
                };
            }
            return prevCounters;
        });
    };
    const menus = [
        { name: "Pizza", icon: pizza, count: 30 },
        { name: "Burger", icon: burger, count: 20 },
        { name: "Chicken", icon: chicken, count: 15 },
        { name: "Bakery", icon: bakery, count: 10 },
        { name: "Beverages", icon: drinks, count: 50 },
        { name: "Sea Foods", icon: sea, count: 40 },
    ];
    const items = [
        { name: "Chicken Parmesan", count: 30, price: 25.99 },
        { name: "Beef Stroganoff", count: 25, price: 22.50 },
        { name: "Spaghetti Carbonara", count: 40, price: 18.75 },
        { name: "Grilled Salmon", count: 15, price: 28.40 },
        { name: "Vegetable Stir Fry", count: 20, price: 15.20 },
        { name: "BBQ Ribs", count: 18, price: 26.50 },
        { name: "Shrimp Scampi", count: 12, price: 29.90 },
        { name: "Margherita Pizza", count: 35, price: 17.95 },
        { name: "Buffalo Wings", count: 45, price: 13.75 },
        { name: "Lobster Roll", count: 10, price: 35.00 },
        { name: "Eggplant Parmesan", count: 14, price: 20.00 },
        { name: "Miso Soup", count: 31, price: 8.50 },
    ];
    console.log('====================================');
    console.log(counters);
    console.log('====================================');
    const calculateTotals = () => {
        return Object.values(counters).reduce((acc, { count, price }) => {
            const itemSubtotal = count * price;
            return {
                subtotal: acc.subtotal + itemSubtotal,
                total: acc.total + itemSubtotal
            };
        }, { subtotal: 0, total: 0 });
    };

    const { subtotal, total } = calculateTotals();

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
                    <div className='ml-3'>
                        <StyledButton style={{ padding: '20px 15px', fontWeight: 300 }} background={'#fff'} color="#000" width='100px' variant="outline">
                            <Add size="32" color="#000" />  <Filter size="32" color="#000" /> Filters
                        </StyledButton>
                    </div>
                </div>
                <div className="flex">
                    <div className='ml-3'>
                        <StyledButton style={{ padding: '19px 15px', fontWeight: 300 }} background={theme.colors.active} color={theme.colors.secondary} width='130px' variant="outline">
                            <DocumentUpload size="32" color="#fff" /> Upload Items
                        </StyledButton>
                    </div>
                    <div className='ml-3'>
                        <StyledButton style={{ padding: '19px 15px', fontWeight: 300 }} background={'#fff'} color="#000" width='130px' variant="outline">
                            <Add size="32" color="#000" /> Add Menu
                        </StyledButton>
                    </div>
                </div>
            </div>
            <div className="flex justify-between mt-10">
                <div className=' w-full sm:w-1/2 '>
                    <div className='flex w-[570px] justify-between'>
                        <StyledButton style={{ padding: '21px 15px', fontWeight: 300 }} background={'#fff'} color="#000" width='160px' variant="outline">
                            <Add size="32" color="#000" /> View all categories
                        </StyledButton>
                        <StyledButton onClick={() => setModalOpen(true)} style={{ padding: '21px 15px', fontWeight: 300 }} background={theme.colors.active} color={theme.colors.secondary} width='150px' variant="outline">
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
                    <div className="mt-5 border-t border-gray-300 border-t-[0.5px]" />
                    <div className='flex  flex-wrap gap-4 mt-5'>
                        <div className='flex w-[570px] justify-between'>
                            <StyledButton style={{ padding: '21px 15px', fontWeight: 300 }} background={'#fff'} color="#000" width='160px' variant="outline">
                                <ArrowRight3 size="32" color="#000" /> View all Items
                            </StyledButton>
                            <div className='flex justify-between'>
                                <StyledButton style={{ padding: '21px 15px', fontWeight: 300, marginRight: '10px' }} background={'#fff'} color="#000" width='160px' variant="outline">
                                    <DocumentUpload size="32" color="#000" /> Import Items
                                </StyledButton>
                                <StyledButton style={{ padding: '21px 15px', fontWeight: 300 }} background={theme.colors.active} color={theme.colors.secondary} width='150px' variant="outline">
                                    <Add size="32" color="#fff" /> Add New Item
                                </StyledButton>
                            </div>
                        </div>
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="p-4 relative bg-white w-[130px] h-[130px] rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
                            >
                                <div className="flex justify-between">
                                    <div></div>
                                    <div className='flex text-xs justify-between text-[#979797]'>
                                        <div>Order</div>
                                        <div className='mt-[0.5px] ml-2 mr-2'><ArrowRight size="12" color="#979797" /></div>
                                        <div>Kitchen</div>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex text-xs flex-col mt-4">
                                        <div>
                                            {item.name}
                                        </div>
                                        <div>
                                        </div>
                                    </div>
                                    <div>
                                    </div>
                                </div>
                                <div>
                                    <div key={item.name}>
                                        <div className="flex justify-center mt-5 absolute bottom-2 text-[#979797]">
                                            <div className="flex items-center">
                                                <button className='bg-red-900 p-1 text-center text-white rounded-full w-[23px] text-xs' onClick={() => handleCounterChange(item.name, 'decrement')}>-</button>
                                                <span className="mx-2">
                                                    {counters[item.name] ? counters[item.name].count : 0}
                                                </span>
                                                <button className='bg-gray-900 p-1 text-center text-white rounded-full w-[23px] text-xs' onClick={() => handleCounterChange(item.name, 'increment')}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
                <div className='w-[400px]'>
                    <div className="bg-white relative p-6 rounded-lg">
                        <div className="flex justify-between">
                            <p className='text-xs font-semibold'>
                                Table 01
                            </p>
                            <Edit size="14" color={theme.colors.active} className='cursor-pointer' />
                        </div>
                        <div className="flex mt-3 justify-between">
                            <p className='text-sm '>
                                Watson Joyce
                            </p>
                        </div>
                        <div className="  mt-3 ">
                            {Object.entries(counters).map(([itemName, { count, price }], index) => (
                                <div
                                    key={itemName}
                                    className="rounded-lg flex p-2 justify-between items-center mb-3 last:mb-0 bg-[#FAFBFF]"
                                >
                                    <div className="flex">
                                        <div className="bg-gray-900 p-1 text-center text-white rounded-full w-[31px] text-xs">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>
                                        <div>
                                            <p className="ml-4 mt-1 text-xs">
                                                {itemName} X{count}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex text-xs mt-1">
                                        ₦{(price * count).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 relative p-6 bg-[#FAFBFF] rounded-lg h-[600px]">
                            <div className="flex justify-between">
                                <p className='text-sm'>
                                    Subtotal
                                </p>
                                <div>
                                    <p className='text-sm'>
                                        ₦{subtotal.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex mt-3 justify-between">
                                <p className='text-sm'>
                                    Tax
                                </p>
                                <div>
                                    <p className='text-sm'>
                                        ₦{100}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 mb-3 border-t border-green-800 border-t-[0.5px] border-dashed" />
                            <div className="flex justify-between">
                                <p className='text-sm'>
                                    Total
                                </p>
                                <div>
                                    <p className='text-sm'>
                                        ₦{(total + 100).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-center mt-5 absolute bottom-5 text-[#979797]">
                                <StyledButton background={theme.colors.active} color={theme.colors.secondary} width='300px' variant="outline" onClick={() => navigate('/menu/orders')}>Send To Kitchen</StyledButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} position={'right'}>
                <h2 className=" mb-2 font-semibold">Configure New Menu</h2>
                <ConfigureMenu />
            </Modal>
        </div>
    )
}

export default Menu;
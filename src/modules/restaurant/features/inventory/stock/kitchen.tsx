import { StyledButton } from '@/components/button/button-lellall';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/search-bar/search-bar';
import { theme } from '@/theme/theme';
import { Add, ArrowRight, DocumentUpload, Edit, ArrowRight3, Filter, Setting2 } from 'iconsax-react';
import { useState } from 'react';
import Modal from '@/components/modal/modal';
import { useGetAllMenuItemsQuery, useGetMenusQuery } from '@/redux/api/menu/menu.api';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { ColorRing } from 'react-loader-spinner';

import Orders from '../../menu/order';
import MenuItemForm from '../../menu/components/add-items';
import { CreateMenuForm } from '../../menu/components/create-menu';

const Kitchen = () => {
    const [counters, setCounters] = useState({});
    const [menuModal, setMenuModal] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const { subdomain } = useSelector(selectAuth);
    const { data: menus, error: menusError, isLoading: isMenusLoading } = useGetMenusQuery({ subdomain });
    const { data: items, error: itemsError, isLoading: isItemsLoading } = useGetAllMenuItemsQuery({ subdomain });

    const generateColorFromId = (id) => {
        if (!id) return 'bg-gray-200';
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colors = [
            'bg-blue-400',
            'bg-green-400',
            'bg-purple-400',
            'bg-red-400',
            'bg-yellow-400',
            'bg-indigo-400',
        ];
        return colors[hash % colors.length];
    };

    const calculateTotals = () => {
        return Object.values(counters).reduce((acc, { count, price }) => {
            const itemSubtotal = count * price;
            return {
                subtotal: acc.subtotal + itemSubtotal,
                total: acc.total + itemSubtotal
            };
        }, { subtotal: 0, total: 0 });
    };

    const generateDarkColorFromId = (id) => {
        if (!id) return 'bg-gray-700';
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const darkColors = [
            'bg-blue-700',
            'bg-green-700',
            'bg-purple-700',
            'bg-red-700',
            'bg-yellow-700',
            'bg-indigo-700',
        ];
        return darkColors[hash % darkColors.length];
    };

    const { subtotal, total } = calculateTotals();

    // Show loader if either menus or items are loading
    if (isMenusLoading || isItemsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <ColorRing
                    height="80"
                    width="80"
                    radius="9"
                    color={theme.colors.active}
                    ariaLabel="three-dots-loading"
                    visible={true}
                />
            </div>
        );
    }

    // Show error state if queries fail
    if (menusError || itemsError) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                Error loading data: {menusError?.message || itemsError?.message}
            </div>
        );
    }

    // Main render including empty state and modals
    return (
        <div>
            {(!menus || menus.length === 0) && (!items || items.length === 0) ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full space-y-8 text-center">
                        {/* Decorative Element */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-[${theme.colors.active}] opacity-10 rounded-full w-32 h-32 mx-auto blur-xl"></div>
                            <div className="bg-white p-6 rounded-full inline-block relative z-10 shadow-md">
                                <Add size="48" color={theme.colors.active} className="opacity-70" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold text-gray-900">Kitchen is Empty</h1>
                            <p className="text-gray-600">
                                It looks like there are no menus or items yet. Get started by adding your first menu or item!
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <StyledButton
                                onClick={() => setMenuModal(true)}
                                background={theme.colors.active}
                                color={theme.colors.secondary}
                                width="200px"
                                style={{ padding: '12px 24px' }}
                                variant="solid"
                                className="inline-flex items-center justify-center"
                            >
                                <Setting2 size="20" className="mr-2" />
                                Add New Menu
                            </StyledButton>
                            <StyledButton
                                onClick={() => setModalOpen(true)}
                                background="transparent"
                                color={theme.colors.active}
                                width="200px"
                                style={{ padding: '12px 24px' }}
                                variant="outline"
                                className="inline-flex items-center justify-center"
                            >
                                <Add size="20" className="mr-2" />
                                Add New Item
                            </StyledButton>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between mt-5">
                    <div className="w-full">
                        <div className="flex justify-between">
                            <div className="text-xl">
                                Menus
                            </div>
                            <StyledButton onClick={() => setMenuModal(true)} style={{ padding: '21px 15px', fontWeight: 300 }} background={theme.colors.active} color={theme.colors.secondary} width="150px" variant="outline">
                                <Setting2 size="32" color="#fff" /> Add New Menu
                            </StyledButton>
                        </div>
                        <div className="flex justify-between mt-5">
                            <div className="w-full flex gap-2 flex-wrap">
                                {menus?.map((menu, index) => (
                                    <div
                                        key={menu?.id}
                                        className="px-4 py-3 bg-white w-[150px] h-[100px] rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 active:bg-gray-100 cursor-pointer border border-gray-100"
                                    >
                                        <div className="flex flex-col h-full justify-between">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 font-medium">
                                                    S/N: {index + 1}
                                                </span>
                                                <div
                                                    className={`w-4 h-4 rounded-full ${generateColorFromId(menu?.id)} transform transition-transform duration-200 hover:scale-110`}
                                                />
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <div className="flex flex-col space-y-1">
                                                    <h3 className="font-semibold text-sm text-gray-900 truncate max-w-[100px] hover:tooltip" title={menu?.name}>
                                                        {menu?.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 font-medium">
                                                        {menu?.menuItemCount ?? 0} {menu?.menuItemCount === 1 ? 'item' : 'items'}
                                                    </p>
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded">
                                                    #{menu?.id.slice(0, 4)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-10 mb-10 border-t border-gray-300 border-t-[0.5px]" />
                        <div className="w-full">
                            <div className="flex flex-wrap gap-4 my-2">
                                <div className="flex justify-between w-full">
                                    <div className="text-xl">Items</div>
                                    <div className="flex justify-between">
                                        <StyledButton
                                            onClick={() => setModalOpen(true)}
                                            style={{ padding: '21px 15px', fontWeight: 300 }}
                                            background={theme.colors.active}
                                            color={theme.colors.secondary}
                                            width="150px"
                                            variant="outline"
                                        >
                                            <Add size="32" color="#fff" /> Add New Item
                                        </StyledButton>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex gap-4 flex-wrap my-2">
                                {items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`px-5 py-4 w-[170px] h-[120px] rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:brightness-110 active:brightness-90 cursor-pointer relative ${generateDarkColorFromId(item.id)} bg-texture`}
                                    >
                                        <div className="flex flex-col h-full justify-between">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-sm text-white drop-shadow-md leading-tight flex-1 pr-2">
                                                    {item.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-medium text-white drop-shadow-md">
                                                    ₦{item.price.toLocaleString()}
                                                </p>
                                                <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-90 text-gray-800">
                                                    #{item.id.slice(0, 4)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-50 scale-x-0 origin-left transition-transform duration-300 hover:scale-x-100" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-10 mb-10 border-t border-gray-300 border-t-[0.5px]" />
                    </div>
                </div>
            )}

            {/* Modals are always rendered, controlled by state */}
            <Modal isOpen={menuModal} onClose={() => setMenuModal(false)}>
                <CreateMenuForm setMenuModal={setMenuModal} subdomain={subdomain} onSuccess={() => setMenuModal(false)} />
            </Modal>
            <Modal variant="wizard" width="800px" isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <MenuItemForm
                    subdomain={subdomain}
                    setModalOpen={setModalOpen}
                />
            </Modal>
        </div>
    );
};

export default Kitchen;
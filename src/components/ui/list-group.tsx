import React, { useState } from "react";
import styled from "styled-components";
import { SearchNormal } from "iconsax-react";
import { IoIosCheckmark } from "react-icons/io";
import { IoTrashOutline } from "react-icons/io5";

type Item = {
    name: string;
    quantity?: string;
};

type ListCardProps = {
    title: string;
    items: Item[];
    showSearch?: boolean;
    showDelete?: boolean;
    headerBgColor?: string;
    onDelete?: (name: string) => void;
};

const ListCard: React.FC<ListCardProps> = ({
    title,
    items,
    showSearch = false,
    showDelete = false,
    headerBgColor = "bg-green-900",
    onDelete,
}) => {
    const [search, setSearch] = useState<string>("");
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleItem = (name: string) => {
        setSelectedItems((prev) =>
            prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
        );
    };

    const toggleAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map((item) => item.name));
        }
    };

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white rounded-lg w-[500px]">
            <div className={`text-white p-4 rounded-t-lg ${headerBgColor}`}>
                {title}
            </div>
            {showSearch && (
                <div className="p-2 border-b flex items-center gap-2">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Search Items"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full outline-none p-2 text-sm font-light"
                    />
                </div>
            )}
            <div className="divide-y max-h-60 overflow-y-auto">
                {!showDelete && (
                    <div className="p-3 flex items-center gap-3 cursor-pointer" onClick={toggleAll}>
                        <Checkbox checked={selectedItems.length === items.length} />
                        <span>All Items</span>
                    </div>
                )}
                {filteredItems.map((item) => (
                    <div key={item.name} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 font-light">
                            {showDelete ? (
                                <DeleteIcon onClick={() => onDelete?.(item.name)} />
                            ) : (
                                <Checkbox
                                    checked={selectedItems.includes(item.name)}
                                    onClick={() => toggleItem(item.name)}
                                />
                            )}
                            <span>{item.name}</span>
                        </div>
                        {item.quantity && <span className="text-gray-500 text-sm">{item.quantity}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

type CheckboxProps = {
    checked: boolean;
    onClick?: () => void;
};

const Checkbox: React.FC<CheckboxProps> = ({ checked, onClick }) => (
    <div
        className={`w-5 h-5 flex items-center justify-center border rounded cursor-pointer ${checked ? "bg-green-600 border-green-600" : "border-gray-400"
            }`}
        onClick={onClick}
    >
        {checked && <IoIosCheckmark className="text-white" />}
    </div>
);

type DeleteIconProps = {
    onClick: () => void;
};

const DeleteIcon: React.FC<DeleteIconProps> = ({ onClick }) => (
    <div className="w-5 h-5 flex items-center justify-center text-red-600 cursor-pointer" onClick={onClick}>
        <IoTrashOutline />
    </div>
);

const SearchIcon = styled(SearchNormal)`
  color: gray;
  width: 18px;
  height: 18px;
`;

export default ListCard;

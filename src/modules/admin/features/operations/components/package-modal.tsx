import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Input from "@/components/input/input";
import { StyledButton } from "@/components/button/button-lellall";
import { Save2, SaveAdd } from "iconsax-react";
import { theme } from "@/theme/theme";

const packageColors = ["bg-purple-600", "bg-green-900", "bg-orange-600", "bg-yellow-500", "bg-red-600", "bg-gray-900", "bg-blue-500"];

interface PackageSheetProps {
    open: boolean;
    onClose: () => void;
}

const PackageSheet: React.FC<PackageSheetProps> = ({ open, onClose }) => {
    const [selectedColor, setSelectedColor] = useState("bg-purple-600");
    const [features, setFeatures] = useState({
        menus: true,
        inventory: true,
        reports: false,
        reservations: false,
    });

    const toggleFeature = (key: keyof typeof features) => {
        setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right" className="w-[400px] bg-white scroll-y">
                <SheetHeader>
                    <SheetTitle>Packages</SheetTitle>
                </SheetHeader>

                {/* Package Name */}
                <div className="mt-4">
                    <Input name='Package' width='350px' label="Package Name" placeholder="Package name" type="text" />
                </div>

                {/* Monthly Bill */}
                <div className="mt-4">
                    <Input name='price' width='350px' label="Monthly Bill" placeholder="Package price" type="text" />
                </div>

                {/* Annual Discount */}
                <div className="mt-4">
                    <Input name='price' width='350px' label="Annual Discount" placeholder="Annual discount e.g 10%" type="text" />

                </div>

                {/* Package Label (Color Picker) */}
                <div className="mt-4">
                    <label className="text-sm font-medium">Package Label</label>
                    <div className="flex items-center gap-2 mt-2">
                        {packageColors.map((color) => (
                            <div
                                key={color}
                                className={`w-7 h-7 rounded-md cursor-pointer border-2 ${selectedColor === color ? "border-black" : "border-transparent"
                                    } ${color}`}
                                onClick={() => setSelectedColor(color)}
                            />
                        ))}
                    </div>
                </div>

                {/* Package Features */}
                <div className="mt-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 bg-green-800 text-white focus:ring-green-800 checked:bg-green-800 checked:border-green-800"
                        />
                        <span className="text-sm font-medium">Package Features</span>
                    </div>

                    <div className="ml-6 mt-2 flex flex-col gap-2">
                        {Object.entries(features).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={() => toggleFeature(key as keyof typeof features)}
                                    className="w-4 h-4 rounded border-gray-300 bg-green-800 text-white focus:ring-green-800 checked:bg-green-800 checked:border-green-800"
                                />
                                <span className="text-sm">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Description */}
                <div className="mt-6">
                    <Input name='description' width='350px' label="Description (Optional)" placeholder="Description " type="address" />

                </div>
                <div className="mt-6 mb-6">
                    <StyledButton style={{ padding: '19px 15px', fontWeight: 300 }} background={theme.colors.active} color="#fff" width='300px' variant="outline">
                        Save Package
                    </StyledButton>
                </div>
                <div className="mt-6">.</div>
            </SheetContent>
        </Sheet>
    );
};

export default PackageSheet;

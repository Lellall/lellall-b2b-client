// src/components/TemplateList.tsx
import React, { useState } from 'react';
import { useGetSupplyRequestTemplatesQuery } from '@/redux/api/inventory/inventory.api';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { ColorRing } from 'react-loader-spinner';
import TemplateSupplyRequestWizard from './supply-request-form-template';

interface InventoryItem {
    productName: string;
    closingStock: number;
    unitOfMeasurement: string;
}

interface TemplateListProps {
    inventory: InventoryItem[];
}

const TemplateList: React.FC<TemplateListProps> = ({ inventory }) => {
    const { subdomain } = useSelector(selectAuth);
    const { data: templates, isLoading } = useGetSupplyRequestTemplatesQuery({ subdomain });
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);

    const handleTemplateClick = (templateId: string) => {
        setSelectedTemplateId(templateId);
        setModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <ColorRing
                    height="80"
                    width="80"
                    radius="9"
                    colors={['#1F8B4C', '#2ECC71', '#27AE60', '#219653', '#1F8B4C']}
                    visible={true}
                />
            </div>
        );
    }

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Supply Request Templates</h2>
            {templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template: any) => (
                        <div
                            key={template.id}
                            className="bg-white p-6 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-50 active:scale-[0.98]"
                            onClick={() => handleTemplateClick(template.id)}
                        >
                            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">Items: {template.supplies.length}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Created: {new Date(template.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 text-center text-base">No templates available.</p>
            )}
            <TemplateSupplyRequestWizard
                isModalOpen={isModalOpen}
                setModalOpen={setModalOpen}
                templateId={selectedTemplateId}
                inventory={inventory}
            />
        </div>
    );
};

export default TemplateList;
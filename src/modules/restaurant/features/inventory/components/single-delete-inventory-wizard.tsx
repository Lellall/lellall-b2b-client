import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
import { useDeleteInventoryItemMutation } from "@/redux/api/inventory/inventory.api";
import { toast } from "react-toastify";
import Modal from "@/components/modal/modal";
import { Button } from "@/components/ui/button";
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { AlertTriangle } from 'lucide-react';


interface SingleDeleteInventoryWizardProps {
    isModalOpen: boolean;
    setModalOpen: (open: boolean) => void;
    item: { id: string; productName: string } | null;
    onDeleteSuccess: (id: string) => void;
}

const SingleDeleteInventoryWizard = ({
    isModalOpen,
    setModalOpen,
    item,
    onDeleteSuccess,
}: SingleDeleteInventoryWizardProps) => {
    const { subdomain } = useSelector(selectAuth);
    const [deleteInventoryItem, { isLoading }] = useDeleteInventoryItemMutation();

    const handleDelete = async () => {
        if (!item) {
            toast.error("No item selected.");
            return;
        }

        try {
            await deleteInventoryItem({ subdomain, inventoryId: item.id }).unwrap();
            onDeleteSuccess(item.id);
            toast.success(`Successfully deleted ${item.productName}`);
            setModalOpen(false);
        } catch (error: any) {
            console.error("Single delete failed:", error);
            // Extract error message from RTK Query error response
            // RTK Query errors can have different structures:
            // - error.data.message (direct API response)
            // - error.error.data.message (nested error)
            // - error.error.message (baseApi error format)
            const errorMessage = 
                error?.data?.message || 
                error?.error?.data?.message || 
                error?.error?.message ||
                error?.message || 
                `Failed to delete ${item?.productName || "item"}. Please try again.`;
            
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 6000, // Show for 6 seconds since the message might be long
            });
        }
    };

    return (
        <Modal 
            isOpen={isModalOpen} 
            onClose={() => !isLoading && setModalOpen(false)} 
            position="center" 
            className="w-11/12 sm:w-96"
        >
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-red-100">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-lg font-semibold">Confirm Deletion</h2>
                </div>
                <div className="mb-6">
                    {item ? (
                        <div className="space-y-2">
                            <p className="text-gray-600 text-sm">
                                Are you sure you want to delete <strong className="text-gray-900">{item.productName}</strong>?
                            </p>
                            <p className="text-red-600 text-xs font-medium">
                                This action cannot be undone.
                            </p>
                        </div>
                    ) : (
                        <p className="text-red-500 text-sm">No item selected.</p>
                    )}
                </div>
                <div className="flex justify-end gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => setModalOpen(false)} 
                        className="text-sm"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm flex items-center gap-2"
                        disabled={isLoading || !item}
                    >
                        {isLoading ? (
                            <>
                                <ColorRing
                                    height="16"
                                    width="16"
                                    radius="9"
                                    color="#ffffff"
                                    ariaLabel="loading"
                                    visible={true}
                                />
                                Deleting...
                            </>
                        ) : (
                            "Delete Item"
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SingleDeleteInventoryWizard;
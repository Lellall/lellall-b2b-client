import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
import { useDeleteInventoryItemMutation } from "@/redux/api/inventory/inventory.api";
import { toast } from "react-toastify";
import Modal from "@/components/modal/modal";
import styled from 'styled-components'

import { Button } from "@/components/ui/button";

export const ModalContent = styled.div<{
    position: ModalProps["position"];
    open: boolean;
    width?: string;
    variant?: ModalProps["variant"];
}>`
  background: white;
  border-radius: 16px;
  position: absolute;
  transition: all 0.3s ease;
  overflow-y: auto;

  /* Base padding */
  padding: ${({ variant }) => (variant === "wizard" ? "2rem" : "1.5rem")};

  /* Width handling */
  ${({ width, variant }) => `
    width: ${width || (variant === "wizard" ? "100%" : "auto")};
    max-width: ${width ? "none" : (variant === "wizard" ? "64rem" : "32rem")};
  `}

  /* Position-specific styles */
  ${(props) =>
        props.open &&
        props.position === "center" &&
        `
      transform: translate(-50%, -50%);
      top: 50%;
      left: 50%;
    `}

  ${(props) =>
        props.open &&
        props.position !== "center" &&
        `
      transform: translate(0, 0);
    `}

  ${(props) =>
        props.position === "left" &&
        `
      left: 0;
      top: 0;
      height: 100%;
      transform: translateX(${props.open ? "0" : "-100%"});
    `}

  ${(props) =>
        props.position === "right" &&
        `
      right: 0;
      top: 0;
      height: 100%;
      transform: translateX(${props.open ? "0" : "100%"});
    `}

  ${(props) =>
        props.position === "top" &&
        `
      top: 0;
      left: 0;
      right: 0;
      transform: translateY(${props.open ? "0" : "-100%"});
    `}

  ${(props) =>
        props.position === "bottom" &&
        `
      bottom: 0;
      left: 0;
      right: 0;
      transform: translateY(${props.open ? "0" : "100%"});
    `}
`;

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
        } catch (error) {
            console.error("Single delete failed:", error);
            toast.error(`Failed to delete ${item?.productName || "item"}. Please try again.`);
        }
    };

    return (
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} position="center" width="32rem">
            <ModalContent open={isModalOpen} position="center" width="32rem">
                <div className="text-lg font-semibold mb-4">Confirm Delete</div>
                <div>
                    {item ? (
                        <p>
                            Are you sure you want to delete <strong>{item.productName}</strong>?
                        </p>
                    ) : (
                        <p className="text-red-500">No item selected.</p>
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button color="danger" variant="light" onPress={() => setModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="danger" onPress={handleDelete} isDisabled={isLoading || !item}>
                        {isLoading ? "Deleting..." : "Delete Item"}
                    </Button>
                </div>
            </ModalContent>
        </Modal>
    );
};

export default SingleDeleteInventoryWizard;
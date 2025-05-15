import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
import { useBulkDeleteInventoryMutation } from "@/redux/api/inventory/inventory.api";
import { toast } from "react-toastify";
import Modal from "@/components/modal/modal";
import { Button } from "@/components/ui/button";
import styled from 'styled-components'


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

interface BulkDeleteInventoryWizardProps {
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  selectedItems: { id: string; productName: string }[];
}

const BulkDeleteInventoryWizard = ({
  isModalOpen,
  setModalOpen,
  selectedItems,
}: BulkDeleteInventoryWizardProps) => {
  const { subdomain } = useSelector(selectAuth);
  const [bulkDeleteInventory, { isLoading }] = useBulkDeleteInventoryMutation();

  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to delete.");
      return;
    }

    try {
      const data = { inventoryIds: selectedItems.map((item) => item.id) };
      await bulkDeleteInventory({ subdomain, data }).unwrap();
      toast.success("Items deleted successfully!");
      setModalOpen(false);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("Failed to delete items. Please try again.");
    }
  };

  return (
    <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} position="center" width="32rem">
      <ModalContent open={isModalOpen} position="center" width="32rem">
        <div className="text-lg font-semibold mb-4">Confirm Bulk Delete</div>
        <div>
          {selectedItems.length === 0 ? (
            <p className="text-red-500">Please select at least one item to delete.</p>
          ) : (
            <>
              <p>Are you sure you want to delete the following items?</p>
              <ul className="list-disc pl-5 mt-2">
                {selectedItems.map((item) => (
                  <li key={item.id} className="text-sm">{item.productName}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button color="danger" variant="light" onPress={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            isDisabled={isLoading || selectedItems.length === 0}
          >
            {isLoading ? "Deleting..." : "Delete Items"}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default BulkDeleteInventoryWizard;
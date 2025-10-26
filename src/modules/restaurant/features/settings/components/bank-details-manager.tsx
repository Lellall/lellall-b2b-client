import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Building2 } from "lucide-react";
import { useGetBankDetailsQuery, useCreateBankDetailsMutation, useUpdateBankDetailsMutation, useDeleteBankDetailsMutation, BankDetails, CreateBankDetailsRequest } from "@/redux/api/bank-details/bank-details.api";
import { toast } from "react-toastify";

interface BankDetailsManagerProps {
  restaurantId: string;
}

const BankDetailsManager = ({ restaurantId }: BankDetailsManagerProps) => {
  // Debug: Log restaurantId to see what's being passed
  console.log("BankDetailsManager - restaurantId:", restaurantId);
//   console.log("BankDetailsManager - restaurantId type:", typeof restaurantId);
//   console.log("BankDetailsManager - restaurantId length:", restaurantId?.length);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankDetails | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<BankDetails | null>(null);

  // Form state for adding new bank details
  const [newBankForm, setNewBankForm] = useState<CreateBankDetailsRequest>({
    bankName: "",
    accountNumber: "",
    accountName: "",
    restaurantId: restaurantId,
  });

  // Form state for editing bank details
  const [editBankForm, setEditBankForm] = useState({
    bankName: "",
    accountName: "",
  });

  // API hooks
  const { data: bankDetailsData, isLoading, error, refetch } = useGetBankDetailsQuery(restaurantId);
  const [createBankDetails, { isLoading: isCreating }] = useCreateBankDetailsMutation();
  const [updateBankDetails, { isLoading: isUpdating }] = useUpdateBankDetailsMutation();
  const [deleteBankDetails, { isLoading: isDeleting }] = useDeleteBankDetailsMutation();

  const bankDetails = bankDetailsData?.bankDetails || [];

  // Update restaurantId in form when prop changes
  useEffect(() => {
    setNewBankForm(prev => ({
      ...prev,
      restaurantId: restaurantId,
    }));
  }, [restaurantId]);

  // Handle form input changes
  const handleNewBankFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBankForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditBankFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditBankForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle add new bank details
  const handleAddBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createBankDetails({
        restaurantId,
        data: newBankForm,
      }).unwrap();
      
      // Manually refetch the data
      refetch();
      
      setIsAddModalOpen(false);
      setNewBankForm({
        bankName: "",
        accountNumber: "",
        accountName: "",
        restaurantId: restaurantId,
      });
    } catch (error) {
      console.error("Failed to create bank details:", error);
    }
  };

  // Handle edit bank details
  const handleEditBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) return;

    try {
      await updateBankDetails({
        bankDetailsId: selectedBank.id,
        data: editBankForm,
      }).unwrap();
      
      // Manually refetch the data
      refetch();
      
      setIsEditModalOpen(false);
      setSelectedBank(null);
      setEditBankForm({ bankName: "", accountName: "" });
    } catch (error) {
      console.error("Failed to update bank details:", error);
    }
  };

  // Handle delete bank details
  const handleDeleteBankDetails = async () => {
    if (!bankToDelete) return;

    try {
      await deleteBankDetails(bankToDelete.id).unwrap();
      
      // Manually refetch the data
      refetch();
      
      setIsDeleteModalOpen(false);
      setBankToDelete(null);
    } catch (error) {
      console.error("Failed to delete bank details:", error);
    }
  };

  // Open edit modal
  const openEditModal = (bank: BankDetails) => {
    setSelectedBank(bank);
    setEditBankForm({
      bankName: bank.bankName,
      accountName: bank.accountName,
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (bank: BankDetails) => {
    setBankToDelete(bank);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Failed to load bank details. Please try again.</p>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
          <p className="text-sm text-gray-600">Manage your restaurant's bank account information</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Account
        </button>
      </div>

      {/* Bank Details List */}
      {bankDetails.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bank Details</h3>
          <p className="text-gray-600 mb-4">Add your first bank account to get started</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
          >
            Add New Account
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {bankDetails.map((bank) => (
            <div key={bank.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Building2 className="w-5 h-5 text-green-800 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">{bank.bankName}</h4>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Account Name:</span> {bank.accountName}</p>
                    <p><span className="font-medium">Account Number:</span> {bank.accountNumber}</p>
                    <p><span className="font-medium">Added:</span> {new Date(bank.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(bank)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit bank details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(bank)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete bank details"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bank Details Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Bank Account</h3>
            <form onSubmit={handleAddBankDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={newBankForm.bankName}
                  onChange={handleNewBankFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., First Bank, GTBank"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={newBankForm.accountName}
                  onChange={handleNewBankFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Account holder name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={newBankForm.accountNumber}
                  onChange={handleNewBankFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="10-digit account number"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 disabled:opacity-50"
                >
                  {isCreating ? "Adding..." : "Add New Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bank Details Modal */}
      {isEditModalOpen && selectedBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Bank Details</h3>
            <form onSubmit={handleEditBankDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={editBankForm.bankName}
                  onChange={handleEditBankFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={editBankForm.accountName}
                  onChange={handleEditBankFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={selectedBank.accountNumber}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Account number cannot be changed</p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update Bank Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && bankToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Bank Details</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the bank details for <strong>{bankToDelete.bankName}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBankDetails}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetailsManager;

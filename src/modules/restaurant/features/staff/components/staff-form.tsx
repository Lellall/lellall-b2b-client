import { Camera } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

interface StaffFormProps {
  formValues: any; // Replace with actual form values type
  setFormValues: (values: any) => void; // Replace with actual type
  setModalOpen: (open: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loaders: {
    isCreating: boolean;
    isDeleting: boolean;
    isUpdating: boolean;
  };
}

function StaffForm({ formValues, setFormValues, setModalOpen, handleChange, onSubmit, loaders }: StaffFormProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const availableRoles = [
    "ADMIN",
    "MANAGER",
    "CHEF",
    "WAITER",
    "BARTENDER",
    "HOST",
    "KITCHEN_STAFF",
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-2 space-y-8">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="block text-[#05431E]">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formValues.firstName}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[#05431E]">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formValues.lastName}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          />
        </div>

        <div className="space моего-y-2">
          <label className="block text-[#05431E]">Email</label>
          <input
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[#05431E]">Password</label>
          <input
            type="password"
            name="password"
            value={formValues.password}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[#05431E]">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formValues.phoneNumber}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[#05431E]">Role</label>
          <select
            name="role"
            value={formValues.role}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="space-y-2">
          <label className="block text-[#05431E]">Address</label>
          <input
            type="text"
            name="address"
            value={formValues.address}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded-lg"
            required
          />
        </div>
      </div>

      <input
        type="hidden"
        name="restaurantId"
        value={formValues.restaurantId}
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" onClick={() => setModalOpen(false)}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-green-900 text-white"
          disabled={loaders?.isCreating || loaders?.isUpdating}
        >
          {loaders?.isCreating || loaders?.isUpdating ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

export default StaffForm;
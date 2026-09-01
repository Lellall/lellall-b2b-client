import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import {
  useGetStoreStaffQuery,
  useCreateStoreStaffMutation,
  useDeleteStoreStaffMutation,
} from '@/redux/api/store/store.api';
import { toast } from 'react-toastify';
import { UserAdd, Trash, Shield, Sms, Call, User } from 'iconsax-react';

export const StoreStaffPage: React.FC = () => {
  const { user } = useSelector(selectAuth);
  const storeId = user?.privateStoreId || '';

  const { data: staffList = [], isLoading, refetch } = useGetStoreStaffQuery(storeId, {
    skip: !storeId,
  });

  const [createStaff, { isLoading: isCreating }] = useCreateStoreStaffMutation();
  const [deleteStaff, { isLoading: isDeleting }] = useDeleteStoreStaffMutation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'HOSTESS',
    phoneNumber: '',
    password: '',
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) {
      toast.error('No private store assigned to this user.');
      return;
    }
    try {
      await createStaff({
        storeId,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          phoneNumber: formData.phoneNumber || undefined,
          password: formData.password || undefined,
        },
      }).unwrap();
      toast.success(`${formData.role} account created successfully!`);
      setShowModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'HOSTESS',
        phoneNumber: '',
        password: '',
      });
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create staff user.');
    }
  };

  const handleDeleteStaff = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteStaff({ storeId, userId }).unwrap();
      toast.success('Staff user removed successfully.');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete staff user.');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Store Staff & Hostesses
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage operational team members, hostesses, and managers for your Perfume Store.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#05431E] hover:bg-[#042f15] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <UserAdd size={18} />
          Add Staff / Hostess
        </button>
      </div>

      {/* Staff Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            Loading staff list...
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-16 text-center">
            <User size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-700 font-semibold text-base">No staff members found.</p>
            <p className="text-sm text-gray-500 mt-1">
              Click &quot;Add Staff / Hostess&quot; above to create hostess accounts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Staff Member
                  </th>
                  <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Role / Designation
                  </th>
                  <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="py-3 px-6 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffList.map((s: any) => (
                  <tr key={s.id} className="hover:bg-[#05431E]/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#05431E]/10 text-[#05431E] flex items-center justify-center font-bold text-sm border border-[#05431E]/10 shrink-0">
                          {(s.firstName?.[0] || '') + (s.lastName?.[0] || '')}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {s.firstName} {s.lastName}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Sms size={12} className="text-gray-400" />
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                          s.role === 'HOSTESS' || s.role === 'HOST'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <Shield size={12} />
                        {s.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {s.phoneNumber ? (
                        <div className="flex items-center gap-1.5">
                          <Call size={14} className="text-gray-400" />
                          {s.phoneNumber}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteStaff(s.id, `${s.firstName} ${s.lastName}`)}
                        disabled={isDeleting}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete staff account"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden pointer-events-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Add Staff / Hostess
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Create an account linked to your Perfume Store
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Jane"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="hostess@sanctum.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                      Role / Designation
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all"
                    >
                      <option value="HOSTESS">HOSTESS</option>
                      <option value="HOST">HOST</option>
                      <option value="MANAGER">MANAGER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+234..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Default: Sanctum123!"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to set default password: <code className="font-semibold text-gray-700">Sanctum123!</code>
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="bg-[#05431E] hover:bg-[#042f15] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default StoreStaffPage;

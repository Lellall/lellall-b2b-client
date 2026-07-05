import React from 'react';
import { ShieldTick, Profile2User, TickCircle, CloseCircle } from 'iconsax-react';
import { X, Mail, Phone, User as UserIcon, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';

interface ApplicationDrawerProps {
  application: any | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onConfirmPayment: (id: string) => void;
}

export const ApplicationDrawer: React.FC<ApplicationDrawerProps> = ({ 
  application, 
  isOpen, 
  onClose,
  onApprove,
  onReject,
  onConfirmPayment
}) => {
  if (!isOpen || !application) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-[#F9FAFB] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto border-l border-gray-200 flex flex-col`}>
        
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-5 border-b border-gray-100 flex justify-between items-center shadow-sm shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Application Review</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-red-50 rounded-full transition-colors text-gray-500 hover:text-red-500 border border-transparent hover:border-red-100"
          >
            <X size="20" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Status Banner */}
          <div className={`mb-6 rounded-xl p-4 flex items-center justify-between border ${
            application.status === 'PENDING' ? 'bg-amber-50 border-amber-200' :
            application.status === 'APPROVED' ? 'bg-green-50 border-green-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                application.status === 'PENDING' ? 'text-amber-800' :
                application.status === 'APPROVED' ? 'text-green-800' :
                'text-red-800'
              }`}>
                Current Status
              </p>
              <p className={`text-sm font-semibold flex items-center gap-2 ${
                application.status === 'PENDING' ? 'text-amber-900' :
                application.status === 'APPROVED' ? 'text-green-900' :
                'text-red-900'
              }`}>
                {application.status === 'PENDING' && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>}
                {application.status === 'APPROVED' && <TickCircle size="18" variant="Bold" />}
                {application.status === 'REJECTED' && <CloseCircle size="18" variant="Bold" />}
                {application.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Submitted on</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(application.createdAt || application.submittedAt || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex items-center gap-2">
              <UserIcon size="14" /> Primary Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400">Applicant Name</p>
                <p className="text-lg font-bold text-gray-900">{application.fullName}</p>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail size="18" className="text-[#05431E] mt-0.5" variant="Bulk" />
                <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="text-sm font-medium text-gray-900">{application.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size="18" className="text-[#05431E] mt-0.5" variant="Bulk" />
                <div>
                    <p className="text-xs text-gray-400">Primary Phone</p>
                    <p className="text-sm font-medium text-gray-900">{application.primaryPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase size="18" className="text-[#05431E] mt-0.5" variant="Bulk" />
                <div>
                  <p className="text-xs text-gray-400">Organization & Role</p>
                  <p className="text-sm font-medium text-gray-900">
                    {application.occupation ? `${application.occupation} at ` : ''}{application.company}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex items-center gap-2">
              <ShieldTick size="14" /> Membership Request
            </h3>
            
            <div className="mb-5">
              <p className="text-xs text-gray-400 mb-2">Requested Tier</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 bg-gray-50">
                <ShieldTick size="18" className={
                  application.requestedTier === 'BLACK' ? 'text-gray-900' :
                  application.requestedTier === 'GOLD' ? 'text-amber-500' : 'text-gray-400'
                } variant="Bulk" />
                <span className="text-sm font-bold tracking-widest text-gray-900">
                  {application.requestedTier} TIER
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Preferred Beverage</p>
                <p className="text-sm font-semibold text-gray-900">{application.preferredBeverage || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Preferred Cigar</p>
                <p className="text-sm font-semibold text-gray-900">{application.preferredCigar || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Entourage */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex items-center gap-2">
              <Profile2User size="14" /> Approved Guests (Entourage)
            </h3>
            
            {application.approvedGuests && application.approvedGuests.length > 0 ? (
              <div className="space-y-2">
                {application.approvedGuests.map((guest: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                      <UserIcon size="14" className="text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{guest}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No guests listed on application.</p>
            )}
          </div>
        </div>

        {/* Action Footer */}
        {application.status === 'PENDING' && (
          <div className="p-6 bg-white border-t border-gray-200 shrink-0">
            <p className="text-xs text-gray-500 text-center mb-4">
              Approving this application will automatically generate a member profile and assign a membership ID.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onReject(application.id);
                  toast.error(`Application for ${application.fullName} rejected.`);
                }}
                className="w-full py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  onApprove(application.id);
                  toast.success(`${application.fullName} has been approved as a new member!`);
                }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] transition-colors shadow-md"
              >
                Approve & Add Member
              </button>
            </div>
          </div>
        )}
        {application.status === 'APPROVED' && (
          <div className="p-6 bg-white border-t border-gray-200 shrink-0">
            <p className="text-xs text-gray-500 text-center mb-4">
              This application has been approved. The final step is to confirm their membership payment to fully activate the profile.
            </p>
            <button
              onClick={() => {
                onConfirmPayment(application.id);
              }}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] transition-colors shadow-md"
            >
              Confirm Payment & Activate Member
            </button>
          </div>
        )}
      </div>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Briefcase, Wine, ArrowRight, MoreVertical, Edit, Ban, Trash2, Plus } from 'lucide-react';
import { User as UserIcon, Profile2User } from 'iconsax-react';
import { BottleSlider } from './bottle-slider';
import { AddBottleModal } from './add-bottle-modal';
import { EditMemberModal } from './edit-member-modal';
import { useGetMemberBottlesQuery, useLogBottlePourMutation } from '../../../../../redux/api/private-lounge/bottles.api';
import { useSuspendMemberMutation, useDeleteMemberMutation } from '../../../../../redux/api/private-lounge/members.api';
import { toast } from 'react-toastify';

interface MemberDrawerProps {
  member: any | null; 
  isOpen: boolean;
  onClose: () => void;
}

export const MemberDrawer: React.FC<MemberDrawerProps> = ({ member, isOpen, onClose }) => {
  const [pouringBottleId, setPouringBottleId] = useState<string | null>(null);
  const [pourAmounts, setPourAmounts] = useState<Record<string, number>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddBottleModalOpen, setIsAddBottleModalOpen] = useState(false);

  const { data: bottlesResponse, isLoading: isLoadingBottles } = useGetMemberBottlesQuery(member?.id || '', {
    skip: !member?.id
  });
  
  const rawBottles = Array.isArray(bottlesResponse) ? bottlesResponse : [];
  const bottles = rawBottles.map((b: any) => {
    const volumePercent = (b.remainingVolumeMl / b.totalVolumeMl) * 100;
    return {
      ...b,
      volumePercent,
      status: volumePercent < 20 ? 'LOW' : 'OK'
    };
  });

  const [logPour] = useLogBottlePourMutation();
  const [suspendMember] = useSuspendMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();

  if (!isOpen || !member) return null;

  const handlePour = async (bottleId: string) => {
    const bottle = bottles.find((b: any) => b.id === bottleId);
    if (!bottle) return;

    const amount = pourAmounts[bottleId] || 30;

    if (amount > bottle.remainingVolumeMl) {
      toast.error('Cannot pour more than remaining volume');
      return;
    }

    try {
      await logPour({
        bottleId,
        amountPoured: amount,
        servedBy: 'Lounge Staff', // You can dynamically set this if staff auth exists
      }).unwrap();
      
      toast.success(`Poured ${amount}ml of ${bottle.bottleName}`);
      setPouringBottleId(null);
      setPourAmounts(prev => ({ ...prev, [bottleId]: 30 }));
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to log pour');
    }
  };

  const handleSuspend = async () => {
    if (!confirm('Are you sure you want to suspend this member?')) return;
    try {
      await suspendMember(member.id).unwrap();
      toast.success('Member suspended');
      onClose();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to suspend member');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await deleteMember(member.id).unwrap();
      toast.success('Member deleted');
      onClose();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete member');
    }
  };

  const handleSliderChange = (bottleId: string, val: number) => {
    setPourAmounts(prev => ({ ...prev, [bottleId]: val }));
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-[#F9FAFB] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto border-l border-gray-200`}>
        
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-5 border-b border-gray-100 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Member Dossier</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <MoreVertical size="20" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <button onClick={() => { setIsMenuOpen(false); setIsEditModalOpen(true); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Edit size="16" /> Edit Profile
                  </button>
                  <button onClick={() => { setIsMenuOpen(false); handleSuspend(); }} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                    <Ban size="16" /> Suspend
                  </button>
                  <button onClick={() => { setIsMenuOpen(false); handleDelete(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <Trash2 size="16" /> Delete
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-50 hover:bg-red-50 rounded-full transition-colors text-gray-500 hover:text-red-500 border border-transparent hover:border-red-100"
            >
              <X size="20" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
            {/* Tier Banner */}
            <div className={`absolute top-0 left-0 w-full h-2 ${
              member.tier === 'BLACK' ? 'bg-gradient-to-r from-gray-900 to-black' :
              member.tier === 'GOLD' ? 'bg-gradient-to-r from-amber-400 to-yellow-600' :
              'bg-gradient-to-r from-gray-300 to-gray-400'
            }`} />
            
            <div className="text-center mt-2">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#05431E] to-[#0a632e] flex items-center justify-center border-4 border-white shadow-md overflow-hidden mb-4 relative group">
                {member.passportPhotoUrl ? (
                  <img src={member.passportPhotoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white tracking-widest">
                    {member.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </span>
                )}
                {/* Tier Icon overlay */}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      member.tier === 'BLACK' ? 'bg-gray-900 text-white' :
                      member.tier === 'GOLD' ? 'bg-amber-400 text-amber-900' :
                      'bg-gray-200 text-gray-700'
                   }`}>
                     <span className="text-[10px] font-bold">{member.tier.charAt(0)}</span>
                   </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {member.title ? `${member.title} ` : ''}{member.fullName}
              </h3>
              <p className="text-sm text-gray-500 font-mono mt-1 bg-gray-50 inline-block px-3 py-1 rounded-md border border-gray-100">{member.membershipNumber}</p>
              
              <div className="mt-4 flex justify-center gap-4 text-sm">
                 <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Visits</p>
                    <p className="font-semibold text-gray-900">{member.totalVisits || 0}</p>
                 </div>
                 <div className="w-px bg-gray-200"></div>
                 <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Member Since</p>
                    <p className="font-semibold text-gray-900">{new Date(member.activationDate || member.createdAt || new Date()).getFullYear()}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Contact & Professional Info */}
          <div className="grid gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
               <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <UserIcon size="14" /> Profile Information
               </h4>
               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail size="18" className="text-[#05431E] mt-0.5" variant="Bulk" />
                    <div>
                       <p className="text-xs text-gray-400">Email Address</p>
                       <p className="text-sm font-medium text-gray-900">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size="18" className="text-[#05431E] mt-0.5" variant="Bulk" />
                    <div>
                       <p className="text-xs text-gray-400">Primary Phone</p>
                       <p className="text-sm font-medium text-gray-900">{member.primaryPhone}</p>
                    </div>
                  </div>
                  {member.occupation && (
                    <div className="flex items-start gap-3">
                      <Briefcase size="18" className="text-[#05431E] mt-0.5" variant="Bulk" />
                      <div>
                        <p className="text-xs text-gray-400">Profession</p>
                        <p className="text-sm font-medium text-gray-900">{member.occupation} <span className="text-gray-400 font-normal">at</span> {member.company}</p>
                      </div>
                    </div>
                  )}
                  {member.city && (
                    <div className="flex items-start gap-3">
                      <MapPin size="18" className="text-[#05431E] mt-0.5" variant="Bulk" />
                      <div>
                        <p className="text-xs text-gray-400">Location</p>
                        <p className="text-sm font-medium text-gray-900">{member.city}{member.country ? `, ${member.country}` : ''}</p>
                      </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Approved Guests */}
            {member.approvedUsers && member.approvedUsers.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                 <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                   <Profile2User size="14" /> Approved Guests/Entourage
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {member.approvedUsers.map((user: any, idx: number) => (
                     <span key={idx} className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                       {user.name}
                     </span>
                   ))}
                 </div>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Preferences</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-[#05431E]/30 transition-colors">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                   <Wine size="40" variant="Bulk" />
                </div>
                <span className="text-xs text-gray-400 block mb-1">Beverage</span>
                <span className="text-sm font-semibold text-gray-900 relative z-10">{member.preferredBeverage || 'None specified'}</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-amber-900/30 transition-colors">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                   {/* Fallback icon for cigar since it's not in standard icon set */}
                   <span className="text-4xl">🚬</span>
                </div>
                <span className="text-xs text-gray-400 block mb-1">Cigar</span>
                <span className="text-sm font-semibold text-gray-900 relative z-10">{member.preferredCigar || 'None specified'}</span>
              </div>
            </div>
          </div>

          {/* Bottle Storage */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Wine size="20" className="text-[#05431E]" variant="Bulk" />
                Locker Inventory
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-[#05431E]/10 text-[#05431E] px-2.5 py-1 rounded-full">
                  {bottles.length} Bottles
                </span>
                <button
                  onClick={() => setIsAddBottleModalOpen(true)}
                  className="p-1 bg-[#05431E]/10 hover:bg-[#05431E]/20 text-[#05431E] rounded-full transition-colors"
                  title="Add Bottle"
                >
                  <Plus size="16" />
                </button>
              </div>
            </div>

            {isLoadingBottles ? (
              <div className="text-center py-8 text-sm text-gray-500">Loading inventory...</div>
            ) : bottles.length > 0 ? (
              <div className="space-y-3">
                {bottles.map((bottle: any) => (
                  <div key={bottle.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                    {/* Percentile Background indicator */}
                    <div 
                      className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-in-out ${bottle.status === 'LOW' ? 'bg-red-500' : 'bg-[#05431E]'}`}
                      style={{ width: `${bottle.volumePercent}%` }}
                    />
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-bold text-gray-900">{bottle.bottleName}</h5>
                        <p className="text-xs text-gray-500">{bottle.type}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        bottle.status === 'LOW' 
                          ? 'bg-red-50 text-red-700 border-red-100' 
                          : 'bg-green-50 text-green-700 border-green-100'
                      }`}>
                        {bottle.volumePercent.toFixed(0)}% Left
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div 
                             className={`h-full ${bottle.status === 'LOW' ? 'bg-red-500' : 'bg-[#05431E]'}`} 
                             style={{ width: `${bottle.volumePercent}%` }}
                           />
                        </div>
                        <span className="text-xs font-mono text-gray-500">
                          {bottle.remainingVolumeMl} / {bottle.totalVolumeMl} ml
                        </span>
                      </div>
                      
                      {bottle.remainingVolumeMl > 0 && (
                        <button
                          onClick={() => {
                             setPourAmounts(prev => ({ ...prev, [bottle.id]: 30 }));
                             setPouringBottleId(bottle.id);
                          }}
                          className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all bg-[#05431E]/10 text-[#05431E] hover:bg-[#05431E]/20"
                        >
                          Pour
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm">
                <Wine size="32" className="text-gray-300 mx-auto mb-3" variant="Bulk" />
                <p className="text-sm font-medium text-gray-900">No Inventory</p>
                <p className="text-xs text-gray-500 mt-1">This member does not have any bottles stored in their locker.</p>
              </div>
            )}
          </div>
          
        </div>

        {/* POUR STATION OVERLAY */}
        {pouringBottleId && (
          <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
            {(() => {
               const activeBottle = bottles.find((b: any) => b.id === pouringBottleId);
               if (!activeBottle) return null;
               
               return (
                 <>
                   {/* Header */}
                   <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-black/20 shrink-0">
                     <div>
                       <h2 className="text-xl font-bold text-white">{activeBottle.bottleName}</h2>
                       <p className="text-sm text-gray-400">{activeBottle.type} • {activeBottle.remainingVolumeMl}ml remaining</p>
                     </div>
                     <button 
                       onClick={() => setPouringBottleId(null)}
                       className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
                     >
                       <X size="20" />
                     </button>
                   </div>
                   
                   {/* Body: The Slider */}
                   <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-black">
                      <BottleSlider
                        totalVolumeMl={activeBottle.totalVolumeMl}
                        remainingVolumeMl={activeBottle.remainingVolumeMl}
                        pourAmount={pourAmounts[activeBottle.id] || 0}
                        onChange={(val) => handleSliderChange(activeBottle.id, val)}
                        colorHex={member.tier === 'BLACK' ? '#4b5563' : member.tier === 'GOLD' ? '#fbbf24' : '#d1d5db'}
                      />
                   </div>
                   
                   {/* Footer: Confirm Button */}
                   <div className="p-6 bg-black/40 border-t border-gray-800 shrink-0">
                      <button
                        onClick={() => handlePour(activeBottle.id)}
                        className="w-full bg-white text-gray-900 py-3.5 rounded-xl text-base font-bold hover:bg-gray-100 transition-all shadow-xl shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Wine size="18" />
                        Confirm Pour — {pourAmounts[activeBottle.id] || 30}ml
                      </button>
                   </div>
                 </>
               );
            })()}
          </div>
        )}

      </div>

      <AddBottleModal 
        isOpen={isAddBottleModalOpen} 
        onClose={() => setIsAddBottleModalOpen(false)} 
        membershipId={member.id}
        loungeId={member.loungeId}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={member}
      />
    </>
  );
};

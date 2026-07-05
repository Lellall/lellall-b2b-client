import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldTick, Profile2User, TickCircle } from 'iconsax-react';
import { User, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSubmitApplicationMutation } from '../../../../redux/api/private-lounge/applications.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';

type FormStep = 'primary' | 'membership' | 'entourage';

interface FormData {
  // Step 1
  firstName: string;
  lastName: string;
  email: string;
  primaryPhone: string;
  company: string;
  occupation: string;

  // Step 2
  requestedTier: string;
  preferredBeverage: string;
  preferredCigar: string;

  // Step 3
  passportPhoto: File | null;
  approvedGuests: string[];
  currentGuestInput: string;
}

export const NewApplication: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [submitApplication, { isLoading }] = useSubmitApplicationMutation();
  const [currentStep, setCurrentStep] = useState<FormStep>('primary');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    primaryPhone: '',
    company: '',
    occupation: '',
    requestedTier: 'BLACK',
    preferredBeverage: '',
    preferredCigar: '',
    passportPhoto: null,
    approvedGuests: [],
    currentGuestInput: ''
  });

  const steps: { id: FormStep; label: string; icon: React.ReactNode }[] = [
    { id: 'primary', label: 'Primary Details', icon: <User size={20} /> },
    { id: 'membership', label: 'Membership & Preferences', icon: <ShieldTick size={20} /> },
    { id: 'entourage', label: 'Identity & Entourage', icon: <Profile2User size={20} /> },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep === 'primary') setCurrentStep('membership');
    else if (currentStep === 'membership') setCurrentStep('entourage');
  };

  const handleBack = () => {
    if (currentStep === 'entourage') setCurrentStep('membership');
    else if (currentStep === 'membership') setCurrentStep('primary');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 'entourage') {
      handleNext();
      return;
    }

    if (!user?.privateLoungeId) {
      toast.error('Lounge ID is missing. Cannot submit application.');
      return;
    }

    try {
      const payload: any = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        primaryPhone: formData.primaryPhone,
        company: formData.company,
        occupation: formData.occupation,
        tier: formData.requestedTier,
        preferredBeverage: formData.preferredBeverage,
        preferredCigar: formData.preferredCigar,
      };

      if (formData.requestedTier === 'BLACK' && formData.approvedGuests.length > 0) {
        payload.approvedUsers = formData.approvedGuests.map((guest: string) => ({ name: guest }));
      }

      await submitApplication({ loungeId: user.privateLoungeId, data: payload }).unwrap();
      
      toast.success('Membership Application submitted successfully!');
      navigate('/lounge/applications');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.error?.message || 'Failed to submit application');
    }
  };

  const addGuest = () => {
    if (formData.currentGuestInput.trim()) {
      setFormData(prev => ({
        ...prev,
        approvedGuests: [...prev.approvedGuests, prev.currentGuestInput.trim()],
        currentGuestInput: ''
      }));
    }
  };

  const removeGuest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      approvedGuests: prev.approvedGuests.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto min-h-screen">
      {/* ─── HEADER ──────────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => navigate('/lounge/applications')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft size="24" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Membership Application</h1>
          <p className="text-sm text-gray-500 mt-1">Register a new VIP member or walk-in applicant</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* ─── STEPPER SIDEBAR ─────────────────────────────── */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-6">
            <nav className="space-y-2">
              {steps.map((step, index) => {
                const stepIndex = steps.findIndex(s => s.id === step.id);
                const currentIndex = steps.findIndex(s => s.id === currentStep);
                const isCompleted = stepIndex < currentIndex;
                const isCurrent = step.id === currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    disabled={stepIndex > currentIndex} // Prevent skipping ahead
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      isCurrent 
                        ? 'bg-[#05431E]/5 text-[#05431E] border border-[#05431E]/10' 
                        : isCompleted
                          ? 'text-gray-900 hover:bg-gray-50 border border-transparent'
                          : 'text-gray-400 opacity-50 cursor-not-allowed border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isCurrent ? 'bg-[#05431E] text-white shadow-md' :
                      isCompleted ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <TickCircle size="16" variant="Bold" /> : step.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-0.5 opacity-70">Step {index + 1}</p>
                      <p className="text-sm font-medium">{step.label}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ─── FORM CONTENT ────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900">
              {steps.find(s => s.id === currentStep)?.label}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {currentStep === 'primary' && 'Enter the core personal and professional details of the applicant.'}
              {currentStep === 'membership' && 'Select the desired tier and record their luxury preferences.'}
              {currentStep === 'entourage' && 'Finalize identity verification and approved guests.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            
            {/* STEP 1: PRIMARY DETAILS */}
            {currentStep === 'primary' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" placeholder="e.g. David" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" placeholder="e.g. Nwachukwu" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" placeholder="david@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Primary Phone <span className="text-red-500">*</span></label>
                    <input required type="tel" name="primaryPhone" value={formData.primaryPhone} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" placeholder="+234 800 000 0000" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Professional Profiling</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company / Organization <span className="text-red-500">*</span></label>
                      <input required type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" placeholder="e.g. Apex Holdings Ltd." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation / Occupation <span className="text-red-500">*</span></label>
                      <input required type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" placeholder="e.g. CEO, Managing Director" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: MEMBERSHIP & PREFERENCES */}
            {currentStep === 'membership' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Requested Tier <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['BLACK', 'GOLD', 'SILVER'].map((tier) => (
                      <label 
                        key={tier} 
                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
                          formData.requestedTier === tier 
                            ? 'border-[#05431E] bg-[#05431E]/5 shadow-sm ring-1 ring-[#05431E]' 
                            : 'border-gray-200 hover:border-[#05431E]/30 bg-white'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="requestedTier" 
                          value={tier} 
                          checked={formData.requestedTier === tier}
                          onChange={handleInputChange}
                          className="sr-only" 
                        />
                        <ShieldTick size="24" className={formData.requestedTier === tier ? 'text-[#05431E]' : 'text-gray-400'} variant={formData.requestedTier === tier ? 'Bulk' : 'Linear'} />
                        <span className={`text-sm font-bold tracking-widest ${
                          tier === 'BLACK' ? 'text-gray-900' : 
                          tier === 'GOLD' ? 'text-amber-600' : 'text-gray-600'
                        }`}>{tier}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Lounge Preferences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Beverage</label>
                      <input type="text" name="preferredBeverage" value={formData.preferredBeverage} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" placeholder="e.g. Hennessy XO, Macallan 18" />
                      <p className="text-[11px] text-gray-400 mt-1.5">Used to prepare bottle storage recommendations.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Cigar</label>
                      <input type="text" name="preferredCigar" value={formData.preferredCigar} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" placeholder="e.g. Cohiba Behike" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: IDENTITY & ENTOURAGE */}
            {currentStep === 'entourage' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Passport Photo (Optional)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                     <User size="32" className="text-gray-400 mx-auto mb-3 group-hover:text-[#05431E] transition-colors" />
                     <p className="text-sm font-medium text-gray-700">Click to upload photo</p>
                     <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">Approved Guests & Entourage</h4>
                    <p className="text-xs text-gray-500 mt-1">Add individuals authorized to access the lounge under this membership (e.g., PA, Driver, Spouse).</p>
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                     <input 
                       type="text" 
                       name="currentGuestInput" 
                       value={formData.currentGuestInput} 
                       onChange={handleInputChange} 
                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGuest())}
                       className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" 
                       placeholder="e.g. Driver - Chukwu Eze" 
                     />
                     <button type="button" onClick={addGuest} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition-colors shrink-0">
                       Add Guest
                     </button>
                  </div>

                  {formData.approvedGuests.length > 0 ? (
                    <div className="space-y-2">
                      {formData.approvedGuests.map((guest, i) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                           <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                             <Profile2User size="16" className="text-gray-400" />
                             {guest}
                           </span>
                           <button type="button" onClick={() => removeGuest(i)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-lg transition-colors">
                             <ArrowLeft size="16" className="rotate-45" /> {/* Makeshift cross/delete */}
                           </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-dashed border-gray-200">
                      <p className="text-sm text-gray-500">No guests added yet.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between p-6 md:p-8 bg-gray-50/50 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 'primary' || isLoading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                  currentStep === 'primary' 
                    ? 'opacity-0 cursor-default' 
                    : 'text-gray-600 hover:bg-gray-200 bg-gray-100'
                }`}
              >
                <ArrowLeft size="18" /> Back
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium bg-[#05431E] text-white hover:bg-[#05431E]/90 transition-all shadow-sm shadow-[#05431E]/20"
              >
                {isLoading ? (
                  'Submitting...'
                ) : currentStep === 'entourage' ? (
                  <>Submit Application <TickCircle size="18" variant="Bold" /></>
                ) : (
                  <>Next Step <ArrowRight size="18" /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

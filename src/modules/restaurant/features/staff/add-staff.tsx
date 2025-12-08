import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, FileText, Lock, Calendar, Camera, Upload, Pencil } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetRestaurantBySubdomainQuery } from '@/redux/api/restaurant/restaurant.api';
import { useGetDepartmentsQuery } from '@/redux/api/department/department.api';
import { useCreateUserUnderRestaurantMutation } from '@/redux/api/restaurant/restaurant.api';
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { toast } from 'react-toastify';
import ImageEditorModal from '@/components/ImageEditorModal';

type FormStep = 'personal' | 'professional' | 'documents' | 'account';

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailAddress: string;
  dateOfBirth: string;
  maritalStatus: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  profilePicture: File | null;

  // Professional Information
  employeeId: string;
  employeeType: string;
  departmentId: string;
  workingDays: string;
  officeLocation: string;
  userName: string;
  designation: string;
  joiningDate: string;

  // Documents
  appointmentLetter: File | null;
  salarySlips: File[]; // Multiple files
  relivingLetter: File | null; // Note: API uses "reliving" not "relieving"
  experienceLetter: File | null;

  // Account Access
  monthlySalary: string;
  annualSalary: string;
  bank: string;
  bankBranch: string; // API uses bankBranch, not branch
  accountNumber: string;
  accountName: string;
  bvn: string;
  defaultPassword: string;
}

const AddStaff: React.FC = () => {
  const navigate = useNavigate();
  const { subdomain } = useSelector(selectAuth);
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    emailAddress: '',
    dateOfBirth: '',
    maritalStatus: '',
    gender: '',
    nationality: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profilePicture: null,
    employeeId: '',
    employeeType: '',
    departmentId: '',
    workingDays: '',
    officeLocation: '',
    userName: '',
    designation: '',
    joiningDate: '',
    appointmentLetter: null,
    salarySlips: [],
    relivingLetter: null,
    experienceLetter: null,
    monthlySalary: '',
    annualSalary: '',
    bank: '',
    bankBranch: '',
    accountNumber: '',
    accountName: '',
    bvn: '',
    defaultPassword: '',
  });

  const {
    data: restaurant,
    isLoading: isRestaurantLoading,
  } = useGetRestaurantBySubdomainQuery(subdomain, { skip: !subdomain });

  const parentRestaurantId = restaurant?.parentId || restaurant?.id;

  const {
    data: departmentsData,
    isLoading: isDepartmentsLoading,
  } = useGetDepartmentsQuery(
    { restaurantId: parentRestaurantId || '' },
    { skip: !parentRestaurantId }
  );

  const [createUser, { isLoading: isCreating }] = useCreateUserUnderRestaurantMutation();

  const profilePictureRef = useRef<HTMLInputElement>(null);
  const appointmentLetterRef = useRef<HTMLInputElement>(null);
  const salarySlipsRef = useRef<HTMLInputElement>(null);
  const relievingLetterRef = useRef<HTMLInputElement>(null);
  const experienceLetterRef = useRef<HTMLInputElement>(null);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const submitButtonClickedRef = useRef<boolean>(false);

  const steps: { id: FormStep; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal Information', icon: <User size={20} /> },
    { id: 'professional', label: 'Professional Information', icon: <Briefcase size={20} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={20} /> },
    { id: 'account', label: 'Account Access', icon: <Lock size={20} /> },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field: keyof FormData, file: File | null | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleFileUpload = (field: keyof FormData, ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    if (field === 'salarySlips') {
      const files = Array.from(e.target.files || []);
      setFormData((prev) => ({ ...prev, [field]: files }));
      return;
    }

    const file = e.target.files?.[0] || null;

    if (field === 'profilePicture' && file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageToEdit(reader.result);
          setIsImageEditorOpen(true);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    handleFileChange(field, file);
  };

  const handleNext = () => {
    const stepOrder: FormStep[] = ['personal', 'professional', 'documents', 'account'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const stepOrder: FormStep[] = ['personal', 'professional', 'documents', 'account'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only submit if we're on the account step AND the submit button was explicitly clicked
    if (currentStep !== 'account') {
      return;
    }
    
    // Only proceed if the submit button was actually clicked
    if (!submitButtonClickedRef.current) {
      return;
    }
    
    // Reset the ref for next time
    submitButtonClickedRef.current = false;
    
    if (!restaurant?.id) {
      toast.error('Restaurant not found');
      return;
    }

    if (!formData.defaultPassword || formData.defaultPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      // Create FormData
      const formDataToSend = new FormData();

      // Personal Information
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.emailAddress);
      if (formData.mobileNumber) formDataToSend.append('phoneNumber', formData.mobileNumber);
      if (formData.dateOfBirth) formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      if (formData.maritalStatus) formDataToSend.append('maritalStatus', formData.maritalStatus);
      if (formData.gender) formDataToSend.append('gender', formData.gender);
      if (formData.nationality) formDataToSend.append('nationality', formData.nationality);
      if (formData.address) formDataToSend.append('address', formData.address);
      if (formData.city) formDataToSend.append('city', formData.city);
      if (formData.state) formDataToSend.append('state', formData.state);
      if (formData.zipCode) formDataToSend.append('zipCode', formData.zipCode);

      // Professional Information
      formDataToSend.append('restaurantId', restaurant.id);
      formDataToSend.append('role', formData.employeeType || 'STAFF');
      if (formData.employeeId) formDataToSend.append('employeeId', formData.employeeId);
      if (formData.employeeType) formDataToSend.append('employeeType', formData.employeeType);
      if (formData.departmentId) formDataToSend.append('departmentId', formData.departmentId);
      if (formData.workingDays) formDataToSend.append('workingDays', formData.workingDays);
      if (formData.officeLocation) formDataToSend.append('officeLocation', formData.officeLocation);
      if (formData.designation) formDataToSend.append('designation', formData.designation);
      if (formData.joiningDate) formDataToSend.append('joiningDate', formData.joiningDate);

      // Account Access
      formDataToSend.append('password', formData.defaultPassword);
      if (formData.monthlySalary) formDataToSend.append('monthlySalary', formData.monthlySalary);
      if (formData.annualSalary) formDataToSend.append('annualSalary', formData.annualSalary);
      if (formData.bank) formDataToSend.append('bank', formData.bank);
      if (formData.bankBranch) formDataToSend.append('bankBranch', formData.bankBranch);
      if (formData.accountNumber) formDataToSend.append('accountNumber', formData.accountNumber);
      if (formData.accountName) formDataToSend.append('accountName', formData.accountName);
      if (formData.bvn) formDataToSend.append('bvn', formData.bvn);
      if (formData.defaultPassword) formDataToSend.append('defaultPassword', formData.defaultPassword);

      // File Uploads
      if (formData.profilePicture) {
        formDataToSend.append('profilePicture', formData.profilePicture);
      }
      if (formData.appointmentLetter) {
        formDataToSend.append('appointmentLetter', formData.appointmentLetter);
      }
      // Handle multiple salarySlips
      if (formData.salarySlips && formData.salarySlips.length > 0) {
        formData.salarySlips.forEach((file) => {
          formDataToSend.append('salarySlips', file);
        });
      }
      if (formData.relivingLetter) {
        formDataToSend.append('relivingLetter', formData.relivingLetter);
      }
      if (formData.experienceLetter) {
        formDataToSend.append('experienceLetter', formData.experienceLetter);
      }

      // Create user with FormData
      await createUser(formDataToSend).unwrap();

      toast.success('Employee added successfully. Please verify your email.');
      navigate('/staffs');
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      toast.error(error?.data?.message || 'Failed to add employee');
    }
  };

  if (isRestaurantLoading || isDepartmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ColorRing
          height="80"
          width="80"
          colors={[theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active]}
          ariaLabel="loading"
          visible={true}
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/staffs')}
          className="text-sm text-gray-600 hover:text-[#05431E] transition-colors"
        >
          All Employee
        </button>
        <span className="text-sm text-gray-600 mx-2">›</span>
        <span className="text-sm text-gray-900 font-medium">Add New Employee</span>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg p-6">
        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === step.id
                    ? 'bg-[#05431E] text-white'
                    : 'text-gray-600 hover:text-[#05431E]'
                }`}
              >
                {step.icon}
                <span className="text-sm font-medium">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Content */}
        <form 
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Always prevent Enter key from submitting form unless it's explicitly the submit button
            if (e.key === 'Enter') {
              const target = e.target as HTMLElement;
              // Only allow Enter to submit if it's explicitly the submit button being pressed
              if (target.tagName !== 'BUTTON' || target.type !== 'submit') {
                e.preventDefault();
                e.stopPropagation();
                // If not on account step, go to next step
                if (currentStep !== 'account') {
                  handleNext();
                }
                // If on account step but not the submit button, do nothing (prevent submission)
              }
            }
          }}
        >
          {/* Image Editor Modal */}
          <ImageEditorModal
            isOpen={isImageEditorOpen}
            imageSrc={imageToEdit}
            onClose={() => {
              setIsImageEditorOpen(false);
              setImageToEdit(null);
            }}
            onConfirm={(file) => {
              setFormData((prev) => ({
                ...prev,
                profilePicture: file,
              }));
              setIsImageEditorOpen(false);
              setImageToEdit(null);
            }}
          />

          {/* Personal Information Step */}
          {currentStep === 'personal' && (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div
                    onClick={() => profilePictureRef.current?.click()}
                    className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
                  >
                    {formData.profilePicture ? (
                      <>
                        <img
                          src={URL.createObjectURL(formData.profilePicture)}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 border border-gray-200">
                          <Pencil size={14} className="text-gray-700" />
                        </div>
                      </>
                    ) : (
                      <Camera size={32} className="text-gray-400" />
                    )}
                  </div>
                  <input
                    ref={profilePictureRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileInputChange(e, 'profilePicture')}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                    />
                    <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Professional Information Step */}
          {currentStep === 'professional' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee Type <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <select
                  name="employeeType"
                  value={formData.employeeType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                >
                  <option value="">Select</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="WAITER">Waiter</option>
                  <option value="CHEF">Chef</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="STORE_KEEPER">Store Keeper</option>
                  <option value="HUMAN_RESOURCE">Human Resource</option>
                  <option value="COO">COO</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="SUPERVISOR">Supervisor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Department <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                >
                  <option value="">Select</option>
                  {departmentsData?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Designation <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Working Days <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <select
                  name="workingDays"
                  value={formData.workingDays}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                >
                  <option value="">Select</option>
                  <option value="Monday-Friday">Monday - Friday</option>
                  <option value="Monday-Saturday">Monday - Saturday</option>
                  <option value="Full Week">Full Week</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Joining Date <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  />
                  <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Office Location <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <select
                  name="officeLocation"
                  value={formData.officeLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                >
                  <option value="">Select</option>
                  <option value="Main Office">Main Office</option>
                  <option value="Branch 1">Branch 1</option>
                  <option value="Branch 2">Branch 2</option>
                </select>
              </div>
            </div>
          )}

          {/* Documents Step */}
          {currentStep === 'documents' && (
            <div className="grid grid-cols-2 gap-6">
              {[
                { field: 'appointmentLetter', label: 'Upload Appointment Letter', ref: appointmentLetterRef },
                { field: 'salarySlips', label: 'Upload Salary Slips', ref: salarySlipsRef, multiple: true },
                { field: 'relivingLetter', label: 'Upload Reliving Letter', ref: relievingLetterRef },
                { field: 'experienceLetter', label: 'Upload Experience Letter', ref: experienceLetterRef },
              ].map(({ field, label, ref, multiple }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div
                    onClick={() => handleFileUpload(field as keyof FormData, ref)}
                    className="w-full h-48 border-2 border-dashed border-[#05431E] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition-colors"
                  >
                    <Upload size={32} className="text-[#05431E] mb-2" />
                    <p className="text-sm text-gray-600 text-center px-4">
                      Drag & Drop or choose file to upload
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Supported formats: Jpeg, pdf</p>
                    {field === 'salarySlips' && formData.salarySlips.length > 0 && (
                      <p className="text-xs text-[#05431E] mt-2">
                        {formData.salarySlips.length} file(s) selected
                      </p>
                    )}
                    {field !== 'salarySlips' && formData[field as keyof FormData] && (
                      <p className="text-xs text-[#05431E] mt-2">
                        {(formData[field as keyof FormData] as File)?.name}
                      </p>
                    )}
                  </div>
                  <input
                    ref={ref}
                    type="file"
                    accept=".pdf,.jpeg,.jpg,.png"
                    multiple={multiple}
                    onChange={(e) => handleFileInputChange(e, field as keyof FormData)}
                    className="hidden"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Account Access Step */}
          {currentStep === 'account' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Salary <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="monthlySalary"
                  value={formData.monthlySalary}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Salary <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="annualSalary"
                  value={formData.annualSalary}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="bank"
                  value={formData.bank}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="bankBranch"
                  value={formData.bankBranch}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BVN <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="bvn"
                  value={formData.bvn}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Password</label>
                <input
                  type="password"
                  name="defaultPassword"
                  value={formData.defaultPassword}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 'personal') {
                  navigate('/staffs');
                } else {
                  handlePrevious();
                }
              }}
              className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {currentStep !== 'account' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNext();
                }}
                className="px-6 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isCreating}
                onClick={(e) => {
                  // Mark that the submit button was explicitly clicked
                  submitButtonClickedRef.current = true;
                  e.stopPropagation();
                }}
                className="px-6 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Adding...' : 'Add'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaff;


import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaRegCheckCircle } from "react-icons/fa";
import { AiOutlineFileAdd } from "react-icons/ai";

const steps = [
    { title: "Business Info", description: "Upload your business license." },
    { title: "Tax Information", description: "Enter your registered tax ID." },
    { title: "Owner Verification", description: "Upload your owner ID proof." },
];

const KYCWizard = ({ restaurantData, onComplete }: { restaurantData: any; onComplete: () => void }) => {
    const [step, setStep] = useState(1);
    const totalSteps = steps.length;

    const [kycData, setKycData] = useState({
        businessLicense: "",
        taxId: "",
        ownerIdProof: "",
    });

    const handleNext = () => step < totalSteps && setStep(step + 1);
    const handlePrevious = () => step > 1 && setStep(step - 1);
    const handleSubmit = () => {
        console.log("Submitting KYC data:", kycData);
        onComplete();
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900">Business License</h3>
                        <p className="text-sm text-gray-600">Upload your valid business license for verification.</p>
                        <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-all">
                            <AiOutlineFileAdd className="text-3xl mx-auto text-gray-500" />
                            <span className="block text-sm text-gray-600 mt-2">Click to upload</span>
                            <input type="file" className="hidden" onChange={(e) => setKycData({ ...kycData, businessLicense: e.target.files?.[0] || "" })} />
                        </label>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900">Tax Information</h3>
                        <p className="text-sm text-gray-600">Enter your registered tax identification number.</p>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tax ID"
                            value={kycData.taxId}
                            onChange={(e) => setKycData({ ...kycData, taxId: e.target.value })}
                        />
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900">Owner Identification</h3>
                        <p className="text-sm text-gray-600">Upload a government-issued ID for verification.</p>
                        <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-all">
                            <AiOutlineFileAdd className="text-3xl mx-auto text-gray-500" />
                            <span className="block text-sm text-gray-600 mt-2">Click to upload</span>
                            <input type="file" className="hidden" onChange={(e) => setKycData({ ...kycData, ownerIdProof: e.target.files?.[0] || "" })} />
                        </label>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden">
                {/* Header with Progress Bar */}
                <div className="p-6 border-b border-gray-200 relative">
                    <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
                    <p className="text-sm text-gray-600 mt-1">Complete your verification to activate your account.</p>
                    <div className="w-full h-2 bg-gray-200 mt-4 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / totalSteps) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="p-6">
                    <motion.p 
                        className="text-sm text-gray-500 mb-6 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        Step {step} of {totalSteps}
                    </motion.p>

                    {renderStep()}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between">
                        <button
                            className={`px-4 py-2 rounded-md font-medium transition-all ${
                                step === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={handlePrevious}
                            disabled={step === 1}
                        >
                            Previous
                        </button>
                        {step === totalSteps ? (
                            <motion.button
                                className="px-4 py-2 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                                onClick={handleSubmit}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaRegCheckCircle /> Submit
                            </motion.button>
                        ) : (
                            <motion.button
                                className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
                                onClick={handleNext}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Next
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KYCWizard;

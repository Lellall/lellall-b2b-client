// src/components/SupplyRequestModal.tsx
import React, { useState } from 'react';
import { ModalOverlay, ModalContent, ModalHeader, ModalBody, StepIndicator, StepDot, Button } from './modal-styles';
import { CreateSupplyRequestResponse, ParsedItem } from '@/redux/api/gpt-supply-request/gpt-supply.api';
import PromptStep from './prompt-step';
import ReviewStep from './review-step';
import VendorStep from './vendor-step';
import { TypeAnimation } from 'react-type-animation';
import { CloseCircle, Edit, Eye, Send } from 'iconsax-react';

interface SupplyRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    subdomain: string;
    restaurantId: string;
    userId: string;
}

const SupplyRequestModal: React.FC<SupplyRequestModalProps> = ({
    isOpen,
    onClose,
    subdomain,
    restaurantId,
    userId,
}) => {
    const [step, setStep] = useState(1);
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<CreateSupplyRequestResponse | null>(null);
    const [editedItems, setEditedItems] = useState<ParsedItem[]>([]);
    const [showTypewriter, setShowTypewriter] = useState(true);

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        setShowTypewriter(false);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handlePromptSubmit = (data: CreateSupplyRequestResponse) => {
        setResponse(data);
        setEditedItems(data.supplyRequest?.parsedJson || []);
        handleNext();
    };

    const handleItemsUpdate = (items: ParsedItem[]) => {
        setEditedItems(items);
        handleNext();
    };

    const handleReset = () => {
        setStep(1);
        setPrompt('');
        setResponse(null);
        setEditedItems([]);
        setShowTypewriter(true);
    };

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <div>
                        {showTypewriter && step === 1 ? (
                            <>
                                <TypeAnimation
                                    sequence={[
                                        'Hi, I am Musti',
                                        1000,
                                        'I’m here to help you with your supply request!',
                                        1000,
                                    ]}
                                    wrapper="h2"
                                    speed={50}
                                    cursor={false}
                                    className="text-lg font-light text-gray-900"
                                    repeat={0}
                                />
                                <TypeAnimation
                                    sequence={[
                                        5000, // Wait for title and subtitle to finish
                                        'Just tell me your supply needs (e.g., "50 kg of rice at N6500, can be used 50 times before it finishes"), and I’ll get the process started for you!',
                                        1000,
                                    ]}
                                    wrapper="p"
                                    speed={60}
                                    cursor={false}
                                    className="text-xs text-gray-500 mt-1"
                                    repeat={0}
                                />
                            </>
                        ) : (
                            <>
                                <h2 className="text-lg font-medium text-gray-900">New Supply Request</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Describe your supply needs to start the request process.
                                </p>
                            </>
                        )}
                    </div>
                    <Button onClick={() => { handleReset(); onClose(); }}>
                        <CloseCircle size={18} />
                        Close
                    </Button>
                </ModalHeader>
                <StepIndicator>
                    <StepDot active={step === 1}><Edit size={12} /></StepDot>
                    <StepDot active={step === 2}><Eye size={12} /></StepDot>
                    <StepDot active={step === 3}><Send size={12} /></StepDot>
                </StepIndicator>
                <ModalBody>
                    {step === 1 && (
                        <PromptStep
                            prompt={prompt}
                            setPrompt={setPrompt}
                            onSubmit={handlePromptSubmit}
                            subdomain={subdomain}
                            restaurantId={restaurantId}
                            userId={userId}
                        />
                    )}
                    {step === 2 && response?.supplyRequest && (
                        <ReviewStep
                            items={editedItems}
                            onUpdate={handleItemsUpdate}
                            onBack={handleBack}
                            supplyRequestId={response.supplyRequest.id}
                            subdomain={subdomain}
                            userId={userId}
                        />
                    )}
                    {step === 3 && response?.supplyRequest && (
                        <VendorStep
                            supplyRequestId={response.supplyRequest.id}
                            subdomain={subdomain}
                            userId={userId}
                            onSuccess={() => { handleReset(); onClose(); }}
                            onBack={handleBack}
                        />
                    )}
                </ModalBody>
            </ModalContent>
        </ModalOverlay>
    );
};

export default SupplyRequestModal;
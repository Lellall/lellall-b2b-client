// src/components/PromptStep.tsx
import React from 'react';
import { TextArea, Button } from './modal-styles';
import { useCreateSupplyRequestMutation, CreateSupplyRequestResponse } from '@/redux/api/gpt-supply-request/gpt-supply.api';
import { ArrowRight } from 'iconsax-react';

interface PromptStepProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onSubmit: (data: CreateSupplyRequestResponse) => void;
    subdomain: string;
    restaurantId: string;
    userId: string;
}

const PromptStep: React.FC<PromptStepProps> = ({
    prompt,
    setPrompt,
    onSubmit,
    subdomain,
    restaurantId,
    userId,
}) => {
    const [createSupplyRequest, { isLoading }] = useCreateSupplyRequestMutation();

    const handleSubmit = async () => {
        try {
            const response = await createSupplyRequest({
                subdomain,
                data: { text: prompt, restaurantId, userId },
            }).unwrap();
            onSubmit(response);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-900">Supply Request Prompt</label>
            <TextArea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., 50 kg of rice at 6500"
                className="w-full"
            />
            <div className="flex justify-end gap-2">
                <Button disabled={isLoading} onClick={handleSubmit} primary>
                    {isLoading ? 'Submitting...' : 'Submit'}
                    <ArrowRight size={16} />
                </Button>
            </div>
        </div>
    );
};

export default PromptStep;
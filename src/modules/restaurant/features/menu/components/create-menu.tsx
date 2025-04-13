import { StyledButton } from '@/components/button/button-lellall';
import Input from "@/components/input/input";
import { useCreateMenuMutation } from '@/redux/api/menu/menu.api';
import { theme } from '@/theme/theme';
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from "react-toastify";

type CreateMenuFormData = {
    name: string;
};

type CreateMenuFormProps = {
    subdomain: string;
    setMenuModal: aby;
    onSuccess?: () => void;
};

export const CreateMenuForm: React.FC<CreateMenuFormProps> = ({ subdomain, onSuccess, setMenuModal }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm<CreateMenuFormData>({
        defaultValues: {
            name: '',
        },
    });

    const [createMenu, { isLoading, error }] = useCreateMenuMutation();
    const [apiError, setApiError] = useState<string | null>(null);

    // Effect to handle error changes
    useEffect(() => {
        if (error) {
            // Type the error object based on your API response structure
            interface ApiError {
                status?: number;
                data?: {
                    statusCode?: number;
                    message?: string;
                    error?: string;
                };
            }

            const errorMessage = (error as ApiError)?.data?.message || 'An unexpected error occurred';
            setApiError(errorMessage);
            // Optionally show toast instead of inline error
            // toast.error(errorMessage, { position: "top-right" });
        } else {
            setApiError(null); // Clear error when there's no error
        }
    }, [error]); // Runs whenever the error state changes

    const onSubmit = async (data: CreateMenuFormData) => {
        try {
            await createMenu({ subdomain, data }).unwrap();
            reset();
            toast.success("Menu created successfully", {
                position: "top-right",
            });
            setMenuModal(false)
        } catch (err) {
            console.error('Failed to create menu:', err);
        }
    };
    const primaryColor = '#05431E';

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className='my-3 w-[300px]'>
                <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Menu name is required' }}
                    render={({ field }) => (
                        // <Input
                        //     width="100%"
                        //     label="Menu Name"
                        //     placeholder="Enter menu name (e.g., Lunch)"
                        //     error={errors.name?.message}
                        //     {...field}
                        // />
                        <>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Menu Name</label>
                            <input
                                {...field}
                                placeholder="Enter menu name (e.g., Lunch)"
                                className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            />
                            {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name.message}</p>}

                        </>
                    )}
                />

                {/* Display API error if it exists */}
                {apiError && (
                    <div style={{ color: theme.colors.error, marginTop: '8px' }}>
                        {apiError}
                    </div>
                )}

                <div className="mt-3">
                    <StyledButton
                        style={{ padding: '20px 15px', fontWeight: 300, float: 'right' }}
                        background={theme.colors.active}
                        color={theme.colors.secondary}
                        disabled={isLoading}
                        width='100px'
                        variant="outline"
                        type="submit"
                    >
                        {isLoading ? 'Creating...' : 'Create Menu'}
                    </StyledButton>
                </div>
            </div>
        </form>
    );
};
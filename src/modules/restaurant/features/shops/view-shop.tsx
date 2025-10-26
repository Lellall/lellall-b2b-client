import Breadcrumb from "@/components/ui/breadcrumb";
import styled from "styled-components";
import banner from '@/assets/banner.svg';
import circle from '@/assets/circle.svg';
import TabsLayout from "./tabs-layout";
import { useParams } from 'react-router-dom';
import { useGetBranchByIdQuery } from '@/redux/api/branches/branches.api';
import { Clock } from 'iconsax-react';

export const Banner = styled.div`
    background-image: url(${banner});
    background-size: cover;
    background-position: center;
    border-radius: 15px;
    width: 100%;
    height: 120px;
`;

const ViewShop = () => {
    const { branchId } = useParams<{ branchId: string }>();
    
    // Fetch branch details using the branchId from URL
    const { data: branch, isLoading, error } = useGetBranchByIdQuery(branchId || '');

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (error || !branch) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">Failed to load branch details. Please try again.</p>
            </div>
        );
    }

    // Get status color based on KYC status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-500';
            case 'PENDING': return 'bg-yellow-500';
            case 'REJECTED': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div>
            <Breadcrumb items={[
                { label: 'Shops', href: '/shops' },
                { label: branch.name }
            ]} />
            <div>
                <Banner>
                    <div className="p-4">
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                                <div className="flex flex-col">
                                    <div className="text-2xl font-bold text-white" style={{ marginTop: '15px' }}>
                                        {branch.name}
                                    </div>
                                    <div className="text-xs ml-1 mb-2 mt-1 flex font-light text-white">
                                        {branch.address} <img src={circle} className="mx-2" /> 
                                        <span style={{fontSize: '8px'}} className={`px-2 py-1 rounded-full text-xs ${getStatusColor(branch.kycStatus)}`}>
                                            {branch.kycStatus}
                                        </span> 
                                        <img src={circle} className="mx-2" /> Branch
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Banner>
                
                {/* PENDING Status Message */}
                {branch.kycStatus === 'PENDING' && (
                    <div className="mt-4 mx-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                    <Clock size="16" color="#f59e0b" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-amber-800 mb-1">
                                    Domain Setup in Progress
                                </h3>
                                <p className="text-xs text-amber-700 mb-2">
                                    Your new branch domain is being configured. This usually takes up to 24 hours to complete.
                                </p>
                                <p className="text-xs text-amber-600 mb-2">
                                    You can continue setting up users, menus, and other features while we work on your domain.
                                </p>
                                <div className="flex items-center space-x-1 text-xs text-amber-600">
                                    <span className="text-amber-600">📧</span>
                                    <span>Still pending after 24 hours? Contact us at </span>
                                    <a 
                                        href="mailto:support@lellall.com" 
                                        className="text-amber-800 font-medium hover:underline"
                                    >
                                        support@lellall.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <TabsLayout restaurantId={branch.id} />
            </div>
        </div>
    )
}

export default ViewShop
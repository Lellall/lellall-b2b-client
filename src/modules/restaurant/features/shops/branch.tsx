import { useState } from 'react';
import Card from './components/shop-card';
import img from '../.././../../../assets/placeholder.svg';
import { StyledButton } from '@/components/button/button-lellall';
import { Add } from 'iconsax-react';
import SearchBar from '@/components/search-bar/search-bar';
import { useNavigate } from 'react-router-dom';
import { useGetBranchesQuery } from '@/redux/api/branches/branches.api';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import AddBranchModal from './components/add-branch-modal';

const Branch = () => {
    const navigate = useNavigate();
    const { user } = useSelector(selectAuth);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Get parentId from user's restaurant
    const parentId = user?.ownedRestaurants?.[0]?.id || user?.restaurantId || '';
    
    // Fetch branches using the correct endpoint
    const { data: branches = [], isLoading, error } = useGetBranchesQuery(parentId);

    const handleAddBranch = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">Failed to load branches. Please try again.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex mb-5 justify-between">
                <div>
                    <SearchBar
                        placeholder="Search branches"
                        width="300px"
                        height="42px"
                        border="1px solid #fff"
                        borderRadius="10px"
                        backgroundColor="#ffffff"
                        shadow={false}
                        fontSize="11px"
                        color="#444"
                        inputPadding="10px"
                        placeholderColor="#bbb"
                        iconColor="#ccc"
                        iconSize={15}
                    />
                </div>
                <StyledButton 
                    style={{ padding: '19px 15px', fontWeight: 300 }} 
                    background={'#fff'} 
                    color="#000" 
                    width='130px' 
                    variant="outline"
                    onClick={handleAddBranch}
                >
                    <Add size="32" color="#000" /> Add Branch
                </StyledButton>
            </div>
            
            {branches.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                    <div className="text-muted-foreground mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No branches found</h3>
                    <p className="text-muted-foreground mb-4">Get started by creating your first branch</p>
                    <StyledButton
                        onClick={handleAddBranch}
                        background="hsl(var(--active))"
                        color="hsl(var(--secondary))"
                        width="120px"
                        variant="outline"
                    >
                        <Add size="16" className="mr-2" />
                        Add Branch
                    </StyledButton>
                </div>
            ) : (
                <div className='flex flex-wrap justify-left gap-4'>
                    {branches.map((branch) => (
                        <Card
                            key={branch.id}
                            imageSrc={img}
                            title={branch.name}
                            actionDotColor="bg-green-500"
                            onClick={() => navigate(`/branches/${branch.id}`)}
                        />
                    ))}
                </div>
            )}

            {/* Add Branch Modal */}
            <AddBranchModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                parentId={parentId}
            />
        </div>
    );
};

export default Branch;
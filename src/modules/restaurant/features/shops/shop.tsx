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
import EditBranchModal from './components/edit-branch-modal';
import DeleteBranchModal from './components/delete-branch-modal';
import { useState } from 'react';
import { Branch } from '@/redux/api/branches/branches.api';

const Shop = () => {
    const navigate = useNavigate();
    const { user } = useSelector(selectAuth);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    
    // Get parentId from user's ownedRestaurants array or restaurantId
    // For now, using the first restaurant. In the future, you might want to add restaurant selection
    const parentId = user?.ownedRestaurants?.[0]?.id || user?.restaurantId || '';
    const restaurantName = user?.ownedRestaurants?.[0]?.name || 'Restaurant';
    
    console.log('User data:', user);
    console.log('ParentId:', parentId);
    console.log('Restaurant Name:', restaurantName);
    console.log('ownedRestaurants:', user?.ownedRestaurants);
    console.log('restaurantId:', user?.restaurantId);
    
    // Fetch branches using the correct endpoint - only if we have a parentId
    const { data: branches = [], isLoading, error } = useGetBranchesQuery(parentId, {
        skip: !parentId, // Skip the query if parentId is empty
    });

    const handleAddBranch = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEditBranch = (branch: Branch) => {
        console.log('Edit branch clicked:', branch);
        console.log('Setting selectedBranch to:', branch);
        console.log('Setting isEditModalOpen to true');
        setSelectedBranch(branch);
        setIsEditModalOpen(true);
        console.log('State should be updated now');
    };

    const handleDeleteBranch = (branch: Branch) => {
        console.log('Delete branch clicked:', branch);
        console.log('Setting selectedBranch to:', branch);
        console.log('Setting isDeleteModalOpen to true');
        setSelectedBranch(branch);
        setIsDeleteModalOpen(true);
        console.log('State should be updated now');
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedBranch(null);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedBranch(null);
    };

    if (!parentId) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">No restaurant found. Please contact support.</p>
                <p className="text-sm text-muted-foreground mt-2">
                    User has {user?.ownedRestaurants?.length || 0} owned restaurants
                </p>
            </div>
        );
    }
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
            {/* Restaurant Header */}
            <div className="mb-4 p-4 bg-card rounded-lg ">
                <h2 className="text-lg  text-foreground">Manage Branches</h2>
                <p className="text-xs font-light">Manage and control different branches under <b>{restaurantName}</b></p>
            </div>
            
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
                <div className='flex flex-wrap justify-left gap-4 '>
                    {branches.map((branch) => (
                        <Card
                            key={branch.id}
                            imageSrc={img}
                            title={branch.name}
                            actionDotColor="bg-green-500"
                            onClick={() => navigate(`/branches/${branch.id}`)}
                            onEdit={() => handleEditBranch(branch)}
                            onDelete={() => handleDeleteBranch(branch)}
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

            {/* Edit Branch Modal */}
            <EditBranchModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                branch={selectedBranch}
            />

            {/* Delete Branch Modal */}
            <DeleteBranchModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                branch={selectedBranch}
            />
        </div>
    );
};

export default Shop;
import React, { useState } from 'react';
import styled from 'styled-components';

// Styled components for the modal
const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  width: 500px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 20px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  &.cancel {
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #374151;
  }
  &.save {
    background-color: #10b981;
    border: none;
    color: white;
  }
`;

const ModalComponent = () => {
  const [restaurants, setRestaurants] = useState(['']);

  // Function to add a new input field for restaurants
  const addRestaurantInput = () => {
    setRestaurants([...restaurants, '']);
  };

  // Function to handle changes in input fields
  const handleRestaurantChange = (index, value) => {
    const newRestaurants = [...restaurants];
    newRestaurants[index] = value;
    setRestaurants(newRestaurants);
  };

  return (
    <Modal className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <Title>Add New Branch</Title>
        <button className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div className="mb-4">
        <InputLabel htmlFor="branchName">Branch Name</InputLabel>
        <Input type="text" id="branchName" placeholder="type branch Name" className="w-full p-2 border border-gray-300 rounded" />
      </div>
        <InputLabel>Configure restaurants under this branch</InputLabel>
     <div className="flex justify-beetween">
     <div className="mb-4 flex flex-col ml-10">
        {restaurants.map((restaurant, index) => (
          <Input 
            key={index}
            type="text"
            value={restaurant}
            onChange={(e) => handleRestaurantChange(index, e.target.value)}
            placeholder={`Restaurant ${index + 1}`}
            className="w-[200px] p-2 border border-gray-300 rounded mb-2"
          />
        ))}
        {/* Placeholder for adding more inputs */}
        
      </div>
      <div className="flex items-center mb-4">
          <button className="text-gray-500 hover:text-gray-700" onClick={addRestaurantInput}>
            Add More
          </button>
        </div>
     </div>
      <ButtonContainer>
        <Button className="cancel">Cancel</Button>
        <Button className="save">Save</Button>
      </ButtonContainer>
    </Modal>
  );
};

export default ModalComponent;
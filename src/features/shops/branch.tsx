import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import styled from "styled-components";
import { useState } from 'react';
import { StyledButton } from "@/components/button/button-lellall";
import { Add } from "iconsax-react";
import ModalComponent from "./components/branch-modal";

const ModAccordion = styled(Accordion)`
   border: none;
   display: flex;
   flex-wrap: wrap; 
   overflow-x: auto; 
   gap: 20px; 
`;

const AccordionItemWrapper = styled.div`
  width: 360px; 
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
`;

const StyledAccordionTrigger = styled(AccordionTrigger)`
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  width: 100%;
  text-align: left;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    background-color: #e5e7eb;
  }
`;

const StyledAccordionContent = styled(AccordionContent)`
  padding: 12px 16px;
`;

const ListItem = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
  border-top: 1px solid #e5e7eb;
  cursor: pointer;

  &:hover {
    background-color: #f3f4f6;
  }

  &:first-child {
    border-top: none;
  }
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  background-color: #333;
  border-radius: 50%;
  position: absolute;
  left: 5px; /* Adjust based on your padding */
  top: 50%;
  transform: translateY(-50%);
`;

const DeleteIcon = styled.div`
  color: red;
  cursor: pointer;
  margin-left: 10px
`;

const AddButton = styled.button`
  background-color: #fff;
  color: #333;
  border: none;
  padding: 8px 16px;
  margin-top: 10px;
  cursor: pointer;
  border-radius: 4px;
  display: block;
  margin: 0 auto; /* Center the button */
  &:hover {
    background-color: #0056b3;
  }
`;

export function AccordionDemo() {
    // State for each accordion
    const [accordionStates, setAccordionStates] = useState(
        Array.from({ length: 3 }, (_, index) => ({
            value: `item-${index + 1}`,
            title: `Branches ${index + 1}`,
            inputs: []
        }))
    );

    // Function to add input for a specific accordion
    const addInput = (accordionIndex) => {
        setAccordionStates(prevStates => {
            const newStates = [...prevStates];
            newStates[accordionIndex] = {
                ...newStates[accordionIndex],
                inputs: [
                    ...newStates[accordionIndex].inputs,
                    { id: newStates[accordionIndex].inputs.length + 1, value: '' }
                ]
            };
            return newStates;
        });
    };

    // Function to handle input change for a specific accordion
    const handleChange = (accordionIndex, inputId, newValue) => {
        setAccordionStates(prevStates => {
            const updatedInputs = prevStates[accordionIndex].inputs.map(input =>
                input.id === inputId ? { ...input, value: newValue } : input
            );
            const newStates = [...prevStates];
            newStates[accordionIndex] = {
                ...newStates[accordionIndex],
                inputs: updatedInputs
            };
            return newStates;
        });
    };

    // Function to delete input for a specific accordion
    const deleteInput = (accordionIndex, inputId) => {
        setAccordionStates(prevStates => {
            const newInputs = prevStates[accordionIndex].inputs.filter(input => input.id !== inputId);
            const newStates = [...prevStates];
            newStates[accordionIndex] = {
                ...newStates[accordionIndex],
                inputs: newInputs
            };
            return newStates;
        });
    };

    // Function to handle editable title changes
    const handleTitleChange = (accordionIndex, newTitle) => {
        setAccordionStates(prevStates => {
            const newStates = [...prevStates];
            newStates[accordionIndex] = {
                ...newStates[accordionIndex],
                title: newTitle
            };
            return newStates;
        });
    };

    const defaultExpanded = accordionStates.map(item => item.value);

    return (
        <>
        <ModAccordion
            type="multiple"
            defaultValue={defaultExpanded}
            collapsible
            className="w-full"
        >
            {accordionStates.map((item, index) => (
                <AccordionItemWrapper key={item.value}>
                    <AccordionItem value={item.value}>
                        <StyledAccordionTrigger>
                            <div 
                                className="py-2 px-3 mr-1 bg-gray-100 rounded w-full" 
                                contentEditable="true"
                                onBlur={(e) => handleTitleChange(index, e.currentTarget.textContent)}
                                suppressContentEditableWarning={true}
                            >
                                {item.title}
                            </div>
                        </StyledAccordionTrigger>
                        <StyledAccordionContent>
                            {item.inputs.map(input => (
                                <ListItem key={input.id} style={{ position: 'relative' }}>
                                    <Dot />
                                    <input
                                        type="text"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2`}
                                        value={input.value}
                                        onChange={(e) => handleChange(index, input.id, e.target.value)}
                                        placeholder="Enter branch name"
                                    />
                                    <DeleteIcon onClick={() => deleteInput(index, input.id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </DeleteIcon>
                                </ListItem>
                            ))}
                            <div className="my-2 mb-2 flex justify-center">
                                <StyledButton onClick={() => addInput(index)} style={{ padding: '19px 15px', fontWeight: 300,}} background={'#fff'} color="#000" width='130px' variant="outline">
                                    <Add size="32" color="#000" /> Add Sub Chain
                                </StyledButton>
                            </div>
                        </StyledAccordionContent>
                    </AccordionItem>
                </AccordionItemWrapper>
            ))}
        </ModAccordion>
        {/* <ModalComponent /> */}
        </>
    )
}
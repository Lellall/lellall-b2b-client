// src/styles/modalStyles.ts
import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3); /* Light overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: #FFFFFF;
  width: 700px; /* Larger modal */
  max-height: 85vh;
  border-radius: 12px; /* Softer corners */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #E5E7EB;
  position: relative;
  /* Subtle SVG background pattern */
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0a10 10 0 100 20A10 10 0 0010 0zm0 18a8 8 0 110-16 8 8 0 010 16z' fill='%23F3F4F6' fill-opacity='0.1'/%3E%3C/svg%3E");
  background-repeat: repeat;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #E5E7EB;
`;

export const ModalBody = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: transparent; /* Let SVG pattern show through */
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  position: relative;
  /* SVG line connecting steps */
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 25%;
    right: 25%;
    height: 2px;
    background: url("data:image/svg+xml,%3Csvg width='100' height='2' viewBox='0 0 100 2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 1h100' stroke='%23D1D5DB' stroke-width='2'/%3E%3C/svg%3E");
    z-index: 0;
  }
`;

export const StepDot = styled.div<{ active: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) => (props.active ? '#14532D' : '#F3F4F6')};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  transition: background 0.3s ease, transform 0.3s ease;
  transform: ${(props) => (props.active ? 'scale(1.2)' : 'scale(1)')};
  color: #FFFFFF;
  font-size: 0.75rem;
`;

export const Button = styled.button<{ primary?: boolean }>`
  padding: 0.5rem 1.25rem;
  border: 1px solid ${(props) => (props.primary ? '#14532D' : '#E5E7EB')};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${(props) => (props.primary ? '#14532D' : '#FFFFFF')};
  color: ${(props) => (props.primary ? '#FFFFFF' : '#1F2937')};
  transition: background 0.2s ease, color 0.2s ease, transform 0.1s ease;
  &:hover {
    background: ${(props) => (props.primary ? '#0F3D24' : '#F9FAFB')};
    transform: translateY(-1px);
  }
  &:disabled {
    background: #F3F4F6;
    color: #9CA3AF;
    border-color: #F3F4F6;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #FFFFFF;
  transition: border-color 0.2s ease;
  &:focus {
    outline: none;
    border-color: #14532D;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #FFFFFF;
  resize: vertical;
  transition: border-color 0.2s ease;
  &:focus {
    outline: none;
    border-color: #14532D;
  }
`;

import React from "react"
import styled from "styled-components"
import "tailwindcss/tailwind.css"

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  position?: "center" | "left" | "right" | "top" | "bottom"
  width?: string
  children: React.ReactNode
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalContent = styled.div<{ position: ModalProps["position"]; open: boolean; width?: string }>`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: ${(props) => props.width || "100%"}; // Use the width prop if provided, otherwise default to 100%
  position: absolute;
  transition: all 0.3s ease;
  overflow-y: auto;

  ${(props) =>
    props.position === "center" &&
    `
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `}
  ${(props) =>
    props.position === "left" &&
    `
    left: 0;
    top: 0;
    height: 100%;
    transform: translateX(-100%);
  `}
  ${(props) =>
    props.position === "right" &&
    `
    right: 0;
    top: 0;
    height: 100%;
    transform: translateX(100%);
  `}
  ${(props) =>
    props.position === "top" &&
    `
    top: 0;
    left: 0;
    right: 0;
    transform: translateY(-100%);
    width: auto;
  `}
  ${(props) =>
    props.position === "bottom" &&
    `
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(100%);
    width: auto;
  `}
  ${(props) =>
    props.open &&
    `
    transform: translate(0, 0);
  `}
`

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, position = "center", children }) => {
  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent position={position} open={isOpen} onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContent>
    </ModalOverlay>
  )
}

export default Modal

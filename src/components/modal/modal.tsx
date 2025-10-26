import React from "react";
import styled from "styled-components";
import "tailwindcss/tailwind.css";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  position?: "center" | "left" | "right" | "top" | "bottom";
  width?: string;
  variant?: "modal" | "wizard";
  title?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

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
`;

const ModalContent = styled.div<{
  position: ModalProps["position"];
  open: boolean;
  width?: string;
  variant?: ModalProps["variant"];
  size?: ModalProps["size"];
}>`
  background: white;
  border-radius: 16px;
  position: absolute;
  transition: all 0.3s ease;
  overflow-y: auto;

  /* Base padding */
  padding: ${({ variant }) => (variant === "wizard" ? "2rem" : "1.5rem")};

  /* Size handling */
  ${({ size }) => {
    switch (size) {
      case "sm":
        return "width: 400px; max-width: 90vw;";
      case "lg":
        return "width: 800px; max-width: 90vw;";
      default:
        return "width: 600px; max-width: 90vw;";
    }
  }}

  /* Width handling */
  ${({ width, variant }) => `
    width: ${width || (variant === "wizard" ? "100%" : "auto")};
    max-width: ${width ? "none" : (variant === "wizard" ? "64rem" : "32rem")};
  `}

  /* Position-specific styles */
  ${(props) =>
    props.open &&
    props.position === "center" &&
    `
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
  `}

  ${(props) =>
    props.open &&
    props.position !== "center" &&
    `
    transform: translate(0, 0);
  `}

  ${(props) =>
    props.position === "left" &&
    `
    left: 0;
    top: 0;
    height: 100%;
    transform: translateX(${props.open ? "0" : "-100%"});
  `}

  ${(props) =>
    props.position === "right" &&
    `
    right: 0;
    top: 0;
    height: 100%;
    transform: translateX(${props.open ? "0" : "100%"});
  `}

  ${(props) =>
    props.position === "top" &&
    `
    top: 0;
    left: 0;
    right: 0;
    transform: translateY(${props.open ? "0" : "-100%"});
  `}

  ${(props) =>
    props.position === "bottom" &&
    `
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(${props.open ? "0" : "100%"});
  `}
`;

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  position = "center",
  width,
  variant = "modal",
  title,
  size = "md",
  children,
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent
        position={position}
        open={isOpen}
        width={width}
        variant={variant}
        size={size}
        onClick={(e) => e.stopPropagation()}
        className="border border-gray-200"
      >
        {title && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
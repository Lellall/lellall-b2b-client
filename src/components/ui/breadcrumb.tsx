import React from "react";
import styled from "styled-components";

const BreadcrumbContainer = styled.nav`
  display: flex;
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 1rem;
`;

const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BreadcrumbItem = styled.li`
  display: inline-flex;
  align-items: center;
  &::after {
    content: "/";
    margin-left: 0.5rem;
    color: inherit;
  }
  &:last-child::after {
    content: none;
  }
`;

const BreadcrumbLink = styled.a`
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  &:hover {
    color: #2563eb;
  }
`;

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => (
  <BreadcrumbContainer aria-label="Breadcrumb">
    <BreadcrumbList>
      {items.map((item, index) => (
        <BreadcrumbItem key={index}>
          {item.href ? <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink> : <span aria-current="page">{item.label}</span>}
        </BreadcrumbItem>
      ))}
    </BreadcrumbList>
  </BreadcrumbContainer>
);

export default Breadcrumb;

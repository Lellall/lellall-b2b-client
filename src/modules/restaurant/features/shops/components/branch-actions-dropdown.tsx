import React, { useState, useRef, useEffect } from 'react';
import { More, Edit, Trash } from 'iconsax-react';

interface BranchActionsDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
}

const BranchActionsDropdown: React.FC<BranchActionsDropdownProps> = ({ onEdit, onDelete }) => {
  console.log('BranchActionsDropdown render - onEdit:', typeof onEdit, 'onDelete:', typeof onDelete);
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    console.log('handleEdit called in dropdown');
    setIsOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    console.log('handleDelete called in dropdown');
    setIsOpen(false);
    onDelete();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <More size="20px" color="#000" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-4 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit size="16" color="#666" />
              Edit Branch
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash size="16" color="#dc2626" />
              Delete Branch
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchActionsDropdown;

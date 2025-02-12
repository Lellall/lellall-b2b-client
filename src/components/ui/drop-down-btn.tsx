import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface StatusDropdownProps {
  options: string[];
  onSelect?: (status: string) => void;
  initialStatus?: string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ options, onSelect, initialStatus }) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || options[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (status: string) => {
    setSelectedStatus(status);
    onSelect && onSelect(status);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative font-light w-fit" ref={dropdownRef}>
      <div
        className="flex items-center gap-2 text-sm px-4 py-3 ml-2 rounded-lg cursor-pointer bg-white text-green-900 "
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span>{selectedStatus}</span>
        <ChevronDown className="w-5 h-5 text-green-700" />
      </div>

      {showDropdown && (
        <div className="absolute z-10 mt-2 bg-white border-gray-300 shadow-md rounded-lg p-2 w-full">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 text-xs text-gray-800 cursor-pointer hover:bg-gray-200 rounded-md"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;

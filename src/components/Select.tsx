import React, { useState } from 'react';
import { SelectProps } from '../types';

const Select: React.FC<SelectProps> = ({ 
    options, 
    defaultValue, 
    onChange,
    placeholder = 'Seçiniz' 
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<string | undefined>(defaultValue);

    const toggleDropdown = (): void => {
        setIsOpen(!isOpen);
    };

    const selectOption = (option: string): void => {
        setSelectedOption(option);
        setIsOpen(false);
        onChange?.(option);
    };

    return (
        <div className="relative w-40">
            <div
                className="w-full p-2 border rounded-lg bg-white flex items-center justify-between cursor-pointer"
                onClick={toggleDropdown}
            >
                <span className="text-sm">{selectedOption || placeholder}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {isOpen && (
                <div className="absolute mt-1 w-full bg-white border rounded shadow-lg z-10">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                            onClick={() => selectOption(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Select;

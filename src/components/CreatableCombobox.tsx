import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CreatableCombobox.css';

interface CreatableComboboxProps {
    value: string;
    options: string[]; // List of existing batch names
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

export const CreatableCombobox: React.FC<CreatableComboboxProps> = ({
    value,
    options,
    onChange,
    placeholder = 'Choose or create...',
    label
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        // Filter options
        const filtered = options.filter(opt =>
            opt.toLowerCase().includes(val.toLowerCase())
        );
        setFilteredOptions(filtered);
        setIsOpen(true);
    };

    const handleSelectOption = (option: string) => {
        setInputValue(option);
        onChange(option);
        setIsOpen(false);
    };



    const handleFocus = () => {
        setFilteredOptions(options);
        setIsOpen(true);
    };

    const showCreateOption = inputValue.trim() &&
        !options.some(opt => opt.toLowerCase() === inputValue.toLowerCase());

    return (
        <div className="creatable-combobox" ref={wrapperRef}>
            {label && <label className="combobox-label">{label}</label>}
            <div className="combobox-input-wrapper">
                <input
                    type="text"
                    className="combobox-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    className="combobox-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronDown size={16} className={isOpen ? 'rotate' : ''} />
                </button>
            </div>

            {isOpen && (
                <div className="combobox-dropdown">
                    <div className="combobox-options">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="combobox-option"
                                    onClick={() => handleSelectOption(option)}
                                >
                                    {option}
                                </button>
                            ))
                        ) : !showCreateOption && (
                            <div className="combobox-empty">No matches found</div>
                        )}

                        {/* The "Create" action is now always visible or shows as a prompt when typing a new name */}
                        {(!inputValue.trim() || showCreateOption) && (
                            <button
                                type="button"
                                className="combobox-option create-option"
                                onClick={() => {
                                    const name = inputValue.trim() || 'New Batch';
                                    setInputValue(name);
                                    handleSelectOption(name);
                                }}
                            >
                                <span className="create-plus">+</span>
                                <span>{inputValue.trim() ? `Create "${inputValue}"` : "Create new batch"}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

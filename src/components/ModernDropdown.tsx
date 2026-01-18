import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import './ModernDropdown.css';

interface Option {
    label: string;
    subtext?: string;
    value: string;
    icon?: React.ReactNode;
}

interface ModernDropdownProps {
    label?: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    icon?: React.ReactNode;
    placeholder?: string;
    showSearch?: boolean;
    searchPlaceholder?: string;
}

export const ModernDropdown: React.FC<ModernDropdownProps> = ({
    label,
    value,
    options,
    onChange,
    icon,
    placeholder = 'Select',
    showSearch = false,
    searchPlaceholder = 'Search...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowerSearch = searchTerm.toLowerCase();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(lowerSearch)
        );
    }, [options, searchTerm]);

    // Close on click outside and Reset search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            if (showSearch) {
                setTimeout(() => searchInputRef.current?.focus(), 0);
            }
        } else {
            setSearchTerm('');
            setHighlightedIndex(-1);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, showSearch]);

    // Keyboard Navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                } else if (filteredOptions.length === 1) {
                    handleSelect(filteredOptions[0].value);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            case 'Tab':
                setIsOpen(false);
                break;
        }
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    // Check if any option in the list actually has an icon to avoid empty left padding
    const hasIcons = useMemo(() => options.some(opt => !!opt.icon), [options]);

    return (
        <div
            className={`modern-dropdown ${isOpen ? 'open' : ''}`}
            ref={dropdownRef}
            onKeyDown={handleKeyDown}
        >
            <button
                className="dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                {icon && <span className="trigger-icon">{icon}</span>}
                <span className="trigger-label">
                    {value === 'all' && label ? `All ${label}s` : displayLabel}
                </span>
                <ChevronDown className={`chevron-icon ${isOpen ? 'rotate' : ''}`} size={16} />
            </button>

            {isOpen && (
                <div className={`dropdown-menu ${hasIcons ? 'has-icons' : ''}`} role="listbox">
                    {showSearch && (
                        <div className="dropdown-search-wrapper">
                            <Search size={14} className="search-icon-inline" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="dropdown-search-input"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setHighlightedIndex(0);
                                }}
                            />
                        </div>
                    )}
                    <div className="dropdown-scroll">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <button
                                    key={option.value}
                                    className={`dropdown-item ${option.value === value ? 'selected' : ''} ${highlightedIndex === index ? 'highlighted' : ''}`}
                                    onClick={() => handleSelect(option.value)}
                                    role="option"
                                    aria-selected={option.value === value}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    {/* 1. Icon Column - Only rendered if the dropdown supports icons */}
                                    {hasIcons && (
                                        <span className="item-icon">{option.icon}</span>
                                    )}

                                    {/* 2. Label Column */}
                                    <div className="item-content">
                                        <div className="item-label-main">{option.label}</div>
                                        {option.subtext && <div className="item-subtext">{option.subtext}</div>}
                                    </div>

                                    {/* 3. Check Column */}
                                    {option.value === value ? (
                                        <Check size={16} className="check-icon" />
                                    ) : (
                                        <div />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="dropdown-no-results">No results</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

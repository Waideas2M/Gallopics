import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import './ModernDropdown.css';



interface Option {
    label: string;
    subtext?: string;
    description?: string; // New: Detailed purpose / description
    value: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

interface ModernDropdownProps {
    label?: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    icon?: React.ReactNode;
    placeholder?: string;
    searchPlaceholder?: string;
    showSearch?: boolean;
    variant?: 'default' | 'pill'; // New prop
    disabled?: boolean;
}

export const ModernDropdown: React.FC<ModernDropdownProps> = ({
    value,
    options,
    onChange,
    icon,
    placeholder = 'Select',
    showSearch = false,
    searchPlaceholder = 'Search...',
    variant = 'default',
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
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
            // If using portal, the menu is outside dropdownRef, so we must check if click is inside menu
            // But usually checking if click is NOT in dropdownRef is enough if we handle portal clicks?
            // Actually, if we click component in portal, it might not bubble to dropdownRef if logic differs.
            // But we attach listener to document.
            // If we click MENU (portal), we don't want to close?
            // We need a ref for the menu too.
            // However, typical dropdown behavior: click option -> close. Click outside -> close.
            // If click inside search? Don't close.
            // So we need to check if target is inside dropdownRef OR inside the portal content.
            // Since portal content is standard DOM, we can check .dropdown-menu-portal?

            const target = event.target as Node;
            const menuEl = document.querySelector('.modern-dropdown-portal-menu');

            // Check if click is inside trigger (dropdownRef) OR inside portal menu
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(target) &&
                (!menuEl || !menuEl.contains(target))
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);

            // Calculate Position for Portal (Mobile Only Logic check or Always?)
            // Strict Scope says "Mobile Only".
            if (window.innerWidth <= 768 && dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                const scrollX = window.scrollX || 0;
                const scrollY = window.scrollY || 0;

                // Adjust for right edge collision
                let left = rect.left + scrollX;
                const minWidth = 280;
                if (left + minWidth > window.innerWidth - 16) {
                    left = window.innerWidth - minWidth - 16;
                    if (left < 16) left = 16;
                }

                setMenuPosition({
                    top: rect.bottom + scrollY + 6,
                    left,
                    width: Math.max(minWidth, rect.width)
                });

                if (showSearch) {
                    // Focus needs delay for portal rendering
                    setTimeout(() => {
                        const input = document.querySelector('.modern-dropdown-portal-menu .dropdown-search-input') as HTMLInputElement;
                        input?.focus();
                    }, 50);
                }
            } else {
                setMenuPosition(null); // Explicit null implies inline rendering (Desktop)
                if (showSearch) {
                    setTimeout(() => searchInputRef.current?.focus(), 0);
                }
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

    // RENDER CONTENT GENERATOR
    const renderMenuContent = (isPortal = false) => (
        <div
            className={`dropdown-menu ${hasIcons ? 'has-icons' : ''} ${isPortal ? 'modern-dropdown-portal-menu' : ''}`}
            role="listbox"
            style={isPortal && menuPosition ? {
                position: 'absolute',
                top: menuPosition.top,
                left: menuPosition.left,
                width: 'auto', // CSS min-width handles it
                zIndex: 9999,
                margin: 0
            } : undefined}
        >
            {showSearch && (
                <div className="dropdown-search-wrapper">
                    <Search size={14} className="search-icon-inline" />
                    <input
                        ref={isPortal ? null : searchInputRef}
                        type="text"
                        className="dropdown-search-input"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setHighlightedIndex(0);
                        }}
                        autoFocus={!isPortal && showSearch}
                    />
                </div>
            )}
            <div className="dropdown-scroll">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => (
                        <button
                            key={option.value}
                            className={`dropdown-item ${option.value === value ? 'selected' : ''} ${highlightedIndex === index ? 'highlighted' : ''} ${option.disabled ? 'disabled' : ''}`}
                            onClick={() => !option.disabled && handleSelect(option.value)}
                            role="option"
                            aria-selected={option.value === value}
                            aria-disabled={option.disabled}
                            onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                        >
                            {/* 1. Icon Column */}
                            {hasIcons && (
                                <span className="item-icon">{option.icon}</span>
                            )}

                            {/* 2. Label Column */}
                            <div className="item-content">
                                <div className="item-label-main">{option.label}</div>
                                {option.subtext && <div className="item-subtext">{option.subtext}</div>}
                                {option.description && <div className="item-description">{option.description}</div>}
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
    );

    return (
        <div
            className={`modern-dropdown ${isOpen ? 'open' : ''} variant-${variant}`}
            ref={dropdownRef}
            onKeyDown={handleKeyDown}
        >
            <button
                className={`dropdown-trigger ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                disabled={disabled}
            >
                {icon && <span className="trigger-icon">{icon}</span>}
                <div className="trigger-content">
                    <span className="trigger-label">
                        {displayLabel}
                    </span>
                    {selectedOption?.subtext && (
                        <span className="trigger-subtext">{selectedOption.subtext}</span>
                    )}
                </div>
                <ChevronDown className={`chevron-icon ${isOpen ? 'rotate' : ''}`} size={16} />
            </button>

            {isOpen && (
                menuPosition ?
                    createPortal(renderMenuContent(true), document.body)
                    : renderMenuContent(false)
            )}
        </div>
    );
};

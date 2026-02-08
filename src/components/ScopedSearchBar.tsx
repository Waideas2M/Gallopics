import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Image, ChevronRight } from 'lucide-react';
import { HorseIcon } from './icons/HorseIcon';
import { RiderIcon } from './icons/RiderIcon';
import './ScopedSearchBar.css';

/**
 * SearchDropdown_v2 (guest-flow)
 * Used in guest-flow profile/event search fields to provide a structured,
 * grouped dropdown experience mirroring the global header search.
 * Global header uses separate components; this is a scoped variant.
 */
export interface ScopedSearchOption {
    label: string;
    value: string;
    type?: 'rider' | 'horse' | 'photo';
    subtitle?: string;
    id?: string;
}

interface ScopedSearchBarProps {
    placeholder: string;
    onSelect: (value: string) => void;
    onSearchChange?: (value: string) => void;
    currentValue: string;
    options: ScopedSearchOption[];
    variant?: 'v1' | 'v2';
}

export const ScopedSearchBar: React.FC<ScopedSearchBarProps> = ({
    placeholder,
    onSelect,
    onSearchChange,
    currentValue,
    options,
    variant = 'v1'
}) => {
    // If currentValue is 'All', we show empty string or just the placeholder
    const [inputValue, setInputValue] = useState(currentValue === 'All' ? '' : currentValue);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync internal state if parent updates currentValue externally (e.g. Reset button)
    useEffect(() => {
        setInputValue(currentValue === 'All' ? '' : currentValue);
    }, [currentValue]);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) && opt.value !== 'All'
    );

    // Grouping for v2
    const groupedResults = filteredOptions.reduce((acc, curr) => {
        const type = curr.type || 'other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(curr);
        return acc;
    }, {} as Record<string, ScopedSearchOption[]>);

    const groupOrder = ['rider', 'horse', 'photo', 'other'];

    const handleSelect = (val: string) => {
        onSelect(val);
        if (onSearchChange) onSearchChange(val); // Also trigger search update on selection
        setInputValue(val === 'All' ? '' : val);
        setIsFocused(false);
        setSelectedIndex(-1);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect('All');
        if (onSearchChange) onSearchChange('');
        setInputValue('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isFocused || filteredOptions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredOptions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            handleSelect(filteredOptions[selectedIndex].value);
        } else if (e.key === 'Escape') {
            setIsFocused(false);
        }
    };

    // Outside click handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // Check if click is inside wrapper or inside portal menu
            const portalMenu = document.querySelector('.scoped-portal-menu');

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(target) &&
                (!portalMenu || !portalMenu.contains(target))
            ) {
                setIsFocused(false);
            }
        };

        if (isFocused) {
            document.addEventListener('mousedown', handleClickOutside);

            // Calculate portal position on mobile
            if (window.innerWidth <= 768 && wrapperRef.current) {
                const updatePosition = () => {
                    if (wrapperRef.current) {
                        const rect = wrapperRef.current.getBoundingClientRect();
                        setDropdownPosition({
                            top: rect.bottom + window.scrollY + 4,
                            left: rect.left + window.scrollX,
                            width: rect.width
                        });
                    }
                };

                updatePosition();
                window.addEventListener('scroll', updatePosition);
                window.addEventListener('resize', updatePosition);

                return () => {
                    document.removeEventListener('mousedown', handleClickOutside);
                    window.removeEventListener('scroll', updatePosition);
                    window.removeEventListener('resize', updatePosition);
                };
            } else {
                setDropdownPosition(null);
            }
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isFocused]);

    const getIcon = (type?: string) => {
        switch (type) {
            case 'rider': return <RiderIcon size={16} />;
            case 'horse': return <HorseIcon size={16} />;
            case 'photo': return <Image size={16} />;
            default: return <Search size={16} />;
        }
    };

    const getGroupLabel = (type: string) => {
        switch (type) {
            case 'rider': return 'RIDERS';
            case 'horse': return 'HORSES';
            case 'photo': return 'PHOTOS';
            default: return 'OTHER';
        }
    };

    // Render Content Logic
    const renderDropdownContent = (isPortal = false) => (
        <div
            className={`scoped-results-dropdown ${variant === 'v2' ? 'v2-variant' : ''} ${isPortal ? 'scoped-portal-menu' : ''}`}
            style={isPortal && dropdownPosition ? {
                position: 'fixed', // Fixed to stick to screen/viewport logic or Absolute to doc
                // User requested: "Render ... via portal ... position: fixed (mobile only)"
                // But if I use fixed, top/left should be rect.bottom (viewport relative)
                // rect.bottom from getBoundingClientRect IS viewport relative.
                // So if I use `position: fixed`, I use `rect.bottom`.
                // However, previous calculation used `window.scrollY`. 
                // Let's adjust to Fixed.
                top: dropdownPosition.top - window.scrollY, // Correct back to viewport rel for Fixed
                left: dropdownPosition.left - window.scrollX,
                width: dropdownPosition.width,
                zIndex: 9999,
                maxHeight: 'min(50vh, 320px)'
            } : undefined}
        >
            {filteredOptions.length > 0 ? (
                variant === 'v2' ? (
                    groupOrder.map(type => {
                        const groupItems = groupedResults[type];
                        if (!groupItems) return null;

                        return (
                            <div key={type} className="scoped-result-group">
                                <div className="scoped-group-header">{getGroupLabel(type)}</div>
                                {groupItems.map((opt) => {
                                    const isFocusedRow = filteredOptions.indexOf(opt) === selectedIndex;
                                    return (
                                        <div
                                            key={opt.value}
                                            className={`scoped-search-result-item v2-item ${isFocusedRow ? 'focused' : ''}`}
                                            onClick={() => handleSelect(opt.value)}
                                        >
                                            <div className={`scoped-result-icon-box type-${opt.type}`}>
                                                {getIcon(opt.type)}
                                            </div>
                                            <div className="scoped-result-text-stack">
                                                <span className="scoped-result-title">{opt.label}</span>
                                                {opt.subtitle && <span className="scoped-result-subtitle">{opt.subtitle}</span>}
                                            </div>
                                            <ChevronRight size={14} className="scoped-result-arrow" />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                ) : (
                    filteredOptions.map((opt) => (
                        <div
                            key={opt.value}
                            className="scoped-search-result-item"
                            onClick={() => handleSelect(opt.value)}
                        >
                            <span className="scoped-result-text">{opt.label}</span>
                        </div>
                    ))
                )
            ) : (
                <div className="scoped-no-results">No matches</div>
            )}
        </div>
    );

    return (
        <div className="scoped-search-wrapper" ref={wrapperRef}>
            <div className="scoped-search-bar">
                <Search className="scoped-search-icon" size={20} />
                <input
                    ref={inputRef}
                    type="text"
                    className="scoped-search-input"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => {
                        const val = e.target.value;
                        setInputValue(val);
                        if (onSearchChange) onSearchChange(val);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                />
                {inputValue && (
                    <button className="scoped-clear-btn" onClick={handleClear}>
                        <X size={14} />
                    </button>
                )}
            </div>

            {isFocused && (filteredOptions.length > 0 || inputValue.length > 0) && (
                dropdownPosition ?
                    createPortal(renderDropdownContent(true), document.body)
                    : renderDropdownContent(false)
            )}
        </div>
    );
};

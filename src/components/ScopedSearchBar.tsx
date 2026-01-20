import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import './ScopedSearchBar.css';

interface ScopedSearchBarProps {
    placeholder: string;
    onSelect: (value: string) => void;
    onSearchChange?: (value: string) => void;
    currentValue: string;
    options: { label: string; value: string }[];
}

export const ScopedSearchBar: React.FC<ScopedSearchBarProps> = ({
    placeholder,
    onSelect,
    onSearchChange,
    currentValue,
    options
}) => {
    // If currentValue is 'All', we show empty string or just the placeholder
    const [inputValue, setInputValue] = useState(currentValue === 'All' ? '' : currentValue);
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync internal state if parent updates currentValue externally (e.g. Reset button)
    useEffect(() => {
        setInputValue(currentValue === 'All' ? '' : currentValue);
    }, [currentValue]);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) && opt.value !== 'All'
    );

    const handleSelect = (val: string) => {
        onSelect(val);
        if (onSearchChange) onSearchChange(val); // Also trigger search update on selection
        setInputValue(val === 'All' ? '' : val);
        setIsFocused(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect('All');
        if (onSearchChange) onSearchChange('');
        setInputValue('');
    };

    // Outside click handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="scoped-search-wrapper" ref={wrapperRef}>
            <div className="scoped-search-bar">
                <Search className="scoped-search-icon" size={20} />
                <input
                    type="text"
                    className="scoped-search-input"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => {
                        const val = e.target.value;
                        setInputValue(val);
                        if (onSearchChange) onSearchChange(val);
                    }}
                    onFocus={() => setIsFocused(true)}
                />
                {inputValue && (
                    <button className="scoped-clear-btn" onClick={handleClear}>
                        <X size={14} />
                    </button>
                )}
            </div>

            {isFocused && (filteredOptions.length > 0 || inputValue.length > 0) && (
                <div className="scoped-results-dropdown">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                className="scoped-search-result-item"
                                onClick={() => handleSelect(opt.value)}
                            >
                                <span className="scoped-result-text">{opt.label}</span>
                            </div>
                        ))
                    ) : (
                        <div className="scoped-no-results">No matches</div>
                    )}
                </div>
            )}
        </div>
    );
};

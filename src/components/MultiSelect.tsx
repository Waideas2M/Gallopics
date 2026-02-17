import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import './MultiSelect.css';

interface Option {
    label: string;
    value: string;
    subtext?: string;
    icon?: string;
}

interface MultiSelectProps {
    label?: string;
    values: string[];
    options: Option[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    values,
    options,
    onChange,
    placeholder = 'Select options',
    searchPlaceholder = 'Search...',
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowerSearch = searchTerm.toLowerCase();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(lowerSearch)
        );
    }, [options, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const menuEl = document.querySelector('.multi-select-portal-menu');

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
            if (dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                const scrollX = window.scrollX || 0;
                const scrollY = window.scrollY || 0;

                setMenuPosition({
                    top: rect.bottom + scrollY + 4,
                    left: rect.left + scrollX,
                    width: Math.max(280, rect.width)
                });
            }
        } else {
            setSearchTerm('');
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggleOption = (optionValue: string) => {
        if (values.includes(optionValue)) {
            onChange(values.filter(v => v !== optionValue));
        } else {
            onChange([...values, optionValue]);
        }
    };

    const handleRemoveTag = (e: React.MouseEvent, optionValue: string) => {
        e.stopPropagation();
        onChange(values.filter(v => v !== optionValue));
    };

    const selectedOptions = options.filter(opt => values.includes(opt.value));

    const renderMenuContent = () => (
        <div
            className="multi-select-menu multi-select-portal-menu"
            style={menuPosition ? {
                position: 'absolute',
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                zIndex: 9999
            } : undefined}
        >
            <div className="multi-select-search-wrapper">
                <Search size={14} className="search-icon-inline" />
                <input
                    type="text"
                    className="multi-select-search-input"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
            <div className="multi-select-scroll">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => {
                        const isSelected = values.includes(option.value);
                        return (
                            <button
                                key={option.value}
                                className={`multi-select-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleToggleOption(option.value)}
                                type="button"
                            >
                                <div className="item-content">
                                    <div className="item-left-group">
                                        {option.icon && (
                                            <img src={option.icon} alt="" className="item-icon-circle" />
                                        )}
                                        <div className="item-label-main">{option.label}</div>
                                    </div>
                                    {option.subtext && <div className="item-subtext">{option.subtext}</div>}
                                </div>
                                {isSelected && <Check size={16} className="check-icon" />}
                            </button>
                        );
                    })
                ) : (
                    <div className="multi-select-no-results">No results</div>
                )}
            </div>
        </div>
    );

    return (
        <div
            className={`multi-select ${isOpen ? 'open' : ''}`}
            ref={dropdownRef}
        >
            <div
                className={`multi-select-trigger ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="multi-select-tags">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map(opt => (
                            <span key={opt.value} className="multi-select-tag">
                                {opt.icon && (
                                    <img src={opt.icon} alt="" className="tag-icon-circle" />
                                )}
                                <span className="tag-text">{opt.label}</span>
                                <button
                                    className="tag-remove"
                                    onClick={(e) => handleRemoveTag(e, opt.value)}
                                    type="button"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="multi-select-placeholder">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className={`chevron-icon ${isOpen ? 'rotate' : ''}`} size={16} />
            </div>

            {isOpen && createPortal(renderMenuContent(), document.body)}
        </div>
    );
};

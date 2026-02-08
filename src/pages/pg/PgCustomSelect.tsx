import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string;
    subtext?: string;
    disabled?: boolean;
}

interface PgCustomSelectProps {
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    displayValue?: string;
}

export const PgCustomSelect: React.FC<PgCustomSelectProps> = ({
    value, options, onChange, placeholder = "Select...", disabled, displayValue
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const selectedOption = options.find(o => o.value === value);
    // Use displayValue if provided, otherwise check if value matches an option, otherwise use placeholder
    // If value is present but no option matches (e.g. custom/mixed), we might want to fall back to placeholder OR show value?
    // In our case, we use displayValue for the weird Mixed states.
    const triggerText = displayValue || (selectedOption ? selectedOption.label : (value || placeholder));

    return (
        <div className={`pg-custom-select-trigger ${disabled ? 'disabled' : ''}`}
            ref={containerRef}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            style={disabled ? { opacity: 0.6, cursor: 'not-allowed', background: '#f9fafb' } : {}}
        >
            <span style={{ color: value || displayValue ? '#111' : '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, marginRight: 8 }}>
                {triggerText}
            </span>
            <ChevronDown size={16} color="#666" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />

            {isOpen && (
                <div className="pg-custom-select-list" onClick={(e) => e.stopPropagation()}>
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            className={`pg-select-option ${opt.value === value ? 'selected' : ''} ${opt.disabled ? 'disabled' : ''}`}
                            onClick={() => !opt.disabled && handleSelect(opt.value)}
                            style={{
                                background: opt.value === value ? '#eff6ff' : undefined,
                                color: opt.value === value ? '#1B3AEC' : undefined,
                                fontWeight: opt.value === value ? 600 : 400
                            }}
                        >
                            <span style={{ flex: 1 }}>{opt.label}</span>
                            {opt.value === value && <Check size={14} color="#1B3AEC" />}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div style={{ padding: '8px 12px', fontSize: '0.875rem', color: '#999' }}>No options</div>
                    )}
                </div>
            )}
        </div>
    );
};

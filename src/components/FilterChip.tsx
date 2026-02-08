import React from 'react';
import './FilterChip.css';

interface FilterChipProps {
    label: string | React.ReactNode;
    isActive?: boolean;
    onClick: () => void;
    badge?: number;
    className?: string;
    /** New: variant for PG Uploads filter chips with count badge */
    variant?: 'default' | 'filterCount';
    /** Count to display as badge (used with filterCount variant) */
    count?: number;
    /** Whether chip is disabled (used when count is 0) */
    disabled?: boolean;
    /** New: accent color for the chip */
    accent?: 'red';
}

export const FilterChip: React.FC<FilterChipProps> = ({
    label,
    isActive = false,
    onClick,
    badge,
    className = '',
    variant = 'default',
    count,
    disabled = false,
    accent
}) => {
    // For filterCount variant, disable if count is 0
    const isDisabled = disabled || (variant === 'filterCount' && count === 0);

    const handleClick = () => {
        if (!isDisabled) {
            onClick();
        }
    };

    if (variant === 'filterCount') {
        return (
            <button
                className={`filter-chip filter-chip-count ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''} ${accent ? `accent-${accent}` : ''} ${className}`}
                onClick={handleClick}
                type="button"
                disabled={isDisabled}
            >
                <span className="chip-label">{label}</span>
                <span className={`chip-count-badge ${isActive ? 'active' : ''}`}>
                    {count ?? 0}
                </span>
            </button>
        );
    }

    // Default variant
    return (
        <button
            className={`filter-chip ${isActive ? 'active' : ''} ${className}`}
            onClick={onClick}
            type="button"
        >
            {label}
            {badge !== undefined && badge > 0 && (
                <span className="filter-chip-badge">{badge}</span>
            )}
        </button>
    );
};

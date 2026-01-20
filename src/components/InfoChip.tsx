import React from 'react';
import './InfoChip.css';
import { ProfileAvatar } from './ProfileAvatar';

interface InfoChipProps {
    label: string;
    name: string;
    avatarUrl?: string; // Optional, can fallback
    variant?: 'rider' | 'horse' | 'photographer'; // New: Context-aware styling
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode; // Leave for flex, but mostly automated now
}

export const InfoChip: React.FC<InfoChipProps> = ({
    label,
    name,
    avatarUrl,
    variant,
    onClick,
    className = ''
}) => {
    return (
        <div
            className={`info-chip ${variant ? `variant-${variant}` : ''} ${onClick ? 'clickable' : ''} ${className}`}
            onClick={onClick}
        >
            <ProfileAvatar
                variant={variant}
                url={avatarUrl}
                name={name}
                size={34}
                className="chip-avatar-ref"
            />
            <div className="chip-content">
                <span className="chip-label">{label}</span>
                <span className="chip-name">{name}</span>
            </div>
        </div>
    );
};

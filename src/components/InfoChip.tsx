import React, { useState } from 'react';
import { User, Camera } from 'lucide-react';
import './InfoChip.css';

interface InfoChipProps {
    label: string;
    name: string;
    avatarUrl?: string; // Optional, can fallback
    fallbackIcon?: 'user' | 'camera'; // To choose which icon to show on error/missing
    onClick?: () => void;
    className?: string;
}

export const InfoChip: React.FC<InfoChipProps> = ({
    label,
    name,
    avatarUrl,
    fallbackIcon = 'user',
    onClick,
    className = ''
}) => {
    const [imgError, setImgError] = useState(false);

    const handleImgError = () => {
        setImgError(true);
    };

    return (
        <div
            className={`info-chip ${onClick ? 'clickable' : ''} ${className}`}
            onClick={onClick}
        >
            <div className="chip-avatar">
                {!imgError && avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={name}
                        onError={handleImgError}
                    />
                ) : (
                    fallbackIcon === 'camera' ? <Camera size={16} /> : <User size={16} />
                )}
            </div>
            <div className="chip-content">
                <span className="chip-label">{label}</span>
                <span className="chip-name">{name}</span>
            </div>
        </div>
    );
};

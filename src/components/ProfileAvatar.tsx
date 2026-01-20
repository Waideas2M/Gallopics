import React from 'react';
import { User, Camera } from 'lucide-react';
import { RiderIcon } from './icons/RiderIcon';
import { HorseIcon } from './icons/HorseIcon';
import './ProfileAvatar.css';

export interface ProfileAvatarProps {
    variant?: 'rider' | 'horse' | 'photographer' | 'default';
    url?: string;
    name?: string;
    size?: number;
    className?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
    variant = 'default',
    url,
    name,
    size = 40,
    className = ''
}) => {
    const [imgError, setImgError] = React.useState(false);

    const renderContent = () => {
        if (url && !imgError) {
            return (
                <img
                    src={url}
                    alt={name || ''}
                    onError={() => setImgError(true)}
                />
            );
        }

        switch (variant) {
            case 'rider':
                return <RiderIcon size={size * 0.65} />;
            case 'horse':
                return <HorseIcon size={size * 0.65} />;
            case 'photographer':
                return <Camera size={size * 0.6} />;
            default:
                return <User size={size * 0.6} />;
        }
    };

    return (
        <div
            className={`profile-avatar variant-${variant} ${className}`}
            style={{ width: size, height: size }}
        >
            {renderContent()}
        </div>
    );
};

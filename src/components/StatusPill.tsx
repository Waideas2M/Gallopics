import React from 'react';
import './StatusPill.css';

interface StatusPillProps {
    label: string;
    status?: 'neutral' | 'success' | 'warning' | 'error';
    className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ label, status = 'neutral', className = '' }) => {
    return (
        <div className={`token-status-pill status-${status} ${className}`}>
            {label}
        </div>
    );
};

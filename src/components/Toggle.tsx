import React from 'react';
import './Toggle.css';

interface ToggleProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked = false, onChange, label, disabled }) => {
    return (
        <label className={`token-toggle-wrapper ${disabled ? 'disabled' : ''}`}>
            <div className="token-toggle-input">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange?.(e.target.checked)}
                    disabled={disabled}
                />
                <span className="token-toggle-slider"></span>
            </div>
            {label && <span className="token-toggle-label">{label}</span>}
        </label>
    );
};

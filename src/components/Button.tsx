import React from 'react';
import './Button.css';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'white';
    size?: 'small' | 'medium' | 'large' | 'floating'; // added floating (48px)
    shape?: 'default' | 'circle'; // explicit shape control
    disabled?: boolean;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    style?: React.CSSProperties;
    title?: string;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    shape = 'default',
    disabled = false,
    icon,
    children,
    onClick,
    className = '',
    type = 'button',
    style,
    title
}) => {
    // Determine if it should be treated as circle automatically if no children and has icon (backward compatibility-ish)
    // But better to be explicit.

    return (
        <button
            className={`btn btn-${variant} btn-${size} ${shape === 'circle' ? 'btn-circle' : ''} ${icon && !children && shape !== 'circle' ? 'btn-icon-only' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
            title={title || (typeof children === 'string' ? children : undefined)}
            style={style}
        >
            {icon && <span className="btn-icon-wrapper">{icon}</span>}
            {children && <span className="btn-label">{children}</span>}
        </button>
    );
};

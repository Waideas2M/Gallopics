import React, { useState, useRef, useEffect } from 'react';
import { Share2, MoreHorizontal } from 'lucide-react';
import './HeaderActions.css';

export interface ActionItem {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive';
}

interface MoreMenuProps {
    actions: ActionItem[];
}

export const MoreMenu: React.FC<MoreMenuProps> = ({ actions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="header-action-more-wrapper" ref={menuRef}>
            <button
                className={`share-icon-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="More actions"
            >
                <MoreHorizontal size={20} />
            </button>

            {isOpen && (
                <div className="header-action-dropdown">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            className={`header-action-item ${action.variant === 'destructive' ? 'destructive' : ''}`}
                            onClick={() => {
                                action.onClick();
                                setIsOpen(false);
                            }}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface ShareIconButtonProps {
    url?: string;
}

export const ShareIconButton: React.FC<ShareIconButtonProps> = ({ url }) => {
    const [showToast, setShowToast] = useState(false);

    const handleShare = () => {
        const targetUrl = url || window.location.href;
        navigator.clipboard.writeText(targetUrl);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    return (
        <div className="header-action-share-wrapper">
            <button
                className="share-icon-btn"
                onClick={handleShare}
                title="Share"
                aria-label="Share page"
            >
                <Share2 size={20} />
            </button>
            <div className={`header-action-toast ${showToast ? 'visible' : ''}`}>
                Link copied
            </div>
        </div>
    );
};

export const ActionSeparator: React.FC = () => {
    return <div className="header-action-separator" />;
};

export const ActionCluster: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="header-action-cluster">{children}</div>;
};

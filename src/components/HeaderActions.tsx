import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 8,
                left: rect.right + window.scrollX - 200 // Menu width is 200px
            });
        }
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updateCoords();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                triggerRef.current && !triggerRef.current.contains(target) &&
                menuRef.current && !menuRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            window.addEventListener('resize', updateCoords);
            window.addEventListener('scroll', updateCoords, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords, true);
        };
    }, [isOpen]);

    return (
        <div className="header-action-more-wrapper">
            <button
                ref={triggerRef}
                className={`share-icon-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="More actions"
            >
                <MoreHorizontal size={20} />
            </button>

            {isOpen && createPortal(
                <div
                    className="header-action-dropdown is-portal"
                    ref={menuRef}
                    style={{
                        position: 'absolute',
                        top: coords.top,
                        left: coords.left,
                        zIndex: 10000,
                        margin: 0 // Clear any default margins
                    }}
                >
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
                </div>,
                document.body
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

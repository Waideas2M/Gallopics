import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import './HeaderActions.css';

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

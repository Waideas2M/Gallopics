import React, { useState, useEffect } from 'react';
import { X, Monitor, Link, Check } from 'lucide-react';
import './AuthModal.css'; // Reuse common modal styles

interface DesktopRecommendationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DesktopRecommendationModal: React.FC<DesktopRecommendationModalProps> = ({
    isOpen,
    onClose
}) => {
    const [copied, setCopied] = useState(false);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
            setCopied(false);
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div
                className="auth-modal-container"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                style={{ padding: '0' }}
            >
                <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
                    <X size={20} />
                </button>

                <div className="auth-modal-content" style={{ textAlign: 'center', padding: '48px 32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'rgba(27, 58, 236, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        color: '#1B3AEC'
                    }}>
                        <Monitor size={32} />
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px', color: '#111' }}>
                        Use a desktop for photographer tools
                    </h2>

                    <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '32px', fontSize: '1rem' }}>
                        For the best experience, please open Gallopics on a desktop or laptop to upload and manage photos.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            className="auth-btn-primary"
                            onClick={onClose}
                            style={{ margin: 0 }}
                        >
                            Got it
                        </button>

                        <button
                            className="auth-btn-oauth"
                            onClick={handleCopyLink}
                            style={{
                                margin: 0,
                                gap: '8px',
                                color: copied ? '#10b981' : '#111',
                                borderColor: copied ? '#10b981' : '#e5e5e5'
                            }}
                        >
                            {copied ? (
                                <>
                                    <Check size={18} />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Link size={18} />
                                    Copy link
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

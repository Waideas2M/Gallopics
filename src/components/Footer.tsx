import React from 'react';
import './Footer.css';
import { CopyrightBar } from './CopyrightBar';

interface FooterProps {
    minimal?: boolean;
    sidebar?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ minimal = false, sidebar = false }) => {
    if (minimal) {
        return <CopyrightBar minimal={true} sidebar={sidebar} />;
    }

    return (
        <>
            <footer className="footer-full" data-footer="guest-full">
                <div className="container">
                    <div className="footer-grid">
                        {/* Left Column: Brand */}
                        <div className="footer-brand">
                            <img src="/images/logo2.svg" alt="Gallopics" className="footer-logo-img" />
                            <p className="footer-subtitle desktop-only">
                                We capture horse competitions across Sweden. Search your event, spot your photos, and purchase your favorites.
                            </p>
                        </div>

                        {/* Right Column: Compact Actions (Desktop: Row, Mobile: Stacked) */}
                        <div className="footer-actions-container">
                            <div className="footer-secondary-links">
                                <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>FAQs</a>
                                <span className="nav-dot">•</span>
                                <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>Photographers login</a>
                            </div>
                            <div className="footer-primary-action">
                                <a
                                    href="#"
                                    className="btn-footer-cta"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.dispatchEvent(new Event('open-contact-support'));
                                    }}
                                >
                                    Contact support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            <CopyrightBar minimal={false} />
        </>
    );
};

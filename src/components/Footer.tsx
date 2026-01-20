import React from 'react';
import './Footer.css';
import { CopyrightBar } from './CopyrightBar';
import { Instagram, Youtube } from 'lucide-react';

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
            <footer className="footer-full">
                <div className="container">
                    <div className="footer-grid">
                        {/* Left: Brand */}
                        <div className="footer-brand">
                            <img src="/images/logo2.svg" alt="Gallopics" className="footer-logo-img" />

                        </div>

                        {/* Right: Links & Social */}
                        <div className="footer-right">
                            {/* 1. Primary CTA */}
                            <a href="#" className="btn-footer-cta">Contact support</a>

                            {/* 2. Compact Nav Row */}
                            <div className="footer-nav-row">
                                <span className="nav-links">
                                    <a href="#" className="footer-link">FAQs</a>
                                    <span className="nav-dot">•</span>
                                    <a href="#" className="footer-link">Photographers login</a>
                                </span>
                                <span className="nav-separator">|</span>
                                <div className="footer-socials-inline">
                                    <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                                    <a href="#" aria-label="YouTube"><Youtube size={22} /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            <CopyrightBar minimal={false} />
        </>
    );
};

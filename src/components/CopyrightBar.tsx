import React from 'react';
import './Footer.css';
import { Instagram, Youtube } from 'lucide-react';

export interface CopyrightBarProps {
    minimal?: boolean; // If true, might adjust padding or border
    sidebar?: boolean; // If true, remove fluid container for sidebar use
}

export const CopyrightBar: React.FC<CopyrightBarProps> = ({ minimal = false, sidebar = false }) => {
    const content = (
        <div className="copyright-wrapper">
            {!sidebar && (
                <div className="copyright-social-wrapper">
                    <div className="footer-socials">
                        <a href="#" aria-label="Instagram" className="social-icon-btn"><Instagram size={20} /></a>
                        <a href="#" aria-label="YouTube" className="social-icon-btn"><Youtube size={22} /></a>
                    </div>
                </div>
            )}

            <div className="copyright-info">
                <span className="copyright-text">© {new Date().getFullYear()} Gallopics. All rights reserved.</span>
            </div>

            <div className="copyright-links-row">
                <a href="#" className="copyright-link">Terms of service</a>
                <a href="#" className="copyright-link">Privacy policy</a>
                <a href="#" className="copyright-link">Cookie policy</a>
            </div>
        </div>
    );

    return (
        <div className={`copyright-bar ${minimal ? 'minimal' : ''} ${sidebar ? 'sidebar-mode' : ''}`}>
            {sidebar ? content : <div className="container">{content}</div>}
        </div>
    );
};

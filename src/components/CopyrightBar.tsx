import React from 'react';
import './Footer.css';

export interface CopyrightBarProps {
    minimal?: boolean; // If true, might adjust padding or border
}

export const CopyrightBar: React.FC<CopyrightBarProps> = ({ minimal = false }) => {
    return (
        <div className={`copyright-bar ${minimal ? 'minimal' : ''}`}>
            <div className="container">
                <div className="copyright-content">
                    <span className="copyright-text">© 2026 Gallopics. All rights reserved.</span>
                    <a href="#" className="copyright-link">Terms & Use</a>
                </div>
            </div>
        </div>
    );
};

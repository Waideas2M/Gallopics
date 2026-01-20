import React from 'react';
import './Footer.css';

export interface CopyrightBarProps {
    minimal?: boolean; // If true, might adjust padding or border
    sidebar?: boolean; // If true, remove fluid container for sidebar use
}

export const CopyrightBar: React.FC<CopyrightBarProps> = ({ minimal = false, sidebar = false }) => {
    const content = (
        <div className="copyright-content">
            <span className="copyright-text">© {new Date().getFullYear()} Gallopics</span>
            {!sidebar && <span className="copyright-text mobile-hide">. All rights reserved.</span>}
            <div className="copyright-links-row" style={{ marginLeft: sidebar ? 0 : 'auto', display: 'flex', flexWrap: 'wrap', gap: sidebar ? '4px 12px' : '16px' }}>
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

import React from 'react';
import './PageTabs.css';

interface TabItem {
    id: string;
    label: string;
}

interface PageTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

export const PageTabs: React.FC<PageTabsProps> = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="token-page-tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`token-page-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

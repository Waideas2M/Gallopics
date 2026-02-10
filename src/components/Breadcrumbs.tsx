import React from 'react';
import { ChevronLeft } from 'lucide-react';
import './Breadcrumbs.css';

export interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
    active?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <section className="breadcrumbs-section">
            <div className="container">
                <nav className="breadcrumbs" aria-label="Breadcrumb">
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            <div
                                className={`breadcrumb-item ${item.active ? 'active' : ''} ${item.onClick ? 'clickable' : ''} ${index === 0 ? 'is-first' : ''} ${index === items.length - 1 ? 'is-last' : ''}`}
                                onClick={item.onClick}
                            >
                                {index === 0 && <ChevronLeft size={14} style={{ flexShrink: 0 }} />}
                                <span className="breadcrumb-label">{item.label}</span>
                            </div>
                            {index < items.length - 1 && <span className="breadcrumb-separator">/</span>}
                        </React.Fragment>
                    ))}
                </nav>
            </div>
        </section>
    );
};

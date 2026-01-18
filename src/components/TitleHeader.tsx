import React from 'react';
import { ModernSearchBar } from './ModernSearchBar';
import './TitleHeader.css';

interface TitleHeaderProps {
    title: React.ReactNode;
    topSubtitle?: React.ReactNode;
    subtitle?: React.ReactNode;
    stats?: React.ReactNode;
    rightContent?: React.ReactNode;
    avatar?: string;
    description?: React.ReactNode;
    compact?: boolean;
    variant?: 'default' | 'ehome'; // New variant prop
}

export const TitleHeader: React.FC<TitleHeaderProps> = ({
    title,
    topSubtitle,
    subtitle,
    stats,
    rightContent,
    avatar,
    description,
    compact = false,
    variant = 'default'
}) => {
    // Ehome Hero Variant
    if (variant === 'ehome') {
        return (
            <section className="hero-wrapper">
                <div className="container">
                    <div className="hero-grid">
                        {/* Card 1: Large Hero */}
                        <div className="hero-card hero-card-large">
                            <div className="hero-content">
                                <h1 className="hero-title">{title}</h1>
                                <p className="hero-body">{description}</p>
                            </div>
                            <div className="hero-actions full-width-search">
                                <ModernSearchBar theme="light" />
                            </div>
                        </div>

                        {/* Card 2: Photographer */}
                        <div className="hero-card hero-card-small photographer">
                            <div className="hero-content">
                                <h2 className="hero-title-small">I am a<br />Photographer</h2>
                                <p className="hero-body">Gallopics is a platform for competition photographers. Book events, upload galleries, manage orders and track your sales – all in one place.</p>
                            </div>
                            <div className="hero-actions">
                                <a href="/register" className="btn-hero-secondary">
                                    Register with us
                                </a>
                            </div>
                        </div>

                        {/* Card 3: Organizer */}
                        <div className="hero-card hero-card-small organizer">
                            <div className="hero-content">
                                <h2 className="hero-title-small">Organizing a<br />competition?</h2>
                                <p className="hero-body">Helps you find the right photographers, coordinate coverage, and make it easy for riders to discover and purchase their photos.</p>
                            </div>
                            <div className="hero-actions">
                                <a href="/contact" className="btn-hero-secondary">
                                    Contact us
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Default Layout (Profile/Event Headers)
    return (
        <section className={`title-header ${compact ? 'compact' : ''}`}>
            <div className="container">
                <div className="title-header-main">
                    <div className="title-block">
                        <div className="title-row">
                            {avatar && (
                                <div className="title-avatar">
                                    <img src={avatar} alt="" />
                                </div>
                            )}
                            <div className="title-text-group">
                                {topSubtitle && <div className="title-header-top-subtitle">{topSubtitle}</div>}
                                <h1 className="title-header-title">{title}</h1>
                                {subtitle && <div className="title-header-subtitle">{subtitle}</div>}
                                {stats && <div className="title-header-stats">{stats}</div>}
                                {description && <div className="title-header-description">{description}</div>}
                            </div>
                        </div>
                    </div>
                    {rightContent && (
                        <div className="title-header-right">
                            {rightContent}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

import React, { useEffect } from 'react';
import { ModernSearchBar } from './ModernSearchBar';
import { ProfileAvatar } from './ProfileAvatar';
import './TitleHeader.css';

interface TitleHeaderProps {
    title: React.ReactNode;
    topSubtitle?: React.ReactNode;
    subtitle?: React.ReactNode;
    stats?: React.ReactNode;
    rightContent?: React.ReactNode;
    avatar?: string | React.ReactNode;
    avatarVariant?: 'rider' | 'horse' | 'photographer' | 'default'; // New: Add variant support for avatar coloring
    description?: React.ReactNode;
    compact?: boolean;
    variant?: 'default' | 'ehome' | 'workspace' | 'upload';
    optionalClose?: React.ReactNode;
    avatarShape?: 'circle' | 'square';
    className?: string; // Support valid HTML class attribute
}

export const TitleHeader: React.FC<TitleHeaderProps> = ({
    title,
    topSubtitle,
    subtitle,
    stats,
    rightContent,
    avatar,
    avatarVariant,
    description,
    compact = false,
    variant = 'default',
    optionalClose,
    avatarShape = 'circle',
    className = ''
}) => {
    // Mobile Carousel Height Harmonization
    useEffect(() => {
        if (variant !== 'ehome') return;

        const harmonizeHeights = () => {
            // Only run on mobile
            if (window.innerWidth > 768) return;

            // DOM Selectors
            const container = document.querySelector('.hero-carousel-container') as HTMLElement;
            if (!container) return;

            // Reset to measure natural height
            container.style.removeProperty('--hero-mobile-height');

            const cards = container.querySelectorAll('.hero-card');
            let maxHeight = 0;

            // 1. Measure
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                if (rect.height > maxHeight) maxHeight = rect.height;
            });

            // 2. Apply if reasonable
            if (maxHeight > 100) {
                container.style.setProperty('--hero-mobile-height', `${maxHeight}px`);
            }
        };

        // Initial run & listeners
        harmonizeHeights();
        window.addEventListener('resize', harmonizeHeights);
        // Small delay to ensure CSS applied
        const timeout = setTimeout(harmonizeHeights, 100);

        return () => {
            window.removeEventListener('resize', harmonizeHeights);
            clearTimeout(timeout);
        };
    }, [variant, title]);

    // Ehome Hero Variant
    if (variant === 'ehome') {
        return (
            <section className="hero-wrapper">
                <div className="container">
                    <div className="hero-carousel-container">
                        <div
                            className="hero-grid"
                            onScroll={(e) => {
                                const el = e.currentTarget;
                                const width = el.offsetWidth;
                                const scroll = el.scrollLeft;
                                const index = Math.round(scroll / width);

                                document.documentElement.style.setProperty('--current-hero-slide', index.toString());
                                const dots = document.querySelectorAll('.hero-dot');
                                dots.forEach((dot, i) => {
                                    if (i === index) dot.classList.add('active');
                                    else dot.classList.remove('active');
                                });
                            }}
                        >
                            {/* Card 1: Large Hero */}
                            <div className="hero-card hero-card-large">
                                <div className="hero-content">
                                    <h1 className="hero-title">{title}</h1>
                                    <p className="hero-body">{description}</p>
                                </div>
                                <div className="hero-actions full-width-search">
                                    <ModernSearchBar theme="light" isMobileTrigger={true} />
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
                                        Register
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

                        {/* Mobile Pagination Dots */}
                        <div className="hero-pagination">
                            <div className="hero-dot active"></div>
                            <div className="hero-dot"></div>
                            <div className="hero-dot"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Default Layout (Profile/Event Headers)
    return (
        <section className={`title-header ${compact ? 'compact' : ''} variant-${variant} ${className}`}>
            <div className="container">
                <div className="title-header-main">
                    <div className="title-block">
                        <div className="title-row">
                            {(avatar || avatarVariant) && (
                                <div className={`title-avatar-wrapper ${avatarShape === 'square' ? 'is-square' : ''}`}>
                                    {typeof avatar === 'string' || avatarVariant ? (
                                        <ProfileAvatar
                                            variant={avatarVariant}
                                            url={typeof avatar === 'string' ? avatar : undefined}
                                            name={typeof title === 'string' ? title : ''}
                                            size={avatarShape === 'square' ? 100 : 80}
                                        />
                                    ) : (
                                        <div className="title-avatar-fallback">
                                            {avatar}
                                        </div>
                                    )}
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
                    {optionalClose && (
                        <div className="title-header-close">
                            {optionalClose}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

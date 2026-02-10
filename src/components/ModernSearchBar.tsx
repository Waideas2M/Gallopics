import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X, Calendar, ChevronRight, Camera, Image, ArrowRight } from 'lucide-react';
import { RIDERS, HORSES, COMPETITIONS, RIDER_PRIMARY_HORSE, HORSE_PRIMARY_RIDER, PHOTOGRAPHERS, photos } from '../data/mockData';
import './ModernSearchBar.css';
import { useMobileSearchMode } from '../hooks/useMobileSearchMode';

import { HorseIcon } from './icons/HorseIcon';
import { RiderIcon } from './icons/RiderIcon';

interface SearchResult {
    id: string;
    type: 'event' | 'rider' | 'horse' | 'photographer' | 'photo';
    title: string;
    subtitle: string;
    meta?: string;
    photoSrc?: string; // For thumbnail
}

type GroupedResults = {
    [key in SearchResult['type']]?: SearchResult[];
};

interface ModernSearchBarProps {
    collapsible?: boolean;
    theme?: 'dark' | 'light';
    isMobileTrigger?: boolean;
    mobilePlaceholder?: string;
    desktopPlaceholder?: string;
}

export const ModernSearchBar: React.FC<ModernSearchBarProps> = ({
    collapsible = false,
    theme = 'dark',
    isMobileTrigger = false,
    mobilePlaceholder,
    desktopPlaceholder
}) => {
    const defaultDesktopPlaceholder = "Search riders, horses, events, photographers, photo ID...";
    const defaultMobilePlaceholder = "Search...";

    // Determine current placeholder based on width/prop
    const isMobileBreakpoint = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
    const currentPlaceholder = isMobileBreakpoint
        ? (mobilePlaceholder || defaultMobilePlaceholder)
        : (desktopPlaceholder || defaultDesktopPlaceholder);
    const [query, setQuery] = useState('');
    const [groups, setGroups] = useState<GroupedResults>({});
    const [hasResults, setHasResults] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(!collapsible);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isFirstRender = useRef(true);
    const navigate = useNavigate();

    // Mobile Search Mode Hook
    const { activateSearch, deactivateSearch } = useMobileSearchMode(wrapperRef as React.RefObject<HTMLElement>);

    const handleResultClick = (item: SearchResult) => {
        deactivateSearch();
        setIsOpen(false);
        setQuery('');
        // Force full close if collapsible to ensure clean state
        if (collapsible) setIsExpanded(false);

        switch (item.type) {
            case 'event':
                navigate(`/event/${item.id}`);
                break;
            case 'rider':
                navigate(`/rider/${item.id}`);
                break;
            case 'horse':
                navigate(`/horse/${item.id}`);
                break;
            case 'photographer':
                navigate(`/photographer/${item.id}`);
                break;
            case 'photo':
                navigate(`/photo/${item.id}`);
                break;
        }
    };

    // Helpers
    const formatDate = (d: string, end?: string) => {
        const start = new Date(d);
        const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        if (!end) return startStr;
        const endDate = new Date(end);
        const endStr = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return `${startStr} – ${endStr}`;
    };

    /**
     * Compute Top Association based on explicit mappings (Source of Truth)
     */
    const getAssociation = (id: string, type: 'rider' | 'horse'): string => {
        if (type === 'rider') {
            // Find primary horse
            const match = RIDER_PRIMARY_HORSE.find(m => m.riderId === id);
            if (match) {
                const horse = HORSES.find(h => h.id === match.primaryHorseId);
                return horse ? horse.registeredName || horse.name : '—'; // Use registered name if available
            }
        } else {
            // Find primary rider
            const match = HORSE_PRIMARY_RIDER.find(m => m.horseId === id);
            if (match) {
                const rider = RIDERS.find(r => r.id === match.primaryRiderId);
                return rider ? `${rider.firstName} ${rider.lastName}` : '—';
            }
        }
        return '—';
    };

    const handleSearch = (val: string) => {
        setQuery(val);
        if (val.length < 2) {
            setGroups({});
            setHasResults(false);
            setIsOpen(false);
            return;
        }

        const lower = val.toLowerCase();
        const MAX_PER_GROUP = 3;
        const newGroups: GroupedResults = {};
        let count = 0;

        // 1. Events
        const events = COMPETITIONS.filter(c =>
            c.name.toLowerCase().includes(lower) || c.city.toLowerCase().includes(lower)
        ).slice(0, MAX_PER_GROUP).map(c => ({
            id: c.id,
            type: 'event' as const,
            title: c.name,
            subtitle: `${c.city} • ${formatDate(c.date, c.endDate)} • ${c.discipline}`,
            meta: c.country
        }));
        if (events.length) newGroups['event'] = events;
        count += events.length;

        // 2. Riders
        const riders = RIDERS.filter(r =>
            `${r.firstName} ${r.lastName}`.toLowerCase().includes(lower)
        ).slice(0, MAX_PER_GROUP).map(r => {
            const fullName = `${r.firstName} ${r.lastName}`;
            return {
                id: r.id,
                type: 'rider' as const,
                title: fullName,
                subtitle: getAssociation(r.id, 'rider')
            };
        });
        if (riders.length) newGroups['rider'] = riders;
        count += riders.length;

        // 3. Horses
        const horses = HORSES.filter(h =>
            h.name.toLowerCase().includes(lower) || h.registeredName.toLowerCase().includes(lower)
        ).slice(0, MAX_PER_GROUP).map(h => ({
            id: h.id,
            type: 'horse' as const,
            title: h.name,
            subtitle: getAssociation(h.id, 'horse')
        }));
        if (horses.length) newGroups['horse'] = horses;
        count += horses.length;

        // 4. Photographers
        const photographers = PHOTOGRAPHERS.filter(p =>
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(lower)
        ).slice(0, MAX_PER_GROUP).map(p => ({
            id: p.id,
            type: 'photographer' as const,
            title: `${p.firstName} ${p.lastName}`,
            subtitle: p.city || 'Photographer'
        }));
        if (photographers.length) newGroups['photographer'] = photographers;
        count += photographers.length;

        // 5. Photos (Search by ID)
        // Clean query for ID search: remove # if present
        const cleanQuery = lower.replace(/^#/, '');
        const matchingPhotos = photos.filter(p =>
            p.id.toLowerCase().includes(cleanQuery)
        ).slice(0, MAX_PER_GROUP).map(p => ({
            id: p.id,
            type: 'photo' as const,
            title: `#${p.id.toUpperCase()}`,
            subtitle: `${p.event} • ${p.rider}`
        }));

        if (matchingPhotos.length) newGroups['photo'] = matchingPhotos;
        count += matchingPhotos.length;

        setGroups(newGroups);
        setHasResults(count > 0);
        setIsOpen(true);
    };

    // Close outside or Collapse
    useEffect(() => {
        const outsideClick = (e: MouseEvent) => {
            const isInsideWrapper = wrapperRef.current && wrapperRef.current.contains(e.target as Node);
            const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(e.target as Node);

            if (!isInsideWrapper && !isInsideDropdown) {
                setIsOpen(false);
                deactivateSearch();
                if (collapsible) {
                    setIsExpanded(false);
                }
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                deactivateSearch();
                if (collapsible) setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', outsideClick);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', outsideClick);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [collapsible, deactivateSearch]);

    // Listener for external trigger (Header search specific)
    useEffect(() => {
        if (!collapsible) return; // Only header search listens

        const handleOpenEvent = () => {
            setIsExpanded(true);
            setIsOpen(true);
            // Small timeout to Ensure focus works after expansion render cycle
            setTimeout(() => inputRef.current?.focus(), 50);
        };

        window.addEventListener('open-header-search', handleOpenEvent);
        return () => window.removeEventListener('open-header-search', handleOpenEvent);
    }, [collapsible]);

    // Determine if we should use Portal (Mobile Only)
    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
    const usePortal = collapsible && isExpanded && isMobile;

    // Portal for Desktop clipping fix
    const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; right: number; width: number } | null>(null);

    useEffect(() => {
        const updateRect = () => {
            if (wrapperRef.current && isOpen && !usePortal) {
                const rect = wrapperRef.current.getBoundingClientRect();
                setDropdownRect({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    right: (window.innerWidth - rect.right),
                    width: rect.width
                });
            }
        };

        if (isOpen && !usePortal) {
            updateRect();
            window.addEventListener('resize', updateRect);
            window.addEventListener('scroll', updateRect);
            return () => {
                window.removeEventListener('resize', updateRect);
                window.removeEventListener('scroll', updateRect);
            };
        }
    }, [isOpen, usePortal]);

    // Focus input on expand & Body Scroll Lock
    useEffect(() => {
        if (isExpanded && !isFirstRender.current) {
            inputRef.current?.focus();
        }
        isFirstRender.current = false;

        // Critical Fix: Only lock scroll if we are in Portal/Overlay mode (Mobile + Collapsible Header Search)
        // And ONLY if we are NOT in the PG workspace (as per ground rules to scope overlay/scroll-lock)
        const isPgFlow = location.pathname.startsWith('/pg');

        if (usePortal && !isPgFlow) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('isSearchMode');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('isSearchMode');
        }

        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('isSearchMode');
        };
    }, [isExpanded, usePortal, location.pathname]);

    const getGroupLabel = (type: string) => {
        switch (type) {
            case 'event': return 'Events';
            case 'rider': return 'Riders';
            case 'horse': return 'Horses';
            case 'photographer': return 'Photographers';
            case 'photo': return 'Photos';
            default: return '';
        }
    };

    const getIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'event': return <Calendar size={16} />;
            case 'rider': return <RiderIcon size={16} />;
            case 'horse': return <HorseIcon size={16} />;
            case 'photographer': return <Camera size={16} />;
            case 'photo': return <Image size={16} />;
        }
    };


    // Priority Order for rendering groups
    const groupOrder: Array<SearchResult['type']> = ['event', 'rider', 'horse', 'photographer', 'photo'];

    // Render Logic for Dropdown Results
    const renderResults = () => {
        if (!isOpen) return null;

        const style: React.CSSProperties = dropdownRect && !usePortal ? {
            position: 'absolute',
            top: dropdownRect.top + 8,
            left: collapsible ? 'auto' : dropdownRect.left,
            right: collapsible ? dropdownRect.right : 'auto',
            width: collapsible ? 380 : (dropdownRect.width || 420),
            margin: 0,
            zIndex: 9999,
        } : {};

        const content = (
            <div
                ref={dropdownRef}
                className={`search-results-dropdown ${!hasResults ? 'empty' : ''}`}
                style={style}
            >
                {hasResults ? (
                    groupOrder.map(type => {
                        const groupItems = groups[type];
                        if (!groupItems) return null;

                        return (
                            <div key={type} className="result-group">
                                <div className="group-header">{getGroupLabel(type)}</div>
                                {groupItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="search-result-item clickable"
                                        onMouseDown={(e) => e.preventDefault()} // Prevent focus shift that might close portal
                                        onClick={() => handleResultClick(item)}
                                    >
                                        <div className={`result-icon-box type-${item.type}`}>
                                            {getIcon(item.type)}
                                        </div>
                                        <div className="result-text">
                                            <span className="result-title">{item.title}</span>
                                            <span className="result-subtitle">{item.subtitle}</span>
                                        </div>
                                        <ChevronRight size={14} className="result-arrow" />
                                    </div>
                                ))}
                            </div>
                        );
                    })
                ) : (
                    query.length >= 2 && <span className="no-result-text">No matches found</span>
                )}
            </div>
        );

        // If on desktop, we wrap in a themed context to ensure styles apply
        if (dropdownRect && !usePortal) {
            return (
                <div className={`modern-search-wrapper ${theme}-theme ${collapsible ? 'is-collapsible expanded' : ''}`} style={{ position: 'static' }}>
                    {content}
                </div>
            );
        }

        return content;
    };


    // Mobile Overlay Content (Portaled)
    const mobileOverlayContent = (
        <div className="mobile-search-overlay-container">
            <div className="search-backdrop" onClick={() => {
                setIsOpen(false);
                deactivateSearch();
                setIsExpanded(false);
            }} />

            <div className="mobile-search-bar-wrapper">
                <div className="modern-search-bar active mobile-expanded">
                    <Search className="search-icon" size={20} />
                    <input
                        ref={usePortal ? inputRef : null}
                        type="text"
                        className="search-input"
                        placeholder={currentPlaceholder}
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    {query && (
                        <button
                            className="clear-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setQuery('');
                                setGroups({});
                                inputRef.current?.focus();
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Mobile Helper Line */}
                <div className="mobile-search-helper-line">
                    Riders • Horses • Events • Photographers • Photo ID
                </div>

                {renderResults()}
            </div>
        </div>
    );

    // If using portal, we DON'T add 'expanded' class to wrapper to keep it small
    // But we need to handle the trigger
    return (
        <>
            <div
                className={`modern-search-wrapper ${theme}-theme ${collapsible ? 'is-collapsible' : ''} ${isExpanded && !usePortal ? 'expanded' : ''}`}
                ref={wrapperRef}
            >
                <div
                    className={`modern-search-bar ${isOpen ? 'active' : ''}`}
                    onClick={() => {
                        if (collapsible && !isExpanded) {
                            setIsExpanded(true);
                        }
                    }}
                >
                    <Search className="search-icon" size={20} />

                    {/* Only render Input inWrapper if NOT using Portal */}
                    <input
                        ref={!usePortal ? inputRef : null}
                        type="text"
                        className="search-input"
                        placeholder={currentPlaceholder}
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={(e) => {
                            // On mobile, if this is a trigger for the global search overlay,
                            // we do NOT want to activate on focus alone (which can happen on back-nav).
                            if (isMobileTrigger && window.matchMedia("(max-width: 768px)").matches) {
                                e.preventDefault();
                                e.target.blur();
                                return;
                            }

                            activateSearch();
                            if (query.length >= 2) {
                                setHasResults(Object.keys(groups).length > 0);
                                setIsOpen(true);
                            }
                        }}
                        onClick={(e) => {
                            // Only dispatch the open event on an explicit user click/tap
                            if (isMobileTrigger && window.matchMedia("(max-width: 768px)").matches) {
                                e.preventDefault();
                                e.currentTarget.blur();
                                window.dispatchEvent(new Event('open-header-search'));
                            }
                        }}
                        disabled={collapsible && !isExpanded}
                        style={usePortal ? { display: 'none' } : {}}
                    />

                    {query && !usePortal && (
                        <button
                            className="clear-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setQuery('');
                                setGroups({});
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}

                    {theme === 'light' && !collapsible && (
                        <button
                            className="search-go-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isOpen && query.length >= 2) setIsOpen(true);
                                inputRef.current?.focus();
                            }}
                        >
                            <ArrowRight size={18} />
                        </button>
                    )}
                </div>

                {/* Desktop Dropdown (In-Flow fallback) */}
                {!usePortal && !dropdownRect && renderResults()}
            </div>

            {/* Portal for Desktop Dropdown (Escapes overflow:hidden) */}
            {!usePortal && dropdownRect && isOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
                renderResults(),
                document.body
            )}

            {/* Portal for Mobile Expanded */}
            {usePortal && typeof document !== 'undefined' && ReactDOM.createPortal(
                mobileOverlayContent,
                document.body
            )}
        </>
    );
};

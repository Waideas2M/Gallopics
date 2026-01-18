import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Calendar, User, Trophy, ChevronRight } from 'lucide-react';
import { RIDERS, HORSES, COMPETITIONS, RIDER_PRIMARY_HORSE, HORSE_PRIMARY_RIDER } from '../data/mockData';
import './ModernSearchBar.css';

interface SearchResult {
    id: string;
    type: 'event' | 'rider' | 'horse';
    title: string;
    subtitle: string;
    meta?: string;
}

type GroupedResults = {
    [key in SearchResult['type']]?: SearchResult[];
};

interface ModernSearchBarProps {
    collapsible?: boolean;
    theme?: 'dark' | 'light';
}

export const ModernSearchBar: React.FC<ModernSearchBarProps> = ({
    collapsible = false,
    theme = 'dark'
}) => {
    const [query, setQuery] = useState('');
    const [groups, setGroups] = useState<GroupedResults>({});
    const [hasResults, setHasResults] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(!collapsible);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleResultClick = (item: SearchResult) => {
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

        // Photographers REMOVED per user request

        setGroups(newGroups);
        setHasResults(count > 0);
        setIsOpen(true);
    };

    // Close outside or Collapse
    useEffect(() => {
        const outsideClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                if (collapsible) {
                    setIsExpanded(false);
                }
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                if (collapsible) setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', outsideClick);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', outsideClick);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [collapsible]);

    // Focus input on expand
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const getGroupLabel = (type: string) => {
        switch (type) {
            case 'event': return 'Events';
            case 'rider': return 'Riders';
            case 'horse': return 'Horses';
            default: return '';
        }
    };

    const getIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'event': return <Calendar size={16} />;
            case 'rider': return <User size={16} />;
            case 'horse': return <Trophy size={16} />;
        }
    };

    // Priority Order for rendering groups
    const groupOrder: Array<SearchResult['type']> = ['event', 'rider', 'horse'];

    return (
        <div
            className={`modern-search-wrapper ${theme}-theme ${collapsible ? 'is-collapsible' : ''} ${isExpanded ? 'expanded' : ''}`}
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
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search riders, horses, events..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => query.length >= 2 && setHasResults(Object.keys(groups).length > 0) && setIsOpen(true)}
                    disabled={collapsible && !isExpanded} // Disable input when collapsed
                />

                <button
                    className="clear-btn"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering expansion if clicked (though clear usually hidden when collapsed)
                        if (query) {
                            setQuery('');
                            setGroups({});
                            setIsOpen(false);
                        } else if (collapsible) {
                            setIsExpanded(false);
                        }
                    }}
                >
                    <X size={14} />
                </button>

            </div>
            {isOpen && hasResults && (
                <div className="search-results-dropdown">
                    {groupOrder.map(type => {
                        const groupItems = groups[type];
                        if (!groupItems) return null;

                        return (
                            <div key={type} className="result-group">
                                <div className="group-header">{getGroupLabel(type)}</div>
                                {groupItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="search-result-item clickable"
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
                    })}
                </div>
            )}

            {isOpen && query.length >= 2 && !hasResults && (
                <div className="search-results-dropdown empty">
                    <span className="no-result-text">No matches found</span>
                </div>
            )}
        </div>
    );
};

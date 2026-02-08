import React, { useRef, useState, useEffect } from 'react';
import { Search, X, Upload, Maximize2, Image, ChevronRight } from 'lucide-react';
import { HorseIcon } from './icons/HorseIcon';
import { RiderIcon } from './icons/RiderIcon';
import './StickyActionBar.css';

export type StickyActionBarVariant = 'uploads' | 'published' | 'archive';

export interface SearchResult {
    id: string;
    type: 'rider' | 'horse' | 'photo';
    title: string;
    subtitle: string;
    photoSrc?: string;
    meta?: string; // e.g. "Rider", "Horse", "ID: 123"
    groupLabel?: string;
}

interface ActionFolder {
    id: string;
    label: string;
    count: number;
    color?: string; // Optional indicator
    isDuplicate?: boolean;
    title?: string;
    badgeLabel?: string | number;
}

interface StickyActionBarProps {
    variant: StickyActionBarVariant;
    // Folders/Buckets
    folders?: ActionFolder[];
    activeFolderId?: string;
    onFolderChange?: (id: any) => void;
    // Search
    searchTerm: string;
    onSearchChange: (val: string) => void;
    suggestions?: SearchResult[];
    onSuggestionSelect?: (suggestion: SearchResult) => void;
    // Actions
    onUploadClick?: () => void;
    onExpandToggle: () => void;
    isExpanded: boolean;
    // Custom Actions (Optional extra buttons)
    actions?: React.ReactNode;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
    variant,
    folders = [],
    activeFolderId,
    onFolderChange,
    searchTerm,
    onSearchChange,
    suggestions,
    onSuggestionSelect,
    onUploadClick,
    onExpandToggle,
    isExpanded,
    actions
}) => {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter results into groups
    const grouped = (suggestions || []).reduce((acc: Record<string, SearchResult[]>, curr: SearchResult) => {
        const group = curr.groupLabel || curr.type;
        if (!acc[group]) acc[group] = [];
        acc[group].push(curr);
        return acc;
    }, {} as Record<string, SearchResult[]>);

    const flatResults = suggestions || [];

    // Auto-focus search when activated
    useEffect(() => {
        if (isSearchActive && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchActive]);

    const handleClearSearch = () => {
        onSearchChange('');
        setIsSearchActive(false);
        setShowDropdown(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || flatResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % flatResults.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
        } else if (e.key === 'Enter') {
            if (selectedIndex >= 0) {
                onSuggestionSelect?.(flatResults[selectedIndex]);
                setShowDropdown(false);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    const handleResultClick = (res: SearchResult) => {
        onSuggestionSelect?.(res);
        setShowDropdown(false);
    };

    const getIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'rider': return <RiderIcon size={16} />;
            case 'horse': return <HorseIcon size={16} />;
            case 'photo': return <Image size={16} />;
            default: return <Search size={16} />;
        }
    };

    const getGroupLabel = (type: string) => {
        switch (type.toLowerCase()) {
            case 'rider': return 'Riders';
            case 'horse': return 'Horses';
            case 'photo': return 'Photos';
            default: return type;
        }
    };

    return (
        <div className="sticky-bar-wrapper">
            <div className={`sticky-bar-container variant-${variant}`}>
                {/* Left side: Content folders/buckets */}
                <div className="sticky-bar-content">
                    {folders.length > 0 && (
                        <div className="sticky-bar-scroll-area">
                            <div className="sticky-bar-folders">
                                {folders.map((folder) => (
                                    <button
                                        key={folder.id}
                                        className={`bar-folder-pill ${activeFolderId === folder.id ? 'active' : ''} ${folder.isDuplicate ? 'is-duplicate' : ''}`}
                                        onClick={() => onFolderChange?.(folder.id)}
                                        title={folder.title}
                                    >
                                        <span className="folder-label">{folder.label}</span>
                                        <span className={`folder-badge ${folder.isDuplicate ? 'badge-red' : ''}`}>
                                            {folder.badgeLabel ?? folder.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side: Global Actions Cluster */}
                <div className="sticky-bar-actions">
                    <div className="sticky-bar-cluster">
                        {/* Search Action */}
                        <div className={`bar-search-wrapper ${isSearchActive ? 'expanded' : ''}`} ref={wrapperRef}>
                            {isSearchActive ? (
                                <div className="bar-search-input-box">
                                    <Search size={18} className="search-icon" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search riders, horses, photo ID..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            onSearchChange(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => {
                                            // Delay blur to allow click on dropdown
                                            setTimeout(() => {
                                                if (!searchTerm) setIsSearchActive(false);
                                                setShowDropdown(false);
                                            }, 200);
                                        }}
                                    />
                                    <button className="clear-search-btn" onClick={handleClearSearch}>
                                        <X size={16} />
                                    </button>

                                    {/* Dropdown Results */}
                                    {showDropdown && searchTerm.length >= 1 && (
                                        <div className="bar-search-dropdown">
                                            {flatResults.length > 0 ? (
                                                Object.entries(grouped).map(([group, items]) => (
                                                    <div key={group} className="bar-result-group">
                                                        <div className="bar-group-header">{getGroupLabel(group)}</div>
                                                        {items.map((res) => {
                                                            const isFocused = flatResults.indexOf(res) === selectedIndex;
                                                            return (
                                                                <div
                                                                    key={res.id + res.type}
                                                                    className={`bar-result-item ${isFocused ? 'focused' : ''}`}
                                                                    onClick={() => handleResultClick(res)}
                                                                >
                                                                    <div className={`bar-result-icon type-${res.type}`}>
                                                                        {getIcon(res.type)}
                                                                    </div>
                                                                    <div className="bar-result-text">
                                                                        <span className="bar-result-title">{res.title}</span>
                                                                        <span className="bar-result-subtitle">{res.subtitle}</span>
                                                                    </div>
                                                                    <ChevronRight size={14} className="bar-result-arrow" />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="bar-search-empty">No matches found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    className="bar-icon-btn search-trigger"
                                    onClick={() => setIsSearchActive(true)}
                                    title="Search"
                                >
                                    <Search size={20} />
                                </button>
                            )}
                        </div>

                        {/* Upload Action (Only for Uploads variant) */}
                        {variant === 'uploads' && (
                            <button
                                className="bar-icon-btn upload-trigger"
                                onClick={onUploadClick}
                                title="Upload photos"
                            >
                                <Upload size={20} />
                            </button>
                        )}

                        {/* Custom Actions Slot */}
                        {actions}

                        <div className="bar-divider" />

                        {/* Expand/Shrink Action */}
                        <button
                            className="bar-icon-btn expand-trigger"
                            onClick={onExpandToggle}
                            title={isExpanded ? "Shrink view" : "Expand full screen"}
                        >
                            <Maximize2 size={20} style={isExpanded ? { transform: 'rotate(180deg)' } : {}} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

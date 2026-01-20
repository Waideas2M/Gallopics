import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { Photo } from '../types';
import { RotateCcw, Pencil } from 'lucide-react';
import { Header } from '../components/Header';
import { TitleHeader } from '../components/TitleHeader';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { BreadcrumbItem } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { MasonryGrid } from '../components/MasonryGrid';
import { PhotoCard } from '../components/PhotoCard';
import { ModernDropdown } from '../components/ModernDropdown';
import { photos as mockPhotos, getActivePhotographerProfile } from '../data/mockData';
import { mockEvents } from '../data/mockEvents';

import { ScopedSearchBar } from '../components/ScopedSearchBar';
import { Highlights } from '../components/Highlights';
import { ShareIconButton, ActionSeparator, ActionCluster } from '../components/HeaderActions';

// Owner / Manage Logic
import { usePhotographer } from '../context/PhotographerContext';
import { ManageHighlightsModal } from '../components/ManageHighlightsModal';

export function PhotographerProfile() {
    const { id = 'hanna-bjork' } = useParams();
    const navigate = useNavigate();

    // Params
    const [searchParams] = useSearchParams();
    const from = searchParams.get('from');
    const eventId = searchParams.get('eventId');
    const sourceEvent = eventId ? mockEvents.find(e => e.id === eventId) : null;

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'highlights' | 'photos'>('highlights');

    const activeProfile = getActivePhotographerProfile(id);
    const photographer = activeProfile.photographer;
    const photographerAvatar = `/images/${photographer.firstName} ${photographer.lastName}.jpg`;

    // Breadcrumbs
    const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
        const items: BreadcrumbItem[] = [{ label: 'Events', onClick: () => navigate('/') }];
        if ((from === 'event' || from === 'ipro') && sourceEvent) {
            items.push({ label: sourceEvent.name, onClick: () => navigate(`/event/${eventId}`) });
        }
        items.push({ label: `${photographer.firstName} ${photographer.lastName}`, active: true });
        return items;
    }, [from, sourceEvent, eventId, photographer, navigate]);

    // Filter States
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [eventClass, setEventClass] = useState('All');

    useEffect(() => {
        const timer = setTimeout(() => {
            setPhotos(mockPhotos.filter(p => p.photographerId === id));
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [id]);

    // Compute latest event once photos are loaded
    useEffect(() => {
        if (photos.length > 0 && !selectedEventId) {
            const allEvents = [activeProfile.primaryEvent, ...activeProfile.dummyEvents];
            // Since we don't have explicit dates on these dummy events in the profile object easily, 
            // but we want "Latest", let's assume they are sorted or we can find them in COMPETITIONS if IDs match.
            // For now, let's use the first one as "Latest" if no other info.
            if (allEvents.length > 0) {
                setSelectedEventId(allEvents[0].id);
            }
        }
    }, [photos, selectedEventId, activeProfile]);

    const isResetDisabled = !selectedEventId && eventClass === 'All' && searchQuery === '';

    // Options
    const eventOptions = [
        { label: activeProfile.primaryEvent.name, value: activeProfile.primaryEvent.id },
        ...activeProfile.dummyEvents.map(e => ({ label: e.name, value: e.id }))
    ];

    const combinedOptions = useMemo(() => {
        const available = photos.filter(p => (selectedEventId === '' || p.eventId === selectedEventId));
        const uniqueRiders = Array.from(new Set(available.map(p => p.rider))).sort();
        const uniqueHorses = Array.from(new Set(available.map(p => p.horse))).sort();

        return [
            ...uniqueRiders.map(r => ({ label: r, value: r })),
            ...uniqueHorses.map(h => ({ label: h, value: h }))
        ];
    }, [photos, selectedEventId]);

    const filteredPhotos = useMemo(() => {
        return photos.filter(photo => {
            const matchEvent = !selectedEventId || photo.eventId === selectedEventId;
            const matchClass = eventClass === 'All' || (photo.className && photo.className.includes(eventClass)); // Approximate class match

            // Search Query Logic: Matches either Rider OR Horse
            let matchSearch = true;
            if (searchQuery && searchQuery.trim().length > 0) {
                const q = searchQuery.toLowerCase();
                matchSearch = photo.rider.toLowerCase().includes(q) || photo.horse.toLowerCase().includes(q);
            }

            return matchEvent && matchClass && matchSearch;
        });
    }, [photos, selectedEventId, eventClass, searchQuery]);

    const classOptions = [
        { label: 'All Classes', value: 'All' },
        { label: '1.20m', value: '120' },
        { label: '1.30m', value: '130' }
    ];

    // Owner Logic
    const { photographerId: loggedInId, updateHighlights, highlights: contextHighlights, allPhotos: contextPhotos, events: contextEvents, availableToHire, toggleAvailableToHire } = usePhotographer();
    const isOwner = id === loggedInId;
    const [isHighlightsModalOpen, setIsHighlightsModalOpen] = useState(false);

    const totalEvents = activeProfile.dummyEvents.length + 1;
    const totalPhotosCount = photos.length;

    // Resolve Highlights Data
    const displayHighlights: Photo[] = useMemo(() => {
        if (isOwner) {
            // Map context IDs to context photos (source of truth for owner)
            const raw = contextPhotos.filter(p => contextHighlights.includes(p.id));
            // Map to App 'Photo' type
            return raw.map(p => {
                const ev = contextEvents.find(e => e.id === p.eventId);
                return {
                    id: p.id,
                    src: p.url,
                    rider: p.rider || 'Unknown',
                    horse: p.horse || 'Unknown',
                    event: ev?.title || 'Event',
                    eventId: p.eventId,
                    date: ev?.date || 'Today',
                    width: p.width,
                    height: p.height,
                    // Mock helpers
                    className: 'Class A',
                    time: p.timestamp || '12:00',
                    city: ev?.city || 'Stockholm',
                    arena: ev?.venueName || 'Main Arena',
                    countryCode: 'SE',
                    discipline: ev?.disciplines?.[0] || 'Showjumping'
                };
            });
        }
        // Public view: Map IDs to mockData photos
        return (photographer.highlights || [])
            .map(id => mockPhotos.find(p => p.id === id))
            .filter((p): p is Photo => !!p);
    }, [isOwner, contextHighlights, contextPhotos, photographer.highlights, contextEvents]);

    // Tabs Style
    const tabContainerStyle: React.CSSProperties = {
        background: '#fff',
        borderBottom: '1px solid #eaeaea',
        paddingBottom: 0
    };

    const tabStyle: React.CSSProperties = {
        padding: '16px 24px',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#666',
        borderBottom: '2px solid transparent',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        borderBottomWidth: '2px',
        transition: 'all 0.2s',
        marginBottom: '-1px'
    };

    const activeTabStyle: React.CSSProperties = {
        ...tabStyle,
        color: '#1B3AEC', // Brand color
        borderBottom: '2px solid #1B3AEC'
    };

    return (
        <div className="page-wrapper">
            <Header />

            <Breadcrumbs items={breadcrumbs} />

            <TitleHeader
                className="no-border"
                title={`${photographer.firstName} ${photographer.lastName}`}
                avatar={photographerAvatar}
                avatarVariant="photographer"
                subtitle={`Photographer • ${photographer.city || 'Sweden'}`}
                stats={
                    <div className="event-stats-row">
                        <span>{totalEvents} events</span>
                        <span className="meta-bullet">•</span>
                        <span>{totalPhotosCount} photos</span>
                    </div>
                }
                rightContent={
                    <ActionCluster>
                        {isOwner && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                                    {/* Toggle Switch */}
                                    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px', margin: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={availableToHire}
                                            onChange={(e) => toggleAvailableToHire(e.target.checked)}
                                            style={{ opacity: 0, width: 0, height: 0 }}
                                        />
                                        <span style={{
                                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: availableToHire ? '#1B3AEC' : '#e5e5e5', borderRadius: '34px', transition: '.4s'
                                        }}></span>
                                        <span style={{
                                            position: 'absolute', content: '""', height: '16px', width: '16px', left: availableToHire ? '22px' : '2px', bottom: '2px',
                                            backgroundColor: 'white', borderRadius: '50%', transition: '.4s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                        }}></span>
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Hire Button logic: Show if Owner (driven by context) or if Guest & Available */}
                        {(isOwner ? availableToHire : photographer.isAvailableToHire) ? (
                            <button className="btn-primary-small">Hire me</button>
                        ) : (
                            <button className="btn-primary-small" disabled style={{ background: '#F3F4F6', color: '#9CA3AF', border: 'none', cursor: 'not-allowed', boxShadow: 'none' }}>Not available atm</button>
                        )}

                        <ActionSeparator />
                        <ShareIconButton />
                    </ActionCluster>
                }
            />

            <ManageHighlightsModal
                isOpen={isHighlightsModalOpen}
                onClose={() => setIsHighlightsModalOpen(false)}
                initialIds={contextHighlights}
                onSave={updateHighlights}
            />

            {/* Profile Tabs - Only show if Owner OR there are highlights to show */}
            {(isOwner || displayHighlights.length > 0) && (
                <div style={tabContainerStyle}>
                    <div className="container" style={{ display: 'flex', gap: 0 }}>
                        <button
                            style={activeTab === 'highlights' ? activeTabStyle : tabStyle}
                            onClick={() => setActiveTab('highlights')}
                        >
                            Highlights
                        </button>
                        <button
                            style={activeTab === 'photos' ? activeTabStyle : tabStyle}
                            onClick={() => setActiveTab('photos')}
                        >
                            Photos
                        </button>
                    </div>
                </div>
            )}

            {/* Content Section - Gradient Grey Background */}
            <div style={{ minHeight: '60vh', paddingTop: 24 }}>
                {((isOwner || displayHighlights.length > 0) ? activeTab : 'photos') === 'highlights' ? (
                    <div className="container" style={{ paddingBottom: 80 }}>
                        {displayHighlights.length > 0 && isOwner && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                                <button
                                    className="btn-outline"
                                    style={{
                                        height: '36px',
                                        padding: '0 16px',
                                        fontSize: '0.85rem',
                                        gap: '8px',
                                        borderRadius: '99px',
                                        background: '#fff',
                                        border: '1px solid #e5e5e5'
                                    }}
                                    onClick={() => setIsHighlightsModalOpen(true)}
                                >
                                    <Pencil size={14} />
                                    Edit highlights
                                </button>
                            </div>
                        )}

                        {/* Empty State for Owner */}
                        {isOwner && displayHighlights.length === 0 ? (
                            <div style={{
                                gridColumn: '1 / -1',
                                border: '2px dashed #e5e5e5',
                                borderRadius: '16px',
                                background: '#f9f9f9',
                                height: '300px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '16px',
                                textAlign: 'center',
                                color: '#666'
                            }}>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#111' }}>Showcase your best work</div>
                                <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>
                                    Select your best photos to display them at the top of your profile.
                                </p>
                                <button className="btn-primary" onClick={() => setIsHighlightsModalOpen(true)}>
                                    Add photos
                                </button>
                            </div>
                        ) : (
                            <Highlights items={displayHighlights} />
                        )}
                    </div>
                ) : (
                    <section className="grid-section" style={{ background: 'transparent', padding: 0 }}>
                        <div className="container">
                            <div className="filters-wrapper">
                                <div className="filter-row">
                                    <div className="filter-group">
                                        <ModernDropdown
                                            value={selectedEventId}
                                            options={eventOptions}
                                            onChange={setSelectedEventId}
                                            label="Event"
                                            placeholder="Event"
                                            showSearch={true}
                                            searchPlaceholder="Search events..."
                                            variant="pill"
                                        />
                                        <ModernDropdown
                                            value={eventClass}
                                            options={classOptions}
                                            onChange={setEventClass}
                                            label="Class"
                                            placeholder="Class"
                                            variant="pill"
                                        />
                                        <div style={{ flex: 2, minWidth: '300px' }}>
                                            <ScopedSearchBar
                                                placeholder="Search by riders or horses..."
                                                options={combinedOptions}
                                                currentValue={searchQuery}
                                                onSelect={(val) => setSearchQuery(val)}
                                                onSearchChange={(val) => setSearchQuery(val)}
                                            />
                                        </div>
                                        <button
                                            className="filter-reset-btn"
                                            onClick={() => {
                                                const allEvents = [activeProfile.primaryEvent, ...activeProfile.dummyEvents];
                                                if (allEvents.length > 0) setSelectedEventId(allEvents[0].id);
                                                setEventClass('All');
                                                setSearchQuery('');
                                            }}
                                            title="Reset filters"
                                            disabled={isResetDisabled}
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                    </div>

                                    <div className="filter-results-count">
                                        Showing {filteredPhotos.length} photos
                                    </div>
                                </div>
                            </div>

                            <MasonryGrid
                                isLoading={isLoading}
                                renderSkeleton={() => (
                                    <div className="photo-card skeleton-card">
                                        <div className="card-image-wrapper" style={{ aspectRatio: '3/4', background: '#f5f5f5' }}></div>
                                        <div className="card-content">
                                            <div style={{ height: 16, width: '70%', background: '#eee', marginBottom: 6, borderRadius: 4 }}></div>
                                            <div style={{ height: 12, width: '40%', background: '#eee', borderRadius: 4 }}></div>
                                        </div>
                                    </div>
                                )}
                            >
                                {filteredPhotos.map((photo) => (
                                    <PhotoCard
                                        key={photo.id}
                                        photo={photo}
                                        onClick={(p) => navigate(`/photo/${p.id}?from=ppro`)}
                                    />
                                ))}
                            </MasonryGrid>
                        </div>
                    </section>
                )}
            </div>

            <Footer minimal={true} />
        </div>
    );
}

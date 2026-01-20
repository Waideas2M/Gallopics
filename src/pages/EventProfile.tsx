import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Header } from '../components/Header';
import { TitleHeader } from '../components/TitleHeader';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { MasonryGrid } from '../components/MasonryGrid';
import { PhotoCard } from '../components/PhotoCard';
import { ModernDropdown } from '../components/ModernDropdown';
import { InfoChip } from '../components/InfoChip';
import { eventDetails } from '../data/mockEventDetails';
import { photos as basePhotos, RIDERS, HORSES, RIDER_PRIMARY_HORSE, PHOTOGRAPHERS } from '../data/mockData';
import { ShareIconButton, ActionSeparator, ActionCluster } from '../components/HeaderActions';
import { ScopedSearchBar } from '../components/ScopedSearchBar';
import type { Photo, ClassSection } from '../types';
import './EventProfile.css';

// Helpers for randomization
function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

const generateEventPhotos = (eventId: string, count: number, discipline?: string): Photo[] => {
    const srcPool = Array.from(new Set(basePhotos.map(p => p.src)));
    const comp = eventDetails.find(e => e.meetingId === eventId)?.meeting;
    const eventName = comp?.name || 'Gallopics Event';
    const eventDate = comp?.period.startDate || '2026-01-01';

    return Array.from({ length: count }).map((_, i) => {
        const src = pick(srcPool);
        const rider = pick(RIDERS);
        const horseMapping = RIDER_PRIMARY_HORSE.find(m => m.riderId === rider.id);
        const horse = HORSES.find(h => h.id === horseMapping?.primaryHorseId) || HORSES[0];

        const ratioType = Math.random();
        let width = 600;
        let height = 800;

        if (ratioType > 0.66) {
            width = 800;
            height = 600;
        } else if (ratioType > 0.33) {
            width = 800;
            height = 800;
        }

        if (ratioType < 0.33) {
            height += randomInt(-50, 50);
        }

        return {
            id: `${eventId}-p-${i}-${Math.random().toString(36).substr(2, 5)}`,
            src,
            rider: `${rider.firstName} ${rider.lastName}`,
            horse: horse.name,
            event: eventName,
            eventId: eventId,
            date: eventDate,
            width,
            height,
            className: 'photo-grid-item',
            time: `${9 + (i % 8)}:00`,
            city: comp?.city || 'Sweden',
            arena: 'Main Arena',
            countryCode: comp?.country.code.toLowerCase() || 'se',
            discipline: discipline || 'Show Jumping',
            photographer: comp?.photographer?.name || 'Gallopics',
            photographerId: comp?.photographer?.id
        };
    });
};

export function EventProfile() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const eventDetail = eventDetails.find(e => e.meetingId === eventId);
    const eventPhotographer = useMemo(() => PHOTOGRAPHERS.find(p => p.primaryEventId === eventId), [eventId]);

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [eventClass, setEventClass] = useState('All');

    useEffect(() => {
        if (eventDetail) {
            setLoading(true);
            setTimeout(() => {
                const generated = generateEventPhotos(eventDetail.meetingId, eventDetail.meeting.photoCount, eventDetail.meeting.disciplines[0]);
                setPhotos(generated);
                setLoading(false);
            }, 600);
        }
    }, [eventDetail]);

    const isResetDisabled = eventClass === 'All' && searchQuery === '';

    // 1. Get List of all available Competitions for the event
    const allEventClasses = useMemo(() => {
        if (!eventDetail) return [];
        const classes: ClassSection[] = [];
        eventDetail.schedule.forEach(day =>
            day.arenas.forEach(arena =>
                arena.competitions.forEach(comp => classes.push(comp))
            )
        );
        return classes;
    }, [eventDetail]);

    const classOptions = useMemo(() => {
        const unique = Array.from(new Set(allEventClasses.map(c => c.name))).sort();
        return [{ label: 'All Classes', value: 'All' }, ...unique.map(c => ({ label: c, value: c }))];
    }, [allEventClasses]);

    const combinedOptions = useMemo(() => {
        const uniqueRiders = Array.from(new Set(photos.map(p => p.rider))).sort();
        const uniqueHorses = Array.from(new Set(photos.map(p => p.horse))).sort();

        return [
            ...uniqueRiders.map(r => ({ label: r, value: r })),
            ...uniqueHorses.map(h => ({ label: h, value: h }))
        ];
    }, [photos]);

    // 3. Absolute Totals for Header (Stable)
    const totalRiders = useMemo(() => new Set(photos.map(p => p.rider)).size, [photos]);
    const totalHorses = useMemo(() => new Set(photos.map(p => p.horse)).size, [photos]);

    // 4. Final Photo Filtering
    const activePhotos = useMemo(() => {
        if (!photos.length) return [];
        return photos.filter(p => {
            const matchClass = eventClass === 'All' || p.arena.includes(eventClass); // Arena is used as mock for Class location

            // Search Query Logic: Matches either Rider OR Horse
            let matchSearch = true;
            if (searchQuery && searchQuery.trim().length > 0) {
                const q = searchQuery.toLowerCase();
                matchSearch = p.rider.toLowerCase().includes(q) || p.horse.toLowerCase().includes(q);
            }

            return matchClass && matchSearch;
        });
    }, [photos, searchQuery, eventClass]);

    if (!eventDetail) return <div className="container" style={{ paddingTop: '120px' }}>Event not found</div>;

    const { meeting } = eventDetail;

    return (
        <div className="page-wrapper">
            <Header />

            <Breadcrumbs
                items={[
                    { label: 'Events', onClick: () => navigate('/') },
                    { label: meeting.name, active: true }
                ]}
            />

            <TitleHeader
                title={meeting.name}
                avatar={meeting.logo}
                avatarShape="square"
                topSubtitle={
                    <span className="meta-item">
                        {new Date(meeting.period.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {' - '}
                        {new Date(meeting.period.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                }
                subtitle={
                    <div className="event-meta-row" style={{ textDecoration: 'none' }}>
                        <span className="meta-item">{meeting.country.code === 'SE' ? '🇸🇪' : ''} {meeting.city}</span>
                        <span className="meta-bullet">•</span>
                        <span className="meta-item">{meeting.venueName}</span>
                        <span className="meta-bullet">•</span>
                        <span className="meta-item">{meeting.disciplines.join(', ')}</span>
                    </div>
                }
                stats={
                    <div className="event-stats-row">
                        <span>{totalRiders} riders</span>
                        <span className="meta-bullet">•</span>
                        <span>{totalHorses} horses</span>
                        <span className="meta-bullet">•</span>
                        <span>{meeting.photoCount} photos</span>
                    </div>
                }
                rightContent={
                    <ActionCluster>
                        {eventPhotographer && (
                            <>
                                <InfoChip
                                    label="Photographer"
                                    name={`${eventPhotographer.firstName} ${eventPhotographer.lastName}`}
                                    variant="photographer"
                                    avatarUrl={`/images/${eventPhotographer.firstName} ${eventPhotographer.lastName}.jpg`}
                                    onClick={() => navigate(`/photographer/${eventPhotographer.id}?from=event&eventId=${eventId}`)}
                                />
                                <ActionSeparator />
                            </>
                        )}
                        <ShareIconButton />
                    </ActionCluster>
                }
            />

            <section className="grid-section">
                <div className="container">
                    <div className="filters-wrapper">
                        <div className="filter-row">
                            <div className="filter-group">
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
                                Showing {activePhotos.length} photos
                            </div>
                        </div>
                    </div>

                    <MasonryGrid
                        isLoading={loading}
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
                        {activePhotos.map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                onClick={(p) => navigate(`/photo/${p.id}?from=epro&eventId=${meeting.id}`)}
                            />
                        ))}
                    </MasonryGrid>

                    {!loading && activePhotos.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
                            <h3>No photos found</h3>
                            <button
                                onClick={() => { setSearchQuery(''); setEventClass('All'); }}
                                style={{
                                    marginTop: '16px', background: '#eee', padding: '8px 24px', borderRadius: '20px', fontSize: '0.9rem'
                                }}
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <Footer minimal={true} />
        </div>
    );
}

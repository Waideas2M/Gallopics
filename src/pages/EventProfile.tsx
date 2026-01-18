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
import { photos as basePhotos, RIDERS, HORSES, RIDER_PRIMARY_HORSE, HORSE_PRIMARY_RIDER, PHOTOGRAPHERS } from '../data/mockData';
import type { Photo, ClassSection } from '../types';
import './EventProfile.css';

// Helpers for randomization
function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

const generateEventPhotos = (eventId: string, count: number, discipline?: string): Photo[] => {
    const srcPool = Array.from(new Set(basePhotos.map(p => p.src)));

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
            event: 'Mock Event',
            eventId: eventId,
            date: '2026-01-01',
            width,
            height,
            className: 'photo-grid-item',
            time: '12:00',
            city: 'Stockholm',
            arena: 'Main Arena',
            countryCode: 'SE',
            discipline: discipline || 'Show Jumping'
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

    const [discipline, setDiscipline] = useState('All');
    const [rider, setRider] = useState('All');
    const [horse, setHorse] = useState('All');
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

    const isResetDisabled = discipline === 'All' && eventClass === 'All' && rider === 'All' && horse === 'All';

    // Handle Rider Selection -> Auto-select Horse
    const handleRiderChange = (newRider: string) => {
        setRider(newRider);
        if (newRider !== 'All') {
            const rData = RIDERS.find(r => `${r.firstName} ${r.lastName}` === newRider);
            if (rData) {
                const mapping = RIDER_PRIMARY_HORSE.find(m => m.riderId === rData.id);
                const hData = HORSES.find(h => h.id === mapping?.primaryHorseId);
                if (hData) setHorse(hData.name);
            }
        }
    };

    // Handle Horse Selection -> Auto-select Rider
    const handleHorseChange = (newHorse: string) => {
        setHorse(newHorse);
        if (newHorse !== 'All') {
            const hData = HORSES.find(h => h.name === newHorse);
            if (hData) {
                const mapping = HORSE_PRIMARY_RIDER.find(m => m.horseId === hData.id);
                const rData = RIDERS.find(r => r.id === mapping?.primaryRiderId);
                if (rData) setRider(`${rData.firstName} ${rData.lastName}`);
            }
        }
    };

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

    // 2. Derive options based on current selection (Dependent logic)
    const disciplineOptions = useMemo(() => {
        const unique = Array.from(new Set(allEventClasses.map(c => c.discipline))).sort();
        return [{ label: 'All Disciplines', value: 'All' }, ...unique.map(d => ({ label: d, value: d }))];
    }, [allEventClasses]);

    const classOptions = useMemo(() => {
        const filteredByDiscipline = allEventClasses.filter(c => discipline === 'All' || c.discipline === discipline);
        const unique = Array.from(new Set(filteredByDiscipline.map(c => c.name))).sort();
        return [{ label: 'All Classes', value: 'All' }, ...unique.map(c => ({ label: c, value: c }))];
    }, [allEventClasses, discipline]);

    const riderOptions = useMemo(() => {
        // If Horse is selected, strictly limit to that horse's rider
        if (horse !== 'All') {
            const hData = HORSES.find(h => h.name === horse);
            const mapping = HORSE_PRIMARY_RIDER.find(m => m.horseId === hData?.id);
            const rData = RIDERS.find(r => r.id === mapping?.primaryRiderId);
            if (rData) return [{ label: `${rData.firstName} ${rData.lastName}`, value: `${rData.firstName} ${rData.lastName}` }];
        }
        const available = photos.filter(p =>
            (discipline === 'All' || p.discipline === discipline)
        );
        const unique = Array.from(new Set(available.map(p => p.rider))).sort();
        return [{ label: 'All Riders', value: 'All' }, ...unique.map(r => ({ label: r, value: r }))];
    }, [photos, horse, discipline]);

    const horseOptions = useMemo(() => {
        // If Rider is selected, strictly limit to that rider's horse
        if (rider !== 'All') {
            const rData = RIDERS.find(r => `${r.firstName} ${r.lastName}` === rider);
            const mapping = RIDER_PRIMARY_HORSE.find(m => m.riderId === rData?.id);
            const hData = HORSES.find(h => h.id === mapping?.primaryHorseId);
            if (hData) return [{ label: hData.name, value: hData.name }];
        }
        const available = photos.filter(p =>
            (discipline === 'All' || p.discipline === discipline)
        );
        const unique = Array.from(new Set(available.map(p => p.horse))).sort();
        return [{ label: 'All Horses', value: 'All' }, ...unique.map(h => ({ label: h, value: h }))];
    }, [photos, rider, discipline]);

    // 3. Absolute Totals for Header (Stable)
    const totalRiders = useMemo(() => new Set(photos.map(p => p.rider)).size, [photos]);
    const totalHorses = useMemo(() => new Set(photos.map(p => p.horse)).size, [photos]);

    // 4. Final Photo Filtering
    const activePhotos = useMemo(() => {
        if (!photos.length) return [];
        return photos.filter(p => {
            const matchDiscipline = discipline === 'All' || p.discipline === discipline;
            const matchClass = eventClass === 'All' || p.arena.includes(eventClass); // Arena is used as mock for Class location
            const matchRider = rider === 'All' || p.rider === rider;
            const matchHorse = horse === 'All' || p.horse === horse;
            return matchDiscipline && matchClass && matchRider && matchHorse;
        });
    }, [photos, rider, horse, discipline, eventClass]);

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
                    eventPhotographer ? (
                        <InfoChip
                            label="Photographer"
                            name={`${eventPhotographer.firstName} ${eventPhotographer.lastName}`}
                            avatarUrl={`/images/${eventPhotographer.firstName} ${eventPhotographer.lastName}.jpg`}
                            fallbackIcon="camera"
                            onClick={() => navigate(`/photographer/${eventPhotographer.id}?from=event&eventId=${eventId}`)}
                        />
                    ) : null
                }
            />

            <section className="grid-section">
                <div className="container">
                    <div className="filters-wrapper">
                        <div className="filter-row">
                            <div className="filter-group">
                                <ModernDropdown
                                    value={discipline}
                                    options={disciplineOptions}
                                    onChange={(val) => { setDiscipline(val); setEventClass('All'); }}
                                    label="Discipline"
                                    placeholder="Discipline"
                                />
                                <ModernDropdown
                                    value={eventClass}
                                    options={classOptions}
                                    onChange={setEventClass}
                                    label="Class"
                                    placeholder="Class"
                                />
                                <ModernDropdown
                                    value={rider}
                                    options={riderOptions}
                                    onChange={handleRiderChange}
                                    label="Rider"
                                    placeholder="Rider"
                                    showSearch={true}
                                    searchPlaceholder="Search riders..."
                                />
                                <ModernDropdown
                                    value={horse}
                                    options={horseOptions}
                                    onChange={handleHorseChange}
                                    label="Horse"
                                    placeholder="Horse"
                                    showSearch={true}
                                    searchPlaceholder="Search horses..."
                                />
                                <button
                                    className="filter-reset-btn"
                                    onClick={() => {
                                        setDiscipline('All');
                                        setEventClass('All');
                                        setRider('All');
                                        setHorse('All');
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
                                onClick={() => { setRider('All'); setHorse('All'); setDiscipline('All'); setEventClass('All'); }}
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

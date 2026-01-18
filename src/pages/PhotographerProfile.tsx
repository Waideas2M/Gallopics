import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { Photo } from '../types';
import { RotateCcw } from 'lucide-react';
import { Header } from '../components/Header';
import { TitleHeader } from '../components/TitleHeader';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { BreadcrumbItem } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { MasonryGrid } from '../components/MasonryGrid';
import { PhotoCard } from '../components/PhotoCard';
import { ModernDropdown } from '../components/ModernDropdown';
import { photos as mockPhotos, getActivePhotographerProfile, RIDERS, HORSES, RIDER_PRIMARY_HORSE, HORSE_PRIMARY_RIDER } from '../data/mockData';
import { mockEvents } from '../data/mockEvents';

export function PhotographerProfile() {
    const { id = 'p1' } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const from = searchParams.get('from');
    const eventId = searchParams.get('eventId');
    const sourceEvent = eventId ? mockEvents.find(e => e.id === eventId) : null;

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const activeProfile = getActivePhotographerProfile(id);
    const photographerAvatar = `/images/${activeProfile.photographer.firstName} ${activeProfile.photographer.lastName}.jpg`;

    // Breadcrumb path construction
    const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
        const items: BreadcrumbItem[] = [{ label: 'Events', onClick: () => navigate('/') }];
        if ((from === 'event' || from === 'ipro') && sourceEvent) {
            items.push({ label: sourceEvent.name, onClick: () => navigate(`/event/${eventId}`) });
        }
        items.push({ label: `${activeProfile.photographer.firstName} ${activeProfile.photographer.lastName}`, active: true });
        return items;
    }, [from, sourceEvent, eventId, activeProfile, navigate]);

    // Filter states
    const [selectedEventId, setSelectedEventId] = useState<string>('all');
    const [discipline, setDiscipline] = useState('All');
    const [rider, setRider] = useState('All');
    const [horse, setHorse] = useState('All');
    const [eventClass, setEventClass] = useState('All');

    useEffect(() => {
        const timer = setTimeout(() => {
            setPhotos(mockPhotos);
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const isResetDisabled = selectedEventId === 'all' && discipline === 'All' && eventClass === 'All' && rider === 'All' && horse === 'All';

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

    const filteredPhotos = useMemo(() => {
        return photos.filter(photo => {
            const matchEvent = selectedEventId === 'all' || photo.eventId === selectedEventId;
            const matchDiscipline = discipline === 'All' || photo.discipline === discipline;
            const matchRider = rider === 'All' || photo.rider === rider;
            const matchHorse = horse === 'All' || photo.horse === horse;
            return matchEvent && matchDiscipline && matchRider && matchHorse;
        });
    }, [photos, selectedEventId, discipline, rider, horse]);

    // Options mapping
    const eventOptions = [
        { label: 'All Events', value: 'all' },
        { label: activeProfile.primaryEvent.name, value: activeProfile.primaryEvent.id },
        ...activeProfile.dummyEvents.map(e => ({ label: e.name, value: e.id }))
    ];

    const disciplineOptions = useMemo(() => {
        const available = photos.filter(p => selectedEventId === 'all' || p.eventId === selectedEventId);
        const unique = Array.from(new Set(available.map(p => p.discipline).filter(Boolean))).sort();
        return [{ label: 'All Disciplines', value: 'All' }, ...unique.map(d => ({ label: d as string, value: d as string }))];
    }, [photos, selectedEventId]);

    const riderOptions = useMemo(() => {
        // If Horse is selected, strictly limit to that horse's rider
        if (horse !== 'All') {
            const hData = HORSES.find(h => h.name === horse);
            const mapping = HORSE_PRIMARY_RIDER.find(m => m.horseId === hData?.id);
            const rData = RIDERS.find(r => r.id === mapping?.primaryRiderId);
            if (rData) return [{ label: `${rData.firstName} ${rData.lastName}`, value: `${rData.firstName} ${rData.lastName}` }];
        }
        const available = photos.filter(p => (selectedEventId === 'all' || p.eventId === selectedEventId) && (discipline === 'All' || p.discipline === discipline));
        const unique = Array.from(new Set(available.map(p => p.rider))).sort();
        return [{ label: 'All Riders', value: 'All' }, ...unique.map(r => ({ label: r, value: r }))];
    }, [photos, horse, selectedEventId, discipline]);

    const horseOptions = useMemo(() => {
        // If Rider is selected, strictly limit to that rider's horse
        if (rider !== 'All') {
            const rData = RIDERS.find(r => `${r.firstName} ${r.lastName}` === rider);
            const mapping = RIDER_PRIMARY_HORSE.find(m => m.riderId === rData?.id);
            const hData = HORSES.find(h => h.id === mapping?.primaryHorseId);
            if (hData) return [{ label: hData.name, value: hData.name }];
        }
        const available = photos.filter(p => (selectedEventId === 'all' || p.eventId === selectedEventId) && (discipline === 'All' || p.discipline === discipline));
        const unique = Array.from(new Set(available.map(p => p.horse))).sort();
        return [{ label: 'All Horses', value: 'All' }, ...unique.map(h => ({ label: h, value: h }))];
    }, [photos, rider, selectedEventId, discipline]);

    const classOptions = [
        { label: 'All Classes', value: 'All' },
        { label: '1.20m', value: '120' },
        { label: '1.30m', value: '130' }
    ];

    // Absolute Totals for Header (Stable)
    const totalEvents = activeProfile.dummyEvents.length + 1;
    const totalPhotosCount = photos.length;

    return (
        <div className="page-wrapper">
            <Header />

            <Breadcrumbs items={breadcrumbs} />

            <TitleHeader
                title={`${activeProfile.photographer.firstName} ${activeProfile.photographer.lastName}`}
                avatar={photographerAvatar}
                subtitle="Photographer"
                stats={
                    <div className="event-stats-row">
                        <span>{totalEvents} events</span>
                        <span className="meta-bullet">•</span>
                        <span>{totalPhotosCount} photos</span>
                    </div>
                }
                rightContent={
                    <button className="btn-primary-small">Hire me</button>
                }
            />

            <section className="grid-section">
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
                                />
                                <ModernDropdown
                                    value={discipline}
                                    options={disciplineOptions}
                                    onChange={setDiscipline}
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
                                        setSelectedEventId('all');
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

            <Footer minimal={true} />
        </div>
    );
}

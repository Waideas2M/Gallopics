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
import { InfoChip } from '../components/InfoChip';
import { photos as mockPhotos, RIDERS, HORSES, COMPETITIONS } from '../data/mockData';

import { useCart } from '../context/CartContext';
import './ImageProfile.css'; // Re-use toast styles or add new ones

export function RiderProfile() {
    const { riderId = 'r1' } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const from = searchParams.get('from');
    const photoId = searchParams.get('photoId');
    const { cart, addToCart } = useCart();
    const [toast, setToast] = useState<{ message: string } | null>(null);

    // Auto-hide toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Data Loading
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const activeRider = useMemo(() => {
        return RIDERS.find(r => r.id === riderId) || RIDERS[0];
    }, [riderId]);

    const riderAvatar = `/images/${activeRider.firstName} ${activeRider.lastName}.jpg`;

    // Breadcrumb path construction
    const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
        const items: BreadcrumbItem[] = [];

        if (from === 'photo' && photoId) {
            items.push({ label: 'Back to photo', onClick: () => navigate(`/photo/${photoId}`) });
        } else {
            items.push({ label: 'Events', onClick: () => navigate('/') });
        }

        items.push({ label: `${activeRider.firstName} ${activeRider.lastName}`, active: true });
        return items;
    }, [navigate, activeRider, from, photoId]);

    // Filter states
    const [selectedEventId, setSelectedEventId] = useState<string>('all');
    const [discipline, setDiscipline] = useState('All');
    const [horse, setHorse] = useState('All');
    const [eventClass, setEventClass] = useState('All');
    const [photographer, setPhotographer] = useState('All');

    useEffect(() => {
        const timer = setTimeout(() => {
            // Filter global mock photos by this rider name or ID logic
            // In mockData.ts, photos usually have 'rider' field as "FirstName LastName"
            // We need to match that.
            const riderFullName = `${activeRider.firstName} ${activeRider.lastName}`;
            const riderPhotos = mockPhotos.filter(p => p.rider === riderFullName);
            setPhotos(riderPhotos);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [activeRider]);

    const isResetDisabled = selectedEventId === 'all' && discipline === 'All' && eventClass === 'All' && horse === 'All' && photographer === 'All';

    // Filters Inter-dependency? 
    // Usually selecting a horse constrains photos, which might constrain available events.
    // The "options" memos below handle the "available photos" based on other filters.

    const filteredPhotos = useMemo(() => {
        return photos.filter(photo => {
            const matchEvent = selectedEventId === 'all' || photo.eventId === selectedEventId;
            const matchDiscipline = discipline === 'All' || photo.discipline === discipline;
            const matchHorse = horse === 'All' || photo.horse === horse;
            const matchClass = eventClass === 'All' || ((photo as any).class || '1.30m') === eventClass; // Mock class match
            const matchPhotographer = photographer === 'All' || ((photo as any).photographer || 'Unknown') === photographer;

            return matchEvent && matchDiscipline && matchHorse && matchClass && matchPhotographer;
        });
    }, [photos, selectedEventId, discipline, horse, eventClass, photographer]);

    // Derived Options based on current photos (or all rider photos for inclusive filtering?)
    // Usually standard drill-down: Available options are based on current filtered set (excluding self-filter to avoid lock-out?)
    // Or based on "all rider photos" but constrained by other selections.
    // Let's use "available based on OTHER filters" pattern.

    const getAvailable = (scopingFilter: (p: Photo) => boolean) => photos.filter(scopingFilter);

    const eventOptions = useMemo(() => {
        const available = getAvailable(p =>
            (discipline === 'All' || p.discipline === discipline) &&
            (horse === 'All' || p.horse === horse) &&
            (eventClass === 'All' || ((p as any).class || '1.30m') === eventClass) &&
            (photographer === 'All' || ((p as any).photographer || 'Unknown') === photographer)
        );
        const uniqueIds = Array.from(new Set(available.map(p => p.eventId)));
        const relevantEvents = COMPETITIONS.filter(c => uniqueIds.includes(c.id));
        return [{ label: 'All Events', value: 'all' }, ...relevantEvents.map(e => ({ label: e.name, value: e.id }))];
    }, [photos, discipline, horse, eventClass, photographer]);

    const disciplineOptions = useMemo(() => {
        const available = getAvailable(p =>
            (selectedEventId === 'all' || p.eventId === selectedEventId) &&
            (horse === 'All' || p.horse === horse)
        );
        const unique = Array.from(new Set(available.map(p => p.discipline).filter(Boolean))).sort();
        return [{ label: 'All Disciplines', value: 'All' }, ...unique.map(d => ({ label: d as string, value: d as string }))];
    }, [photos, selectedEventId, horse]);

    const classOptions = [
        { label: 'All Classes', value: 'All' },
        { label: '1.20m', value: '1.20m' },
        { label: '1.30m', value: '1.30m' }
    ];

    const horseOptions = useMemo(() => {
        const available = getAvailable(p =>
            (selectedEventId === 'all' || p.eventId === selectedEventId) &&
            (discipline === 'All' || p.discipline === discipline)
        );
        const unique = Array.from(new Set(available.map(p => p.horse))).sort();
        return [{ label: 'All Horses', value: 'All' }, ...unique.map(h => ({ label: h, value: h }))];
    }, [photos, selectedEventId, discipline]);

    const photographerOptions = useMemo(() => {
        const available = getAvailable(p =>
            (selectedEventId === 'all' || p.eventId === selectedEventId)
        );
        // Photo mock data doesn't explicitly have photographerId usually, just 'photographer' string maybe?
        // Let's check types. Photo type usually implies it. 
        // In mockData context, activeProfile uses firstName lastName mapping.
        // Let's assume photo.photographer is a string name.
        const unique = Array.from(new Set(available.map(p => p.photographer).filter(Boolean))).sort();
        return [{ label: 'All Photographers', value: 'All' }, ...unique.map(ph => ({ label: ph as string, value: ph as string }))];
    }, [photos, selectedEventId]);


    // Header Stats
    const totalEvents = new Set(photos.map(p => p.eventId)).size;
    const totalPhotosCount = photos.length;

    return (
        <div className="page-wrapper">
            <Header />

            <Breadcrumbs items={breadcrumbs} />

            <TitleHeader
                title={`${activeRider.firstName} ${activeRider.lastName}`}
                avatar={riderAvatar}
                subtitle="Rider"
                stats={
                    <div className="event-stats-row">
                        <span>{totalEvents} events</span>
                        <span className="meta-bullet">•</span>
                        <span>{totalPhotosCount} photos</span>
                    </div>
                }
                rightContent={
                    (() => {
                        // Find primary horse
                        if (photos.length === 0) return null;
                        const horseCounts: { [key: string]: number } = {};
                        photos.forEach(p => {
                            horseCounts[p.horse] = (horseCounts[p.horse] || 0) + 1;
                        });
                        const topHorseName = Object.keys(horseCounts).reduce((a, b) => horseCounts[a] > horseCounts[b] ? a : b);
                        const topHorse = HORSES.find(h => h.name === topHorseName);

                        if (!topHorse) return null;

                        return (
                            <InfoChip
                                label="Primary Horse"
                                name={topHorse.name}
                                avatarUrl={`/images/${topHorse.name}.jpg`}
                                fallbackIcon="camera"
                                onClick={() => navigate(`/horse/${topHorse.id}?from=rider&riderId=${riderId}`)}
                            />
                        );
                    })()
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
                                    label="Events"
                                    placeholder="Events"
                                    showSearch={true}
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
                                    value={horse}
                                    options={horseOptions}
                                    onChange={setHorse}
                                    label="Horses"
                                    placeholder="Horses"
                                    showSearch={true}
                                />
                                <ModernDropdown
                                    value={photographer}
                                    options={photographerOptions}
                                    onChange={setPhotographer}
                                    label="Photographer"
                                    placeholder="Photographer"
                                />
                                <button
                                    className="filter-reset-btn"
                                    onClick={() => {
                                        setSelectedEventId('all');
                                        setDiscipline('All');
                                        setEventClass('All');
                                        setHorse('All');
                                        setPhotographer('All');
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
                                onClick={(p) => navigate(`/photo/${p.id}?from=rider&riderId=${activeRider.id}`)}
                                onAddToCart={(p) => {
                                    // Check if in cart
                                    const isInCart = cart.some(item => item.photoId === p.id && item.quality === 'high');
                                    if (isInCart) {
                                        setToast({ message: 'Already in cart' });
                                        return;
                                    }
                                    addToCart(p, 'high', 'High Resolution', 999);
                                    setToast({ message: 'Added to cart' });
                                }}
                            />
                        ))}
                    </MasonryGrid>
                </div>
            </section>

            {/* Toast Notification */}
            {toast && (
                <div className="toast-notification">
                    <span>{toast.message}</span>
                </div>
            )}

            <Footer minimal={true} />
        </div>
    );
}

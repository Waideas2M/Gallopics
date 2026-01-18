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
import { photos as mockPhotos, HORSES, RIDERS, COMPETITIONS } from '../data/mockData';

import { useCart } from '../context/CartContext';
import './ImageProfile.css'; // Toast styles

export function HorseProfile() {
    const { horseId = 'h1' } = useParams();
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

    const activeHorse = useMemo(() => {
        return HORSES.find(h => h.id === horseId) || HORSES[0];
    }, [horseId]);

    // Horse avatar - placeholder or if we have horse images
    // For now use a generic or name based path
    const horseAvatar = `/images/${activeHorse.name}.jpg`; // Will likely fallback to placeholder if not found

    // Breadcrumb path construction
    const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
        const items: BreadcrumbItem[] = [];

        if (from === 'photo' && photoId) {
            items.push({ label: 'Back to photo', onClick: () => navigate(`/photo/${photoId}`) });
        } else {
            items.push({ label: 'Events', onClick: () => navigate('/') });
        }

        items.push({ label: activeHorse.name, active: true });
        return items;
    }, [navigate, activeHorse, from, photoId]);

    // Filter states - Order: Events, Discipline, Class, Riders, Photographer
    const [selectedEventId, setSelectedEventId] = useState<string>('all');
    const [discipline, setDiscipline] = useState('All');
    const [eventClass, setEventClass] = useState('All');
    const [rider, setRider] = useState('All');
    const [photographer, setPhotographer] = useState('All');

    useEffect(() => {
        const timer = setTimeout(() => {
            // Filter global mock photos by this horse name
            const horsePhotos = mockPhotos.filter(p => p.horse === activeHorse.name);
            setPhotos(horsePhotos);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [activeHorse]);

    const isResetDisabled = selectedEventId === 'all' && discipline === 'All' && eventClass === 'All' && rider === 'All' && photographer === 'All';

    // Filters Inter-dependency
    const filteredPhotos = useMemo(() => {
        return photos.filter(photo => {
            const matchEvent = selectedEventId === 'all' || photo.eventId === selectedEventId;
            const matchDiscipline = discipline === 'All' || photo.discipline === discipline;
            const matchRider = rider === 'All' || photo.rider === rider;
            const matchClass = eventClass === 'All' || ((photo as any).class || '1.30m') === eventClass;
            const matchPhotographer = photographer === 'All' || ((photo as any).photographer || 'Unknown') === photographer;

            return matchEvent && matchDiscipline && matchRider && matchClass && matchPhotographer;
        });
    }, [photos, selectedEventId, discipline, rider, eventClass, photographer]);

    // Helpers for dynamic options
    const getAvailable = (scopingFilter: (p: Photo) => boolean) => photos.filter(scopingFilter);

    // 1. Events
    const eventOptions = useMemo(() => {
        const available = getAvailable(p =>
            (discipline === 'All' || p.discipline === discipline) &&
            (rider === 'All' || p.rider === rider) &&
            (eventClass === 'All' || ((p as any).class || '1.30m') === eventClass) &&
            (photographer === 'All' || ((p as any).photographer || 'Unknown') === photographer)
        );
        const uniqueIds = Array.from(new Set(available.map(p => p.eventId)));
        const relevantEvents = COMPETITIONS.filter(c => uniqueIds.includes(c.id));
        return [{ label: 'All Events', value: 'all' }, ...relevantEvents.map(e => ({ label: e.name, value: e.id }))];
    }, [photos, discipline, rider, eventClass, photographer]);

    // 2. Discipline
    const disciplineOptions = useMemo(() => {
        const available = getAvailable(p =>
            (selectedEventId === 'all' || p.eventId === selectedEventId) &&
            (rider === 'All' || p.rider === rider)
        );
        const unique = Array.from(new Set(available.map(p => p.discipline).filter(Boolean))).sort();
        return [{ label: 'All Disciplines', value: 'All' }, ...unique.map(d => ({ label: d as string, value: d as string }))];
    }, [photos, selectedEventId, rider]);

    // 3. Class
    const classOptions = [
        { label: 'All Classes', value: 'All' },
        { label: '1.20m', value: '1.20m' },
        { label: '1.30m', value: '1.30m' }
    ];

    // 4. Riders
    const riderOptions = useMemo(() => {
        const available = getAvailable(p =>
            (selectedEventId === 'all' || p.eventId === selectedEventId) &&
            (discipline === 'All' || p.discipline === discipline)
        );
        const unique = Array.from(new Set(available.map(p => p.rider))).sort();
        return [{ label: 'All Riders', value: 'All' }, ...unique.map(r => ({ label: r, value: r }))];
    }, [photos, selectedEventId, discipline]);

    // 5. Photographer
    const photographerOptions = useMemo(() => {
        const available = getAvailable(p =>
            (selectedEventId === 'all' || p.eventId === selectedEventId)
        );
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
                title={activeHorse.name}
                avatar={horseAvatar}
                subtitle="Horse"
                stats={
                    <div className="event-stats-row">
                        <span>{totalEvents} events</span>
                        <span className="meta-bullet">•</span>
                        <span>{totalPhotosCount} photos</span>
                    </div>
                }
                rightContent={
                    (() => {
                        // Find primary rider
                        if (photos.length === 0) return null;
                        const riderCounts: { [key: string]: number } = {};
                        photos.forEach(p => {
                            riderCounts[p.rider] = (riderCounts[p.rider] || 0) + 1;
                        });
                        const topRiderName = Object.keys(riderCounts).reduce((a, b) => riderCounts[a] > riderCounts[b] ? a : b);
                        const topRider = RIDERS.find(r => `${r.firstName} ${r.lastName}` === topRiderName);

                        if (!topRider) return null;

                        return (
                            <InfoChip
                                label="Primary Rider"
                                name={`${topRider.firstName} ${topRider.lastName}`}
                                avatarUrl={`/images/${topRider.firstName} ${topRider.lastName}.jpg`}
                                fallbackIcon="user"
                                onClick={() => navigate(`/rider/${topRider.id}?from=horse&horseId=${horseId}`)}
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
                                    value={rider}
                                    options={riderOptions}
                                    onChange={setRider}
                                    label="Riders"
                                    placeholder="Riders"
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
                                        setRider('All');
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
                                onClick={(p) => navigate(`/photo/${p.id}?from=horse&horseId=${activeHorse.id}`)}
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

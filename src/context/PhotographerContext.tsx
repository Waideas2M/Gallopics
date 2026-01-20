import React, { createContext, useContext, useState, type ReactNode } from 'react';

// --- Types ---

export type EventStatus = 'upcoming' | 'open' | 'archived';

export interface PgEvent {
    id: string;
    title: string;
    date: string; // Start date for sorting/simple display
    dateRange: string; // Full range "26 Nov – 30 Nov 2026"
    location: string;
    coverImage: string;
    status: EventStatus;

    // Stats for "My events"
    photosCount?: number;
    publishedCount?: number;
    soldCount?: number;

    // For "Upcoming" logic
    isRegistered?: boolean;
    logo: string;
    venueName: string;
    disciplines: string[];
    city: string;
}

export interface Photo {
    id: string;
    url: string;
    eventId: string;
    status: 'uploading' | 'processing' | 'needsReview' | 'uploadedUnpublished' | 'published';
    soldCount: number;
    /* Metadata */
    rider?: string;
    horse?: string;
    timestamp?: string;
    width: number;
    height: number;
    title?: string;
}

export interface UploadFile {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    error?: string;
}

export interface UploadSession {
    eventId: string;
    status: 'uploading' | 'completed';
    files: UploadFile[];
    startTime: number;
}

interface PhotographerContextType {
    photographerId: string;
    events: PgEvent[];
    allPhotos: Photo[];
    getEvent: (id: string) => PgEvent | undefined;

    // Actions
    registerForEvent: (eventId: string) => void;

    // Photos
    getPhotosByEvent: (eventId: string) => Photo[];
    updatePhotoStatus: (photoIds: string[], status: Photo['status']) => void;
    deletePhotos: (photoIds: string[]) => void;
    setPhotoPrice: (photoIds: string[], price: number) => void;
    updatePhotoMetadata: (photoIds: string[], metadata: Partial<Photo>) => void;

    // Upload System
    isUploadOverlayOpen: boolean;
    currentUploadEventId: string | null;
    uploadSessions: Record<string, UploadSession>; // Keyed by eventId
    openUploadOverlay: (eventId: string) => void;
    closeUploadOverlay: () => void;
    startUpload: (files: File[]) => void;
    clearUploadSession: (eventId: string) => void;

    // Highlights
    highlights: string[];
    updateHighlights: (ids: string[]) => void;
    availableToHire: boolean;
    toggleAvailableToHire: (val: boolean) => void;
}

import { mockEvents, type EventData } from '../data/mockEvents';
import { photos as basePhotos, RIDERS, HORSES, RIDER_PRIMARY_HORSE, PHOTOGRAPHERS } from '../data/mockData';

// Mapped Data based on shared mockEvents
// Filter/Assign events to our mock photographer "Klara Fors"
// For the purpose of this workspace demo, we'll treat the first few events as "My Events" (registered)
// and others as "Upcoming".

const mapToPgEvent = (e: EventData, isMyEvent: boolean): PgEvent => {
    return {
        id: e.id,
        title: e.name,
        date: e.period.split(' – ')[0] || e.period,
        dateRange: e.period,
        location: `${e.city}, Sweden`, // Based on mockEvents hardcoded '🇸🇪'
        coverImage: e.coverImage,
        status: isMyEvent ? 'open' : 'upcoming',
        isRegistered: isMyEvent,
        photosCount: e.photoCount || 0,
        publishedCount: isMyEvent ? Math.floor((e.photoCount || 0) * 0.8) : 0,
        soldCount: isMyEvent ? Math.floor((e.photoCount || 0) * 0.1) : 0,
        logo: e.logo,
        venueName: e.name.includes('Gothenburg') ? 'Scandinavium' : e.name.includes('Falsterbo') ? 'Falsterbo Arena' : 'Main Arena', // Simple mock mapping or use actual data if available
        disciplines: [e.discipline],
        city: e.city,
    };
};

const MY_EVENT_IDS = ['c1', 'c2', 'c3'];

const MOCK_EVENTS: PgEvent[] = mockEvents.map(e => {
    const isMine = MY_EVENT_IDS.includes(e.id);
    return mapToPgEvent(e, isMine);
});

// Helpers for randomization (Copied/Adapted from EventProfile.tsx)
function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

const generateMockPhotos = (eventId: string, count: number): Photo[] => {
    const srcPool = Array.from(new Set(basePhotos.map(p => p.src)));

    return Array.from({ length: count }).map((_, i) => {
        const src = pick(srcPool);
        const rider = pick(RIDERS);
        const horseMapping = RIDER_PRIMARY_HORSE.find(m => m.riderId === rider.id);
        const horse = HORSES.find(h => h.id === horseMapping?.primaryHorseId) || HORSES[0];

        const ratioType = Math.random();
        let width = 600;
        let height = 800;
        if (ratioType > 0.66) { width = 800; height = 600; }
        else if (ratioType > 0.33) { width = 800; height = 800; }

        if (ratioType < 0.33) height += randomInt(-50, 50);

        // Determine mock status
        // Randomly assign some statuses for variety
        const rand = Math.random();
        let status: Photo['status'] = 'published';
        let soldCount = 0;

        if (rand > 0.95) {
            status = 'published';
            soldCount = randomInt(1, 5);
        } else if (rand > 0.85) {
            status = 'needsReview'; // 15% needs review
        } else if (rand > 0.75) {
            status = 'uploadedUnpublished';
        }

        return {
            id: `${eventId}-p-mock-${i}`,
            url: src,
            eventId: eventId,
            status: status,
            soldCount: soldCount,
            rider: `${rider.firstName} ${rider.lastName}`,
            horse: horse.name,
            timestamp: '12:00',
            width,
            height,
            title: `Photo ${i}`
        };
    });
};

const MOCK_PHOTOS: Photo[] = [
    ...generateMockPhotos('c1', 24),
    ...generateMockPhotos('c2', 32),
    ...generateMockPhotos('c3', 12),
];

// --- Context & Provider ---

const PhotographerContext = createContext<PhotographerContextType | undefined>(undefined);

export const PhotographerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [photographerId] = useState('klara-fors'); // Klara Fors (Logged in User)
    const [events, setEvents] = useState<PgEvent[]>(MOCK_EVENTS);
    const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);

    // Upload State
    const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);
    const [currentUploadEventId, setCurrentUploadEventId] = useState<string | null>(null);
    // Keyed by eventId
    const [uploadSessions, setUploadSessions] = useState<Record<string, UploadSession>>({});

    // Highlights
    const [highlights, setHighlights] = useState<string[]>([]);
    const [availableToHire, setAvailableToHire] = useState(true);

    // Initialize from mock data on mount
    React.useEffect(() => {
        const p = PHOTOGRAPHERS.find(p => p.id === photographerId);
        if (p) {
            if (p.highlights) setHighlights(p.highlights);
            if (typeof p.isAvailableToHire !== 'undefined') setAvailableToHire(p.isAvailableToHire);
        }
    }, [photographerId]);

    const updateHighlights = (ids: string[]) => {
        setHighlights(ids);
        // Sync to mock data for public visibility
        const p = PHOTOGRAPHERS.find(p => p.id === photographerId);
        if (p) {
            p.highlights = ids;
        }
    };

    const toggleAvailableToHire = (val: boolean) => {
        setAvailableToHire(val);
        const p = PHOTOGRAPHERS.find(p => p.id === photographerId);
        if (p) {
            p.isAvailableToHire = val;
        }
    };

    const getEvent = (id: string) => events.find(e => e.id === id);

    const registerForEvent = (eventId: string) => {
        setEvents(prev => prev.map(e =>
            e.id === eventId ? { ...e, isRegistered: true, status: 'open' } : e
        ));
    };

    const getPhotosByEvent = (eventId: string) => photos.filter(p => p.eventId === eventId);

    const updatePhotoStatus = (photoIds: string[], status: Photo['status']) => {
        setPhotos(prev => prev.map(p =>
            photoIds.includes(p.id) ? { ...p, status } : p
        ));
    };

    const deletePhotos = (photoIds: string[]) => {
        setPhotos(prev => prev.filter(p => !photoIds.includes(p.id)));
    };

    const setPhotoPrice = (photoIds: string[], price: number) => {
        // Mock impl
        console.log(`Set price to ${price} for`, photoIds);
    };

    const updatePhotoMetadata = (photoIds: string[], metadata: Partial<Photo>) => {
        setPhotos(prev => prev.map(p =>
            photoIds.includes(p.id) ? { ...p, ...metadata } : p
        ));
    };

    // --- Upload Logic ---

    const openUploadOverlay = (eventId: string) => {
        setCurrentUploadEventId(eventId);
        setIsUploadOverlayOpen(true);
    };

    const closeUploadOverlay = () => {
        setIsUploadOverlayOpen(false);
        // Do NOT clear session or currentUploadEventId immediately if we want persistence across toggles
        // But if user clicks X, usually they want to hide it.
        // Persistence requirement: "Upload overlay must be controlled by local UI state... and must not navigate away."
        // "Persist upload session state... if modal unmounts/remounts".
        // So we just toggle visibility. We keep currentUploadEventId? 
        // If user navigates to another event, openUploadOverlay(newEvent) is called.
        // So keeping currentUploadEventId here is fine.
    };

    const clearUploadSession = (eventId: string) => {
        setUploadSessions(prev => {
            const next = { ...prev };
            delete next[eventId];
            return next;
        });
    };

    const startUpload = (files: File[]) => {
        if (!currentUploadEventId) return;
        const eventId = currentUploadEventId;

        const newFiles: UploadFile[] = files.map(f => ({
            id: Math.random().toString(36).substr(2, 9),
            file: f,
            progress: 0,
            status: 'pending'
        }));

        setUploadSessions(prev => {
            const existing = prev[eventId];
            return {
                ...prev,
                [eventId]: {
                    eventId,
                    startTime: existing ? existing.startTime : Date.now(),
                    status: 'uploading',
                    files: existing ? [...existing.files, ...newFiles] : newFiles
                }
            };
        });

        // Simulate upload process for each file
        newFiles.forEach(item => {
            simulateFileUpload(item.id, eventId);
        });
    };

    const simulateFileUpload = (fileId: string, eventId: string) => {
        let progress = 0;
        const interval = setInterval(() => {
            if (Math.random() > 0.95) {
                // Simulate occasional random failure?
                // For now keep stable.
            }
            progress += Math.floor(Math.random() * 20) + 10;

            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                handleFileComplete(fileId, eventId);
            } else {
                updateFileProgress(fileId, eventId, progress);
            }
        }, 800);
    };

    const updateFileProgress = (fileId: string, eventId: string, progress: number) => {
        setUploadSessions(prev => {
            const session = prev[eventId];
            if (!session) return prev; // Safety

            const updatedFiles = session.files.map(f =>
                f.id === fileId ? { ...f, progress, status: 'uploading' as const } : f
            );

            return {
                ...prev,
                [eventId]: { ...session, files: updatedFiles }
            };
        });
    };

    const handleFileComplete = (fileId: string, eventId: string) => {
        setUploadSessions(prev => {
            const session = prev[eventId];
            if (!session) return prev;

            const updatedFiles = session.files.map(f =>
                f.id === fileId ? { ...f, progress: 100, status: 'completed' as const } : f
            );

            // Check if batch complete
            const allComplete = updatedFiles.every(f => f.status === 'completed' || f.status === 'failed');

            return {
                ...prev,
                [eventId]: { ...session, files: updatedFiles, status: allComplete ? 'completed' : 'uploading' }
            };
        });

        // Add to Mock Photos
        const newPhoto: Photo = {
            id: `new-${fileId}`,
            url: 'https://images.unsplash.com/photo-1599056377758-4808a7e70337?auto=format&fit=crop&q=80&w=600',
            eventId: eventId,
            status: 'uploadedUnpublished',
            soldCount: 0,
            rider: 'Processing...',
            horse: '',
            timestamp: new Date().toLocaleTimeString().slice(0, 5),
            width: 400 + Math.floor(Math.random() * 200),
            height: 300 + Math.floor(Math.random() * 200)
        };
        setPhotos(prev => [newPhoto, ...prev]);
    };

    return (
        <PhotographerContext.Provider value={{
            photographerId,
            events,
            allPhotos: photos,
            getEvent,
            registerForEvent,
            getPhotosByEvent,
            updatePhotoStatus,
            deletePhotos,
            setPhotoPrice,
            updatePhotoMetadata,
            // Upload controls
            isUploadOverlayOpen,
            currentUploadEventId,
            uploadSessions,
            openUploadOverlay,
            closeUploadOverlay,
            startUpload,
            clearUploadSession,
            // Highlights
            highlights,
            updateHighlights,
            availableToHire,
            toggleAvailableToHire
        }}>
            {children}
        </PhotographerContext.Provider>
    );
};

export const usePhotographer = () => {
    const context = useContext(PhotographerContext);
    if (!context) {
        throw new Error('usePhotographer must be used within a PhotographerProvider');
    }
    return context;
};

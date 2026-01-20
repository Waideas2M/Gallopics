import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePhotographer, type Photo } from '../../context/PhotographerContext';
import { MasonryGrid } from '../../components/MasonryGrid';
import { PgPhotoCard } from './PgPhotoCard';
import { PhotoInspector } from './PhotoInspector';
import './EventDetail.css';

export const EventDetail: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const { getEvent, getPhotosByEvent, openUploadOverlay } = usePhotographer();

    const event = eventId ? getEvent(eventId) : undefined;
    const allPhotos = eventId ? getPhotosByEvent(eventId) : [];

    // Local State
    const [filter, setFilter] = useState<'all' | 'uploads' | 'published' | 'sold'>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    // Filter Logic
    const displayedPhotos = useMemo(() => {
        return allPhotos.filter(p => {
            if (filter === 'all') return true;
            if (filter === 'published') return p.status === 'published';
            if (filter === 'sold') return p.soldCount > 0;
            if (filter === 'uploads') {
                return ['uploading', 'processing', 'needsReview', 'uploadedUnpublished'].includes(p.status);
            }
            return true;
        });
    }, [allPhotos, filter]);

    // Needs Review Count
    const needsReviewCount = allPhotos.filter(p => p.status === 'needsReview').length;

    // Handlers
    const handleToggleSelect = (photo: Photo, multiSelect: boolean) => {
        const newSelected = new Set(multiSelect ? selectedIds : []);

        if (multiSelect && lastSelectedId && displayedPhotos.some(p => p.id === lastSelectedId)) {
            // Range select logic (simplified)
            if (newSelected.has(photo.id)) {
                newSelected.delete(photo.id);
            } else {
                newSelected.add(photo.id);
            }
        } else {
            if (multiSelect) {
                if (newSelected.has(photo.id)) newSelected.delete(photo.id);
                else newSelected.add(photo.id);
            } else {
                if (newSelected.has(photo.id) && newSelected.size === 1) {
                    newSelected.clear();
                } else {
                    newSelected.clear();
                    newSelected.add(photo.id);
                }
            }
        }

        setSelectedIds(newSelected);
        setLastSelectedId(photo.id);
    };

    const handleClearSelection = () => {
        setSelectedIds(new Set());
    };

    if (!event) return <div>Event not found</div>;

    return (
        <div className="pg-event-detail">
            {/* Header */}
            <div className="pg-detail-header-v2">
                <div className="pg-breadcrumbs-v2">
                    <Link to="/pg/events">Events</Link>
                    <span className="separator">/</span>
                    <span className="active">{event.title}</span>
                </div>

                <div className="pg-header-content">
                    <div className="pg-header-left">
                        <div className="pg-header-logo">
                            <img src={event.logo} alt="" />
                        </div>
                        <div className="pg-header-text">
                            <div className="pg-header-top-meta">{event.dateRange}</div>
                            <h1 className="pg-header-title">{event.title}</h1>
                            <div className="pg-header-bottom-meta">
                                <span>{event.city}</span>
                                <span className="meta-bullet">•</span>
                                <span>{event.venueName}</span>
                                <span className="meta-bullet">•</span>
                                <span>{(event.disciplines || []).join(', ')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pg-header-actions">
                        <button className="pg-btn pg-btn-secondary" onClick={() => {/* Mock handle unregister */ }}>
                            Cancel registration
                        </button>
                        <button className="pg-btn pg-btn-primary" onClick={() => openUploadOverlay(event.id)}>
                            Upload photos
                        </button>
                    </div>
                </div>
            </div>

            {/* Core UI (Tabs removed) */}
            <div className="pg-detail-content">
                {/* Tools - Now directly under header */}
                <div className="pg-photos-tools">
                    <div className="pg-chips-row">
                        <button className={`pg-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                            All
                        </button>
                        <button className={`pg-chip ${filter === 'uploads' ? 'active' : ''}`} onClick={() => setFilter('uploads')}>
                            Uploads
                            {needsReviewCount > 0 && <span className="pg-chip-badge">{needsReviewCount}</span>}
                        </button>
                        <button className={`pg-chip ${filter === 'published' ? 'active' : ''}`} onClick={() => setFilter('published')}>
                            Published
                        </button>
                        <button className={`pg-chip ${filter === 'sold' ? 'active' : ''}`} onClick={() => setFilter('sold')}>
                            Sold
                        </button>
                    </div>

                    {filter === 'uploads' && (
                        <div className="pg-upload-progress" onClick={() => setFilter('uploads')}>
                            <div className="pg-upload-progress-fill" style={{ width: '62%' }} />
                            <span className="pg-upload-text">Uploading 38 photos... 62%</span>
                        </div>
                    )}
                </div>

                {/* Content Split: Grid + Inspector */}
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>

                    <div className="pg-photos-grid" style={{ flex: 1 }}>
                        <MasonryGrid isLoading={false}>
                            {displayedPhotos.map(photo => (
                                <PgPhotoCard
                                    key={photo.id}
                                    photo={photo}
                                    isSelected={selectedIds.has(photo.id)}
                                    onToggleSelect={handleToggleSelect}
                                />
                            ))}
                        </MasonryGrid>

                        {displayedPhotos.length === 0 && (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                                No photos found in this view.
                            </div>
                        )}
                    </div>

                    {/* Inspector Sidebar */}
                    {selectedIds.size > 0 && (
                        <PhotoInspector
                            selectedPhotos={allPhotos.filter(p => selectedIds.has(p.id))}
                            onClose={handleClearSelection}
                        />
                    )}
                </div>

                {/* Note: Sticky actions removed in favor of Inspector actions for cleaner UI */}
            </div>
        </div>
    );
};

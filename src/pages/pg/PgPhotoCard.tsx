import React from 'react';
import type { Photo as PgPhoto } from '../../context/PhotographerContext';
import { PhotoCard } from '../../components/PhotoCard';
import { Check } from 'lucide-react';
import type { Photo as UiPhoto } from '../../types';
import './PgPhotoCard.css';

interface PgPhotoCardProps {
    photo: PgPhoto;
    isSelected: boolean;
    onToggleSelect: (photo: PgPhoto, multiSelect: boolean) => void;
}

export const PgPhotoCard: React.FC<PgPhotoCardProps> = ({
    photo,
    isSelected,
    onToggleSelect
}) => {

    // Map Context Photo to UI Photo (for shared component)
    const uiPhoto: UiPhoto = {
        id: photo.id,
        src: photo.url,
        rider: photo.rider || 'Unknown',
        horse: photo.horse || 'Unknown',
        event: 'Event', // Placeholder or fetch if needed
        eventId: photo.eventId,
        date: new Date().toISOString(), // Mock
        time: photo.timestamp || '12:00',
        city: 'Location',
        countryCode: 'SE',
        width: photo.width,
        height: photo.height,
        className: 'pg-item',
        arena: 'Arena 1'
    };

    const handleWrapperClick = (e: React.MouseEvent) => {
        // Intercept click for selection logic
        // We use the wrapper to handle the click so we can access the event (Shift/Meta keys)
        // which PhotoCard's onClick prop might not expose fully if strictly reused.
        onToggleSelect(photo, e.shiftKey || e.metaKey || e.ctrlKey);
    };

    const StatusBadge = () => {
        if (photo.soldCount > 0) {
            return <div className="pg-card-status-badge sold">Sold {photo.soldCount > 1 ? `×${photo.soldCount}` : ''}</div>;
        }
        if (photo.status === 'processing') return <div className="pg-card-status-badge processing">Processing</div>;
        if (photo.status === 'needsReview') return <div className="pg-card-status-badge needsReview">Review</div>;
        return null; // Published is default
    };

    return (
        <div
            className={`pg-photo-card-wrapper ${isSelected ? 'selected' : ''}`}
            onClick={handleWrapperClick}
        >
            <PhotoCard
                photo={uiPhoto}
                onClick={() => { }} /* No-op, wrapper handles click */
            // onAddToCart is undefined, so button might show but we hide via CSS
            />

            {/* Selection Overlay (Top Left) */}
            <div className={`pg-selection-overlay ${isSelected ? 'visible' : ''}`}>
                <div className={`pg-check-circle ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <Check size={14} color="white" strokeWidth={3} />}
                </div>
            </div>

            {/* Status Badge (Top Right) */}
            <StatusBadge />

            {/* Selection Border (if needed, usually handled by wrapper style) */}
        </div>
    );
};

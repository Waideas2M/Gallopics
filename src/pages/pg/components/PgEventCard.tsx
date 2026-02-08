import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PgEvent } from '../../../context/PhotographerContext';
import './PgEventCard.css';

interface PgEventCardProps {
    event: PgEvent;
    onCoverChange: (eventId: string) => void;
}

export const PgEventCard: React.FC<PgEventCardProps> = ({ event, onCoverChange }) => {
    const navigate = useNavigate();
    const hasCover = !!event.coverImage;

    return (
        <div
            className="pg-folder-card"
            onClick={() => navigate(`/pg/events/${event.id}`)}
        >
            <div className="pg-folder-inner">
                {/* 1. Cover Area */}
                <div className="pg-folder-cover">
                    <img
                        src={event.coverImage || 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&q=80&w=800'}
                        alt={event.title}
                        className={`pg-folder-img ${!hasCover ? 'no-cover' : ''}`}
                    />

                    {!hasCover && (
                        <div className="pg-no-cover-placeholder">
                            <span className="pg-no-cover-text">Add cover photo</span>
                        </div>
                    )}

                    {/* Edit Overlay (Top-Right Circle) */}
                    <div className="pg-cover-overlay">
                        <button
                            className={`pg-cover-edit-btn ${!hasCover ? 'disabled' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (hasCover) onCoverChange(event.id);
                            }}
                            title={hasCover ? "Change cover image" : "No cover to edit"}
                            disabled={!hasCover}
                        >
                            <ImageIcon size={16} />
                        </button>
                    </div>
                </div>

                {/* 2. Info Area (Avatar + Title/Date) */}
                <div className="pg-folder-info">
                    <div className="pg-event-header">
                        <div className="pg-event-logo-wrap">
                            <img src={event.logo} alt="" className="pg-event-avatar" />
                        </div>
                        <div className="pg-event-title-stack">
                            <div className="pg-event-location-top">
                                <span className="pg-flag">🇸🇪</span>
                                <span className="pg-city-top">{event.city}</span>
                            </div>
                            <h3 className="pg-event-name">{event.title}</h3>
                            <span className="pg-event-date-text">{event.dateRange}</span>
                        </div>
                    </div>

                    <div className="pg-folder-divider" />

                    {/* 3. Footer row (Stats only) */}
                    <div className="pg-folder-footer">
                        <div className="pg-stats-badges">
                            <span className="pg-badge-item published">
                                Published {event.publishedCount ?? 0}
                            </span>
                            <div className="pg-badge-item sales">
                                <span className="label">Sales</span>
                                <span className="count">{event.soldCount ?? 0}/{(event.photosCount ?? 40)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

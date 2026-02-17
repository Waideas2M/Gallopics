import React from 'react';
import { Image as ImageIcon, MoreHorizontal, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PgEvent } from '../../../context/PhotographerContext';
import { useWorkspace } from '../../../context/WorkspaceContext';
import './PgEventCard.css';

interface PgEventCardProps {
    event: PgEvent;
    onCoverChange: (eventId: string) => void;
    onEdit?: (event: PgEvent) => void;
}

export const PgEventCard: React.FC<PgEventCardProps> = ({ event, onCoverChange, onEdit }) => {
    const { basePath } = useWorkspace();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const hasCover = !!event.coverImage;

    return (
        <div
            className="pg-folder-card"
            onClick={() => navigate(`${basePath}/events/${event.id}`)}
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

                        {/* More Action with Separator */}
                        <div className="pg-card-more-wrap">
                            <div className="pg-action-separator" />
                            <button
                                className={`pg-action-round-btn ${isMenuOpen ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                            >
                                <MoreHorizontal size={16} />
                            </button>

                            {isMenuOpen && (
                                <div className="pg-more-dropdown" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => { setIsMenuOpen(false); navigate(`${basePath}/events/${event.id}`); }}>
                                        <ImageIcon size={14} />
                                        Manage photos
                                    </button>
                                    <button onClick={() => { setIsMenuOpen(false); onEdit?.(event); }}>
                                        <Edit2 size={14} />
                                        Edit Event
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pg-folder-divider" />

                    {/* 3. Footer row (Stats only) */}
                    <div className="pg-folder-footer">
                        <div className="pg-stats-badges">
                            <div className="pg-badge-item published stacked">
                                <span className="label">Published</span>
                                <span className="count">{event.publishedCount ?? 0}</span>
                            </div>
                            <div className="pg-badge-item sales stacked">
                                <span className="label">Sales</span>
                                <span className="count">{event.soldCount ?? 0}/{(event.photosCount ?? 40)}</span>
                            </div>
                            <div className="pg-badge-item earnings stacked">
                                <span className="label">Earnings</span>
                                <span className="value">SEK {((event.soldCount ?? 0) * 450).toLocaleString().replace(/,/g, ' ')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

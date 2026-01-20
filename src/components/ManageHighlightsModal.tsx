import React, { useState, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { usePhotographer } from '../context/PhotographerContext';
import './ManageHighlightsModal.css';

interface ManageHighlightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialIds: string[];
    onSave: (ids: string[]) => void;
}

export const ManageHighlightsModal: React.FC<ManageHighlightsModalProps> = ({
    isOpen,
    onClose,
    initialIds,
    onSave
}) => {
    const { events, getPhotosByEvent } = usePhotographer();

    // Local state for the draft selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialIds));
    const [activeEventId, setActiveEventId] = useState<string>(events.filter(e => e.isRegistered)[0]?.id || '');

    // Reset state when opening
    React.useEffect(() => {
        if (isOpen) {
            setSelectedIds(new Set(initialIds));
            // Default to first 'my event'
            const firstMyEvent = events.find(e => e.isRegistered);
            if (firstMyEvent) setActiveEventId(firstMyEvent.id);
        }
    }, [isOpen, initialIds, events]);

    // Data derivation
    const myEvents = useMemo(() => events.filter(e => e.isRegistered), [events]);
    const currentPhotos = useMemo(() => activeEventId ? getPhotosByEvent(activeEventId) : [], [activeEventId, getPhotosByEvent]);

    const handleToggle = (photoId: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(photoId)) {
            newSet.delete(photoId);
        } else {
            if (newSet.size >= 10) {
                // Shake or show toast? For now just return early as requested "Block selecting >10"
                // Ideally show a message.
                alert("Maximum 10 highlights allowed.");
                return;
            }
            newSet.add(photoId);
        }
        setSelectedIds(newSet);
    };

    const handleSave = () => {
        onSave(Array.from(selectedIds));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="highlights-modal-overlay">
            <div className="highlights-modal">
                <div className="highlights-modal-header">
                    <h3>Manage highlights</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="highlights-modal-body">
                    {/* Event Selector */}
                    <div className="event-selector-row">
                        <label>Select from event:</label>
                        <select
                            value={activeEventId}
                            onChange={(e) => setActiveEventId(e.target.value)}
                            className="event-select"
                        >
                            {myEvents.map(e => (
                                <option key={e.id} value={e.id}>
                                    {e.title} ({e.date})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stats */}
                    <div className="selection-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            Selected: <span className={selectedIds.size === 10 ? 'max-reached' : ''}>{selectedIds.size} / 10</span>
                        </div>
                        {selectedIds.size > 0 && (
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#EF4444',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Grid */}
                    <div className="modal-photo-grid">
                        {currentPhotos.length === 0 ? (
                            <div className="no-photos-msg">No photos found in this event.</div>
                        ) : (
                            currentPhotos.map(photo => {
                                const isSelected = selectedIds.has(photo.id);
                                return (
                                    <div
                                        key={photo.id}
                                        className={`modal-photo-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleToggle(photo.id)}
                                    >
                                        <div className="img-wrapper">
                                            <img src={photo.url} alt="" loading="lazy" />
                                        </div>
                                        {isSelected && (
                                            <div className="selection-overlay">
                                                <div className="check-circle">
                                                    <Check size={14} color="#fff" strokeWidth={3} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="highlights-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={handleSave}>Save changes</button>
                </div>
            </div>
        </div>
    );
};

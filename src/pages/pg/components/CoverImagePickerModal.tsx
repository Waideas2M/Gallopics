import React, { useState, useMemo } from 'react';
import { X, Check, Upload } from 'lucide-react';
import { usePhotographer } from '../../../context/PhotographerContext';
import { Button } from '../../../components/Button';
import '../../../components/ManageHighlightsModal.css';

interface CoverImagePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    onSelect: (photoUrl: string) => void;
}

export const CoverImagePickerModal: React.FC<CoverImagePickerModalProps> = ({
    isOpen,
    onClose,
    eventId,
    onSelect
}) => {
    const { getPhotosByEvent } = usePhotographer();
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

    const photos = useMemo(() => eventId ? getPhotosByEvent(eventId).filter(p => p.status === 'published') : [], [eventId, getPhotosByEvent]);

    const handleSave = () => {
        if (selectedUrl) {
            onSelect(selectedUrl);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="highlights-modal-overlay">
            <div className="highlights-modal">
                <div className="highlights-modal-header">
                    <h3>Select event cover</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="highlights-modal-body">
                    <div className="picker-upload-section" style={{ marginBottom: '24px' }}>
                        <Button
                            variant="secondary"
                            style={{ width: '100%', height: '80px', borderStyle: 'dashed', flexDirection: 'column', gap: '8px' }}
                            onClick={() => {
                                // Mock file picker
                                alert('Browsing computer for image...');
                            }}
                        >
                            <Upload size={20} />
                            <span>Upload from computer</span>
                        </Button>
                    </div>

                    <div className="selection-stats" style={{ marginBottom: '12px' }}>
                        <span>Choose from published photos</span>
                    </div>

                    <div className="modal-photo-grid">
                        {photos.length === 0 ? (
                            <div className="no-photos-msg">No published photos found for this event.</div>
                        ) : (
                            photos.map(photo => {
                                const isSelected = selectedUrl === photo.url;
                                return (
                                    <div
                                        key={photo.id}
                                        className={`modal-photo-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setSelectedUrl(photo.url)}
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
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} disabled={!selectedUrl}>Set as cover</Button>
                </div>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import type { Photo } from '../../context/PhotographerContext';
import { usePhotographer } from '../../context/PhotographerContext';
import { X, Tag, Trash2, Clock } from 'lucide-react';
import './PhotoInspector.css';

interface PhotoInspectorProps {
    selectedPhotos: Photo[];
    onClose: () => void;
}

export const PhotoInspector: React.FC<PhotoInspectorProps> = ({ selectedPhotos, onClose }) => {
    const { updatePhotoMetadata, deletePhotos } = usePhotographer();

    const [rider, setRider] = useState('');
    const [horse, setHorse] = useState('');

    // Update local state when selection changes
    useEffect(() => {
        if (selectedPhotos.length === 1) {
            setRider(selectedPhotos[0].rider || '');
            setHorse(selectedPhotos[0].horse || '');
        } else {
            // Bulk edit: leave empty or show 'Mixed' placeholder logic? 
            // For MVP, leave empty to mean "enter new value to overwrite all", 
            // or if we want to preserve, we might need a placeholder.
            // Let's use empty string as "no change yet".
            setRider('');
            setHorse('');
        }
    }, [selectedPhotos]);

    // Removed unused handleSave function

    const handleBlur = (field: 'rider' | 'horse', value: string) => {
        if (!value.trim()) return; // Don't clear if just focusing out empty? 
        // Actually, clearing might be intended. 
        // For MVP bulk edit: Only update if value is not empty? 
        // Or if user explicitly cleared it? 
        // Let's say: if value is non-empty, apply it to all.

        if (value.trim()) {
            const ids = selectedPhotos.map(p => p.id);
            updatePhotoMetadata(ids, { [field]: value });
        }
    };

    if (selectedPhotos.length === 0) return null;

    const count = selectedPhotos.length;
    const isSingle = count === 1;
    const firstPhoto = selectedPhotos[0];

    return (
        <div className="pg-inspector">
            <div className="pg-inspector-header">
                <span className="pg-inspector-title">
                    {isSingle ? 'Photo Details' : `${count} photos selected`}
                </span>
                <button className="pg-inspector-close" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            {/* Thumbs Preview */}
            <div className="pg-inspector-section">
                <div className="pg-inspector-thumbs">
                    {selectedPhotos.slice(0, 4).map(p => (
                        <img key={p.id} src={p.url} className="pg-inspector-thumb" alt="" />
                    ))}
                    {count > 4 && (
                        <div className="pg-inspector-thumb more">+{count - 4}</div>
                    )}
                </div>

                {isSingle && (
                    <div className="pg-inspector-readonly" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666', fontSize: '0.8rem' }}>
                        <Clock size={14} /> {firstPhoto.timestamp || 'Unknown time'}
                        <span style={{ margin: '0 4px' }}>•</span>
                        {firstPhoto.width} x {firstPhoto.height}px
                    </div>
                )}
            </div>

            {/* Metadata Fields */}
            <div className="pg-inspector-section">
                <label className="pg-inspector-label">Rider</label>
                <input
                    className="pg-inspector-input"
                    placeholder={isSingle ? "Enter rider name" : "Edit rider for all..."}
                    value={rider}
                    onChange={(e) => setRider(e.target.value)}
                    onBlur={(e) => handleBlur('rider', e.target.value)}
                />
            </div>

            <div className="pg-inspector-section">
                <label className="pg-inspector-label">Horse</label>
                <input
                    className="pg-inspector-input"
                    placeholder={isSingle ? "Enter horse name" : "Edit horse for all..."}
                    value={horse}
                    onChange={(e) => setHorse(e.target.value)}
                    onBlur={(e) => handleBlur('horse', e.target.value)}
                />
            </div>

            {/* Actions */}
            <div className="pg-inspector-section">
                <label className="pg-inspector-label">Actions</label>
                <div className="pg-inspector-actions">
                    <button className="pg-inspector-btn">
                        <Tag size={16} />
                        Manage Tags
                    </button>
                    {/* 
                    <button className="pg-inspector-btn">
                        <Calendar size={16} />
                        Edit Date/Time
                    </button>
                    */}
                    <button className="pg-inspector-btn danger" onClick={() => deletePhotos(selectedPhotos.map(p => p.id))}>
                        <Trash2 size={16} />
                        Delete {count > 1 ? `(${count})` : 'Photo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import type { Photo } from '../types';
import { X, Share2, Download, Heart, Plus } from 'lucide-react';
import './PhotoDetail.css';

interface PhotoDetailProps {
    photo: Photo;
    onClose: () => void;
}

export const PhotoDetail: React.FC<PhotoDetailProps> = ({ photo, onClose }) => {
    // Prevent click bubbling to backdrop
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="detail-backdrop" onClick={onClose}>
            <div className="detail-container" onClick={handleContentClick}>
                <button className="close-btn-mobile" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="detail-media">
                    <img src={photo.src} alt={`${photo.rider} - ${photo.horse}`} className="detail-image" />
                </div>

                <div className="detail-sidebar">
                    <div className="detail-header">
                        <div className="detail-actions">
                            <button className="icon-btn" title="Share">
                                <Share2 size={20} />
                            </button>
                            <button className="icon-btn" title="Download">
                                <Download size={20} />
                            </button>
                            <button className="icon-btn" title="Favorite">
                                <Heart size={20} />
                            </button>
                        </div>
                        <button className="save-btn">
                            <Plus size={18} style={{ marginRight: '6px' }} />
                            Add to cart
                        </button>
                    </div>

                    <div className="detail-info">
                        <h2 className="detail-title">
                            {photo.rider} <span className="subtitle">on {photo.horse}</span>
                        </h2>

                        <div className="detail-meta-list">
                            <div className="meta-item">
                                <span className="meta-label">Event</span>
                                <span className="meta-value">{photo.event}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Date</span>
                                <span className="meta-value">{photo.date}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Image size</span>
                                <span className="meta-value">{photo.width} x {photo.height}px</span>
                            </div>
                        </div>

                        <div className="photographer-credit">
                            <div className="avatar__placeholder">AK</div>
                            <div className="credit-text">
                                <span className="credit-label">Photographed by</span>
                                <span className="credit-name">Alva Karlsson</span>
                            </div>
                            <button className="follow-btn">Follow</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

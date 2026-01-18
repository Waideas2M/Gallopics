import React, { useState } from 'react';
import type { Photo } from '../types';
import { Share2, Plus, MoreVertical } from 'lucide-react';
import './PhotoCard.css';

interface PhotoCardProps {
    photo: Photo;
    onClick: (photo: Photo) => void;
    onAddToCart?: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, onAddToCart }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const toggleMobileMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMobileMenu(!showMobileMenu);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(photo);
        }
        setShowMobileMenu(false);
    };

    return (
        <div className="photo-card" onClick={() => onClick(photo)} tabIndex={0}>
            <div className="card-image-wrapper" style={{ aspectRatio: `${photo.width}/${photo.height}` }}>
                <img
                    src={photo.src}
                    alt={`${photo.rider} on ${photo.horse}`}
                    loading="lazy"
                    className={`card-image ${isLoaded ? 'loaded' : 'loading'}`}
                    onLoad={() => setIsLoaded(true)}
                />
                {/* Hover Actions Overlay - Desktop */}
                <div className="card-hover-overlay">
                    <div className="hover-actions-top">
                        {/* Removed simplistic top badge */}
                    </div>

                    {/* Event Info Patch - Bottom Left Overlay - SIMPLIFIED */}
                    <div className="event-info-patch">
                        {/* 1. Event Name (White) */}
                        <div className="patch-row event-name">{photo.event}</div>

                        {/* 2. City + Flag | Date • Time (All subtle same weight) */}
                        <div className="patch-row detail-text">
                            <span className="flag">🇸🇪</span> {photo.city} <span className="sep">•</span> {new Date(photo.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {photo.time}
                        </div>
                    </div>
                    <div className="hover-actions-bottom">
                        <button className="icon-btn-glass" onClick={(e) => { e.stopPropagation(); }} title="Share">
                            <Share2 size={18} />
                        </button>
                        <button className="icon-btn-glass primary" onClick={handleAddToCart} title="Add to cart">
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-content">
                <div className="card-main-info">
                    <h3 className="rider-horse-title">{photo.rider}</h3>
                    <span className="horse-subtitle">{photo.horse}</span>
                </div>

                {/* Mobile Actions: "More" Menu Trigger */}
                <div className="card-mobile-actions">
                    <button className="mobile-action-btn" onClick={toggleMobileMenu}>
                        <MoreVertical size={20} />
                    </button>

                    {/* Mobile Menu Popup */}
                    {showMobileMenu && (
                        <div className="mobile-menu-popup">
                            <button onClick={handleAddToCart}>
                                <Plus size={16} /> Add to Cart
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setShowMobileMenu(false); }}>
                                <Share2 size={16} /> Share
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

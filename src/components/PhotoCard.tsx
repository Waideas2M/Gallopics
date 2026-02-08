import React, { useState } from 'react';
import type { Photo } from '../types';
import { Share2, Plus, MoreVertical, Check, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { WatermarkedThumbnail } from './WatermarkedThumbnail';
import './PhotoCard.css';

interface PhotoCardProps {
    photo: Photo;
    onClick: (photo: Photo) => void;
    onAddToCart?: (photo: Photo) => void;
    variant?: 'default' | 'pgUpload' | 'pgDuplicate' | 'pgPublished';
    // Extended props for pgUpload variant
    pgMeta?: {
        fileName?: string;
        photoCode?: string;
        uploadDate?: string;
        timestamp?: string;
        priceStandard?: number;
        priceHigh?: number;
        soldCount?: number;
        totalBucketSales?: number;
        // For pgDuplicate variant
        alsoIn?: string[]; // e.g. ["Uncategorised", "Day 1"]
        storedLocation?: string; // e.g. "Random"
    };
    // Duplicate actions
    onKeep?: () => void;
    onRemove?: () => void;
    // Group-level actions
    onManageDuplicate?: () => void;
    // New Actions
    onEdit?: (photo: Photo) => void;
    onPreview?: (photo: Photo) => void;
    onEditPrice?: (photo?: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
    photo,
    onClick,
    onAddToCart,
    variant = 'default',
    pgMeta,
    onKeep,
    onRemove,
    onManageDuplicate,
    onEdit,
    onPreview,
    onEditPrice
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [dupHover, setDupHover] = useState(false);
    const { addToCart, removeFromCartByPhotoId, isInCart } = useCart();

    const isAdded = isInCart(photo.id);

    // 1. Variant Configuration (Tokenizing variants)
    const config = {
        isPG: ['pgUpload', 'pgDuplicate', 'pgPublished'].includes(variant),
        showDots: ['pgUpload', 'pgPublished'].includes(variant),
        showDuplicateMeta: variant === 'pgDuplicate',
        actionIcon: variant === 'pgPublished' ? <RotateCcw size={18} /> : <Trash2 size={18} />,
        actionTitle: variant === 'pgPublished' ? "Unpublish photo" : "Delete photo",
        containerClass: [
            ['pgUpload', 'pgDuplicate', 'pgPublished'].includes(variant) ? 'variant-pg-upload' : '',
            variant === 'pgDuplicate' ? 'variant-pg-duplicate' : '',
            variant === 'pgPublished' ? 'variant-pg-published' : ''
        ].filter(Boolean).join(' ')
    };

    const toggleMobileMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMobileMenu(!showMobileMenu);
    };

    const handleToggleCart = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isAdded) {
            removeFromCartByPhotoId(photo.id);
        } else {
            addToCart(photo, 'high', 'High Quality', 999);
        }

        if (!isAdded && onAddToCart) {
            onAddToCart(photo);
        }
        setShowMobileMenu(false);
    };

    // 2. Bottom Content Renderer
    const renderBottomContent = () => {
        if (!config.isPG) {
            return (
                <div className="card-content">
                    <div className="card-main-info">
                        <h3 className="rider-horse-title">{photo.rider}</h3>
                        <span className="horse-subtitle">{photo.horse}</span>
                    </div>

                    <div className="card-mobile-actions">
                        <button className="mobile-action-btn" onClick={toggleMobileMenu}>
                            <MoreVertical size={20} />
                        </button>

                        {showMobileMenu && (
                            <div className="mobile-menu-popup">
                                <button onClick={handleToggleCart} style={isAdded ? { color: '#10b981' } : {}}>
                                    {isAdded ? <><Check size={16} /> Added</> : <><Plus size={16} /> Add to Cart</>}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setShowMobileMenu(false); }}>
                                    <Share2 size={16} /> Share
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (!pgMeta) return null;

        // Duplicates variant - shows "Stored in:"
        if (config.showDuplicateMeta) {
            return (
                <div className="card-content pg-upload-meta pg-duplicate-meta">
                    <div className="pg-meta-row pg-meta-filename">{pgMeta.fileName || 'Untitled'}</div>
                    <div className="pg-meta-row pg-meta-id">{pgMeta.photoCode || 'Processing...'}</div>
                    <div className="pg-meta-row pg-meta-datetime">
                        {pgMeta.uploadDate} · {pgMeta.timestamp || '—'}
                    </div>
                    {pgMeta.storedLocation && (
                        <div className="pg-meta-row pg-meta-also-in" style={{ color: '#000', fontWeight: 500 }}>
                            Stored in: {pgMeta.storedLocation}
                        </div>
                    )}
                </div>
            );
        }

        // Uploads & Published show FileName + Bundle Dots + Sold Badge
        const web = pgMeta.priceStandard || 0;
        const high = pgMeta.priceHigh || 0;
        const soldCount = pgMeta.soldCount || 0;
        const totalBucketSales = pgMeta.totalBucketSales || 0;

        let activeBundle = 'custom';
        let bundleColor = '#9ca3af'; // default grey

        if (web === 99 && high === 199) {
            activeBundle = 'basic';
            bundleColor = '#9ca3af';
        } else if (web === 299 && high === 499) {
            activeBundle = 'standard';
            bundleColor = '#f97316';
        } else if (web === 499 && high === 999) {
            activeBundle = 'premium';
            bundleColor = '#a855f7';
        }

        return (
            <div className="card-content pg-upload-meta">
                <div className="pg-meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div className="pg-card-filename" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pgMeta.fileName || 'Untitled'}
                    </div>

                    <div className="pg-meta-right-actions" style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 8 }}>
                        {/* Sold Count Badge (Prototype variant) */}
                        {soldCount > 0 && (
                            <div
                                className="pg-sold-badge"
                                title={`Sold: ${soldCount} · Total sales: ${totalBucketSales}`}
                            >
                                {soldCount}
                            </div>
                        )}

                        {/* Single Bundle Dot */}
                        {config.showDots && (
                            <div
                                className="bundle-dot-single"
                                onClick={(e) => { e.stopPropagation(); onEditPrice?.(photo); }}
                                title={`${activeBundle.charAt(0).toUpperCase() + activeBundle.slice(1)}: Web ${web} / High ${high}`}
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: bundleColor,
                                    cursor: 'pointer'
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`photo-card ${config.containerClass}`} onClick={() => onClick(photo)} tabIndex={0}>
            <div className="card-image-wrapper" style={{ aspectRatio: `${photo.width}/${photo.height}` }} onClick={(e) => {
                if (onPreview) {
                    e.stopPropagation();
                    onPreview(photo);
                }
            }}>
                <WatermarkedThumbnail
                    src={photo.src}
                    alt={`${photo.rider} on ${photo.horse}`}
                    className={`card-image ${isLoaded ? 'loaded' : 'loading'}`}
                    onLoad={() => setIsLoaded(true)}
                    photographer={photo.photographer}
                />

                {/* Duplicate Badge / Manage */}
                {['default', 'pgUpload', 'pgPublished'].includes(variant) && photo.isDuplicate && (
                    <div
                        className="duplicate-badge"
                        onMouseEnter={() => setDupHover(true)}
                        onMouseLeave={() => setDupHover(false)}
                        onClick={(e) => { e.stopPropagation(); onManageDuplicate?.(); }}
                        style={{ cursor: 'pointer', pointerEvents: 'auto', minWidth: 60, textAlign: 'center', transition: 'all 0.2s', zIndex: 30 }}
                    >
                        {dupHover ? "Manage" : "Duplicate"}
                    </div>
                )}

                {/* Hover Actions Overlay - Desktop (Public view only) */}
                {variant === 'default' && (
                    <div className="card-hover-overlay">
                        <div className="hover-actions-top"></div>

                        <div className="event-info-patch">
                            <div className="patch-row event-name">{photo.event}</div>
                            <div className="patch-row detail-text">
                                <span className="flag">🇸🇪</span> {photo.city} <span className="sep">•</span> {new Date(photo.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {photo.time}
                            </div>
                        </div>
                        <div className="hover-actions-bottom">
                            <button className="icon-btn-glass" onClick={(e) => { e.stopPropagation(); }} title="Share">
                                <Share2 size={18} />
                            </button>
                            <button
                                className={`icon-btn-glass primary ${isAdded ? 'added' : ''}`}
                                onClick={handleToggleCart}
                                title={isAdded ? "Remove from cart" : "Add to cart"}
                            >
                                {isAdded ? <Check size={18} /> : <Plus size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit & Delete/Unpublish Actions (Stacked Top-Right for PG) */}
                {(variant === 'pgUpload' || variant === 'pgPublished') && (
                    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 20, opacity: 0, transition: 'opacity 0.2s' }} className="pg-card-actions">
                        <button className="icon-btn-glass" onClick={(e) => { e.stopPropagation(); onEdit?.(photo); }} title="Edit details">
                            <Pencil size={18} />
                        </button>
                        <button
                            className="icon-btn-glass delete-action"
                            onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                            title={config.actionTitle}
                        >
                            {config.actionIcon}
                        </button>
                        <style>{`
                            .photo-card:hover .pg-card-actions { opacity: 1 !important; }
                            .icon-btn-glass.delete-action:hover {
                                background: #fee2e2 !important;
                                color: #ef4444 !important;
                                border-color: #fecaca !important;
                            }
                        `}</style>
                    </div>
                )}

                {/* Duplicate specific actions */}
                {variant === 'pgDuplicate' && (
                    <div className="pg-duplicate-actions">
                        <button
                            className="pg-dup-action-btn keep"
                            onClick={(e) => { e.stopPropagation(); onKeep?.(); }}
                        >
                            Keep
                        </button>
                        <button
                            className="pg-dup-action-btn remove"
                            onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {renderBottomContent()}
        </div>
    );
};

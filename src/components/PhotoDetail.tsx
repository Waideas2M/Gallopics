import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Photo } from '../types';
import { X, ChevronDown, Check, Zap, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './PhotoDetail.css';

interface PhotoDetailProps {
    photo: Photo;
    onClose: () => void;
}

export const PhotoDetail: React.FC<PhotoDetailProps> = ({ photo, onClose }) => {
    const navigate = useNavigate();
    const { addToCart, removeFromCartByPhotoId, cart } = useCart();

    const isInCart = cart.some(item => item.photoId === photo.id);

    const handleAddToCart = () => {
        addToCart(photo, 'high', 'High Quality', 999);
    };

    const handleRemoveFromCart = () => {
        removeFromCartByPhotoId(photo.id);
    };

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
                    <div className="detail-header-actions">
                        <button className="icon-btn-ghost" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="detail-content-scroll">
                        <div className="detail-product-card">
                            <span className="detail-ref">#{photo.id.toUpperCase()}CAN5E</span>
                            <h2 className="detail-price">999 SEK</h2>

                            <div className="detail-quality-selector">
                                <label>Select quality</label>
                                <div className="quality-dropdown">
                                    <span>High Quality</span>
                                    <ChevronDown size={16} />
                                </div>
                            </div>

                            {isInCart ? (
                                <button
                                    className="btn-success-pill"
                                    onClick={handleRemoveFromCart}
                                    title="Remove from cart"
                                >
                                    <Check size={18} />
                                    Added
                                </button>
                            ) : (
                                <>
                                    <button className="btn-brand-pill" onClick={() => {
                                        addToCart(photo, 'high', 'High Quality', 999);
                                        navigate('/cart');
                                    }}>
                                        Buy now
                                    </button>
                                    <button className="btn-outline-pill" onClick={handleAddToCart}>
                                        <ShoppingBag size={18} />
                                        Add to cart
                                    </button>
                                </>
                            )}

                            <div className="trust-signals">
                                <div className="trust-item">
                                    <Check size={14} className="trust-icon-green" />
                                    <span>Secure payment</span>
                                </div>
                                <div className="trust-item">
                                    <Zap size={14} />
                                    <span>Instant download</span>
                                </div>
                            </div>

                            <p className="detail-footnote">
                                We’ll send you a download link after payment (valid for 24 hours). Images are delivered as JPEG.
                            </p>

                            <button className="text-link-support">
                                Questions? Contact support
                            </button>
                        </div>

                        <div className="detail-meta-info">
                            <h3 className="meta-title">{photo.rider} on {photo.horse}</h3>
                            <div className="meta-grid">
                                <div className="meta-pair">
                                    <span className="label">Event</span>
                                    <span className="value">{photo.event}</span>
                                </div>
                                <div className="meta-pair">
                                    <span className="label">Date</span>
                                    <span className="value">{photo.date}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

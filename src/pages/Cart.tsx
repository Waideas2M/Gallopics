import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { BreadcrumbItem } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { Trash2, ArrowLeft, ShoppingBag, Check, Eye } from 'lucide-react';
import { CheckoutPanel } from '../components/CheckoutPanel';
import { photos as mockPhotos, COMPETITIONS } from '../data/mockData';
import { PhotoCard } from '../components/PhotoCard';
import './Cart.css';

export function Cart() {
    const { cart, addToCart, removeFromCart, total, clearCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isSuccess, setIsSuccess] = useState(false);
    const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);

    // Auto-hide toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleAddToCart = (photo: any) => {
        // Default to high quality for quick add from recent
        const quality = 'high';
        const exists = cart.some(item => item.photoId === photo.id && item.quality === quality);

        if (exists) {
            setToast({ message: 'Already in cart' });
        } else {
            addToCart(photo, quality, 'High Resolution (2000 × 1333px)', 999);
            setToast({ message: 'Added to cart' });
        }
    };

    const fromPath = searchParams.get('from');

    const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
        const items: BreadcrumbItem[] = [];

        if (fromPath) {
            const decoded = decodeURIComponent(fromPath);
            // Handle /event/:id
            if (decoded.includes('/event/')) {
                const eventId = decoded.split('/event/')[1]?.split('?')[0];
                const event = COMPETITIONS.find(c => c.id === eventId);
                if (event) {
                    items.push({ label: event.name, onClick: () => navigate(decoded) });
                } else {
                    items.push({ label: 'Events', onClick: () => navigate('/') });
                }
            }
            // Handle /photo/:id
            else if (decoded.includes('/photo/')) {
                const photoId = decoded.split('/photo/')[1]?.split('?')[0];
                const photo = mockPhotos.find(p => p.id === photoId);
                if (photo) {
                    const event = COMPETITIONS.find(c => c.id === photo.eventId);
                    if (event) {
                        items.push({ label: event.name, onClick: () => navigate(`/event/${event.id}`) });
                        items.push({ label: 'Photo detail', onClick: () => navigate(decoded) });
                    } else {
                        items.push({ label: 'Photo detail', onClick: () => navigate(decoded) });
                    }
                } else {
                    items.push({ label: 'Events', onClick: () => navigate('/') });
                }
            }
            // Handle /photographer/:id
            else if (decoded.includes('/photographer/')) {
                items.push({ label: 'Photographer', onClick: () => navigate(decoded) });
            } else {
                items.push({ label: 'Events', onClick: () => navigate('/') });
            }
        } else {
            items.push({ label: 'Events', onClick: () => navigate('/') });
        }

        items.push({ label: 'Cart', active: true });
        return items;
    }, [fromPath, navigate]);

    const handlePay = () => {
        setIsSuccess(true);
        clearCart();
    };

    const recentPhotos = useMemo(() => {
        const saved = localStorage.getItem('gallopics_recent');
        const ids: string[] = saved ? JSON.parse(saved) : [];
        return ids
            .map(id => mockPhotos.find(p => p.id === id))
            .filter((p): p is typeof mockPhotos[0] => !!p);
    }, []);

    return (
        <div className="page-wrapper cart-page">
            <Header />

            <Breadcrumbs items={breadcrumbs} />

            <main className="cart-main">
                <div className="container">
                    {isSuccess ? (
                        <div className="checkout-success-container">
                            <div className="checkout-success-view">
                                <div className="success-card">
                                    <div className="success-icon-large">
                                        <Check size={64} />
                                    </div>
                                    <h1>Payment Successful!</h1>
                                    <p>Thank you for your purchase. We've sent a delivery email with your download links to your inbox.</p>

                                    <div className="success-actions">
                                        <button className="btn-primary" onClick={() => navigate('/')}>
                                            Continue browsing
                                        </button>
                                        <p className="success-note">Download links are active for 24 hours.</p>
                                    </div>
                                </div>
                            </div>

                            {recentPhotos.length > 0 && (
                                <div className="recently-viewed-section">
                                    <div className="section-header">
                                        <div className="title-with-icon">
                                            <Eye size={20} />
                                            <h2>Recently viewed</h2>
                                        </div>
                                    </div>
                                    <div className="recent-grid">
                                        {recentPhotos.map((photo: any) => (
                                            <PhotoCard
                                                key={photo.id}
                                                photo={photo}
                                                onClick={() => navigate(`/photo/${photo.id}?from=cart&eventId=${photo.eventId}`)}
                                                onAddToCart={() => handleAddToCart(photo)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="empty-cart-container">
                            <div className="empty-cart-state">
                                <div className="empty-cart-icon">
                                    <ShoppingBag size={48} />
                                </div>
                                <h2>Your cart is empty</h2>
                                <p>Browse our events to find your best moments captured on camera.</p>
                                <button className="btn-primary" onClick={() => navigate('/')}>
                                    Start browsing
                                </button>
                            </div>

                            {recentPhotos.length > 0 && (
                                <div className="recently-viewed-section">
                                    <div className="section-header">
                                        <div className="title-with-icon">
                                            <Eye size={20} />
                                            <h2>Recently viewed</h2>
                                        </div>
                                    </div>
                                    <div className="recent-grid">
                                        {recentPhotos.map((photo: any) => (
                                            <PhotoCard
                                                key={photo.id}
                                                photo={photo}
                                                onClick={() => navigate(`/photo/${photo.id}?from=cart&eventId=${photo.eventId}`)}
                                                onAddToCart={() => handleAddToCart(photo)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="cart-layout">
                            <div className="cart-items-section">
                                <div className="cart-items-list">
                                    {cart.map((item) => (
                                        <div
                                            key={item.cartId}
                                            className="cart-item"
                                            onClick={() => navigate(`/photo/${item.photoId}?from=cart&eventId=${item.photo.eventId}`)}
                                        >
                                            <div className="cart-item-thumbnail">
                                                <img src={item.photo.src} alt={item.photo.rider} />
                                            </div>
                                            <div className="cart-item-details">
                                                <div className="cart-item-main">
                                                    <div className="cart-item-id">#{item.photoId.toUpperCase()}</div>
                                                    <h3 className="cart-item-title">{item.photo.rider} / {item.photo.horse}</h3>
                                                    <div className="cart-item-meta">{item.photo.event}</div>
                                                    <div className="cart-item-quality">{item.qualityLabel}</div>
                                                </div>
                                                <div className="cart-item-actions" onClick={(e) => e.stopPropagation()}>
                                                    <div className="cart-item-price">{item.price} SEK</div>
                                                    <button
                                                        className="btn-remove"
                                                        onClick={() => removeFromCart(item.cartId)}
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-continue" onClick={() => fromPath ? navigate(decodeURIComponent(fromPath)) : navigate(-1)}>
                                    <ArrowLeft size={18} />
                                    Continue browsing
                                </button>

                                {recentPhotos.length > 0 && (
                                    <div className="recently-viewed-section">
                                        <div className="section-header">
                                            <div className="title-with-icon">
                                                <Eye size={20} />
                                                <h2>Recently viewed</h2>
                                            </div>
                                        </div>
                                        <div className="recent-grid">
                                            {recentPhotos.map((photo: any) => (
                                                <PhotoCard
                                                    key={photo.id}
                                                    photo={photo}
                                                    onClick={() => navigate(`/photo/${photo.id}?from=cart&eventId=${photo.eventId}`)}
                                                    onAddToCart={() => handleAddToCart(photo)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="cart-summary-section">
                                <div className="cart-summary-card">
                                    <CheckoutPanel total={total} onPay={handlePay} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div className="toast-notification">
                    <span>{toast.message}</span>
                </div>
            )}

            <Footer minimal={true} />
        </div>
    );
}

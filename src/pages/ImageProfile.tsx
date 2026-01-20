import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { BreadcrumbItem } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { ModernDropdown } from '../components/ModernDropdown';
import { InfoChip } from '../components/InfoChip';
import { photos as mockPhotos, COMPETITIONS, PHOTOGRAPHERS, RIDERS, HORSES } from '../data/mockData';
import { Share2, ChevronLeft, ChevronRight, ShoppingBag, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CheckoutPanel } from '../components/CheckoutPanel';
import './ImageProfile.css';
import { WatermarkedPhotoPreview } from '../components/WatermarkedPhotoPreview';

const getPrice = (quality: string) => {
    switch (quality) {
        case 'web': return 499;
        case 'high': return 999;
        case 'original': return 1499;
        default: return 999;
    }
};

export function ImageProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectedQuality, setSelectedQuality] = useState('high');
    const { cart, addToCart, removeFromCartByPhotoId } = useCart();
    const [showCheckout, setShowCheckout] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);

    const from = searchParams.get('from');
    const eventIdParam = searchParams.get('eventId');

    const photo = useMemo(() => mockPhotos.find(p => p.id === id) || mockPhotos[0], [id, mockPhotos]);
    const [detectedPortrait, setDetectedPortrait] = useState<boolean>(photo.height > photo.width);

    // Sync orientation when photo changes
    useEffect(() => {
        setDetectedPortrait(photo.height > photo.width);
    }, [photo.id, photo.height, photo.width]);

    // Check if current selection is in cart
    const isInCart = useMemo(() => {
        return cart.some(item => item.photoId === photo.id && item.quality === selectedQuality);
    }, [cart, photo.id, selectedQuality]);

    // Track recently viewed
    useEffect(() => {
        if (!photo.id) return;
        const saved = localStorage.getItem('gallopics_recent');
        let recent: string[] = saved ? JSON.parse(saved) : [];

        // Move current to front, limit to 8
        recent = [photo.id, ...recent.filter(i => i !== photo.id)].slice(0, 8);
        localStorage.setItem('gallopics_recent', JSON.stringify(recent));
    }, [photo.id]);

    // Auto-hide toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const event = useMemo(() => COMPETITIONS.find(c => c.id === photo.eventId), [photo.eventId]);
    const photographer = useMemo(() => {
        const p = PHOTOGRAPHERS.find(pg => pg.primaryEventId === photo.eventId) || PHOTOGRAPHERS[0];
        return p;
    }, [photo.eventId]);

    const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
        const items: BreadcrumbItem[] = [];

        if (from === 'epro' && eventIdParam) {
            items.push({ label: photo.event, onClick: () => navigate(`/event/${eventIdParam}`) });
        } else if (from === 'ppro') {
            items.push({ label: 'Back to photos', onClick: () => navigate(-1) });
        } else if (from === 'cart') {
            items.push({ label: 'Cart', onClick: () => navigate(-1) });
        } else {
            items.push({ label: 'Events', onClick: () => navigate('/') });
        }

        if (showCheckout) {
            items.push({ label: 'Photo detail', onClick: () => setShowCheckout(false) });
            items.push({ label: isSuccess ? 'Confirmation' : 'Checkout', active: true });
        } else {
            items.push({ label: 'Photo detail', active: true });
        }

        return items;
    }, [from, eventIdParam, photo, navigate, showCheckout, isSuccess]);

    // Quality Selector Options
    const qualityOptions = useMemo(() => {
        return [
            {
                label: 'Web Quality',
                value: 'web',
                subtext: detectedPortrait ? 'Portrait: 720×1080' : 'Landscape: 1080×720',
                description: 'Suitable for social media posts.'
            },
            {
                label: 'High Quality',
                value: 'high',
                subtext: detectedPortrait ? 'Portrait: 4000×6000' : 'Landscape: 6000×4000',
                description: 'Suitable for printing photo frames.'
            },
            {
                label: 'Original Quality',
                value: 'original',
                subtext: 'Uncompressed Original Files',
                description: 'Maximum resolution for professional use.'
            }
        ];
    }, [detectedPortrait]);

    return (
        <div className="page-wrapper image-profile-page">
            <Header />

            <Breadcrumbs items={breadcrumbs} />

            <main className="image-profile-main">
                <div className="container">
                    <div className="ipro-layout">
                        {/* Left: Photo Viewer Card */}
                        <div className="ipro-left">
                            <div className="photo-card-large">
                                <div className="photo-info-strip">
                                    <div className="chip-group">
                                        <InfoChip
                                            label="Rider"
                                            name={photo.rider}
                                            variant="rider"
                                            onClick={() => {
                                                const riderData = RIDERS.find(r => `${r.firstName} ${r.lastName}` === photo.rider);
                                                const rId = riderData ? riderData.id : 'r1';
                                                navigate(`/rider/${rId}?from=photo&photoId=${photo.id}`);
                                            }}
                                        />

                                        <InfoChip
                                            label="Horse"
                                            name={photo.horse}
                                            variant="horse"
                                            onClick={() => {
                                                const horseData = HORSES.find(h => h.name === photo.horse);
                                                const hId = horseData ? horseData.id : 'h1';
                                                navigate(`/horse/${hId}?from=photo&photoId=${photo.id}`);
                                            }}
                                        />

                                        <InfoChip
                                            label="Photographer"
                                            name={`${photographer.firstName} ${photographer.lastName}`}
                                            variant="photographer"
                                            avatarUrl={`/images/${photographer.firstName} ${photographer.lastName}.jpg`}
                                            onClick={() => navigate(`/photographer/${photographer.id}?from=ipro&eventId=${photo.eventId}`)}
                                        />
                                    </div>

                                    <div className="top-bar-actions">
                                        <div className="nav-group">
                                            <button className="share-action-btn nav-btn-small" aria-label="Previous photo">
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button className="share-action-btn nav-btn-small" aria-label="Next photo">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                        <div className="action-divider"></div>
                                        <button className="share-action-btn" onClick={() => alert('Coiped link!')}>
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="photo-viewer">
                                    <WatermarkedPhotoPreview
                                        src={photo.src}
                                        alt={photo.rider}
                                        onLoad={(e) => {
                                            const img = e.currentTarget;
                                            setDetectedPortrait(img.naturalHeight > img.naturalWidth);
                                        }}
                                        photographer={`${photographer.firstName} ${photographer.lastName}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: Purchase and Details Panel */}
                        <div className="ipro-right">
                            <div className="ipro-card purchase-card">
                                {!showCheckout ? (
                                    <>
                                        <div className="ipro-card-header">
                                            <span className="photo-id">#{photo.id.toUpperCase()}</span>
                                        </div>
                                        <div className="ipro-price">{getPrice(selectedQuality)} SEK</div>

                                        <div className="ipro-form">
                                            <div className="form-group">
                                                <label>Select quality</label>
                                                <ModernDropdown
                                                    value={selectedQuality}
                                                    options={qualityOptions}
                                                    onChange={setSelectedQuality}
                                                    label="Quality"
                                                />
                                            </div>

                                            <div className="ipro-actions">
                                                <button
                                                    className="btn-primary"
                                                    style={{ width: '100%' }}
                                                    onClick={() => setShowCheckout(true)}
                                                >
                                                    Buy now
                                                </button>
                                                <button
                                                    className={`btn-outline ${isInCart ? 'added' : ''}`}
                                                    style={{ width: '100%' }}
                                                    onClick={() => {
                                                        if (isInCart) {
                                                            removeFromCartByPhotoId(photo.id);
                                                            return;
                                                        }

                                                        const selected = qualityOptions.find(o => o.value === selectedQuality);
                                                        if (selected) {
                                                            addToCart(photo, selectedQuality, selected.label, getPrice(selectedQuality));
                                                        }
                                                    }}
                                                >
                                                    {isInCart ? (
                                                        <>
                                                            <Check size={18} />
                                                            Added
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingBag size={20} />
                                                            Add to cart
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="trust-line">
                                                <div className="trust-item trust-payment">
                                                    <Check size={14} className="trust-icon" />
                                                    <span>Secure payment</span>
                                                </div>
                                                <div className="trust-item trust-download">
                                                    <Zap size={14} className="trust-icon" />
                                                    <span>Instant download</span>
                                                </div>
                                            </div>

                                            <div className="purchase-footnote">
                                                We’ll send you a download link after payment (valid for 24 hours). Images are delivered as JPEG.
                                            </div>

                                            <a href="#" className="support-link">Questions? Contact support</a>
                                        </div>
                                    </>
                                ) : (
                                    <div className="checkout-mode">
                                        <button className="btn-back-to-photo" onClick={() => setShowCheckout(false)}>
                                            <ChevronLeft size={16} />
                                            Back to selection
                                        </button>
                                        {isSuccess ? (
                                            <div className="success-state-panel">
                                                <div className="success-icon">
                                                    <Check size={48} />
                                                </div>
                                                <h2>Payment successful!</h2>
                                                <p>We've sent a download link to your email. You can also download your photo directly below.</p>
                                                <button className="btn-primary full-width" onClick={() => alert('Download started...')}>
                                                    <Zap size={18} />
                                                    Download Original
                                                </button>
                                                <button className="btn-secondary full-width" onClick={() => navigate('/')}>
                                                    Continue browsing
                                                </button>
                                            </div>
                                        ) : (
                                            <CheckoutPanel
                                                total={getPrice(selectedQuality)}
                                                onPay={() => setIsSuccess(true)}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="ipro-card details-card">
                                <h3 className="ipro-card-title">Details</h3>
                                <div className="details-list">
                                    <div className="detail-item">
                                        <span className="detail-label">Event</span>
                                        <div className="detail-value clickable" onClick={() => navigate(`/event/${photo.eventId}`)}>
                                            {photo.event}
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Club</span>
                                        <span className="detail-value">Stockholms Ryttarförening</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Orientation</span>
                                        <span className="detail-value">{detectedPortrait ? 'Portrait' : 'Landscape'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Discipline</span>
                                        <span className="detail-value">{photo.discipline}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Class</span>
                                        <span className="detail-value">1.20m</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Time</span>
                                        <span className="detail-value">12 Jun 2026 • 14:24</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">City</span>
                                        <span className="detail-value">🇸🇪 {event?.city}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Venue</span>
                                        <span className="detail-value">Main Arena</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div className="toast-notification">
                    <span>{toast.message}</span>
                    {toast.action && (
                        <button className="toast-action" onClick={toast.action.onClick}>
                            {toast.action.label}
                        </button>
                    )}
                </div>
            )}

            <Footer minimal={false} />
        </div>
    );
}

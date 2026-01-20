import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LayoutGrid } from 'lucide-react';
import { ModernSearchBar } from './ModernSearchBar';
import { useCart } from '../context/CartContext';
import { AuthModal } from './AuthModal';
import { EditProfileModal } from './EditProfileModal';
import { DesktopRecommendationModal } from './DesktopRecommendationModal';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isDesktopRecommendationModalOpen, setIsDesktopRecommendationModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const { cart } = useCart();
    const { isAuthenticated, user, logout } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement>(null);

    const currentPath = encodeURIComponent(location.pathname + location.search);
    const isOnboarding = location.pathname.startsWith('/pg/onboarding');
    const isMobile = windowWidth < 768;

    // Window Resize Effect
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initial Scroll Effect
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const isScrolled = window.scrollY > 20;
                    setScrolled(prev => {
                        if (prev !== isScrolled) return isScrolled;
                        return prev;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper: Generate stable random color based on name
    const getAvatarColor = (name: string) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <>
            <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
                <div className="header-top container">
                    {/* 1. Logo (Left) */}
                    <a href="/" className="logo-section">
                        <img src="/images/logo1.svg" alt="GALLOPICS" className="logo-img" />
                    </a>

                    {/* 3. Utility Icons (Right) */}
                    {!isOnboarding ? (
                        <div className="header-actions">
                            <ModernSearchBar collapsible />

                            {isAuthenticated ? (
                                <>
                                    <button className="icon-btn cart-btn" aria-label="Cart" onClick={() => navigate(`/cart?from=${currentPath}`)}>
                                        <ShoppingBag size={22} />
                                        {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                                    </button>

                                    {/* Signed In: Workspace Button (Hidden on Mobile) */}
                                    {!isMobile && (
                                        <>
                                            <div className="header-separator" />
                                            <button
                                                className="icon-btn workspace-btn"
                                                aria-label="Workspace"
                                                onClick={() => navigate('/pg')}
                                                title="Go to Workspace"
                                            >
                                                <LayoutGrid size={20} />
                                            </button>
                                        </>
                                    )}

                                    {/* User Chip with Dropdown */}
                                    <div style={{ position: 'relative' }} ref={menuRef}>
                                        <button
                                            className="user-chip"
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        >
                                            <div
                                                className="user-avatar-circle"
                                                style={{ backgroundColor: user?.avatarUrl ? 'transparent' : getAvatarColor(user?.displayName || 'U') }}
                                            >
                                                {user?.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    (user?.displayName || 'U').charAt(0)
                                                )}
                                            </div>
                                            <div className="user-details">
                                                <span className="user-name">{user?.displayName || 'Klara Fors'}</span>
                                                <span className="user-meta">{user?.city || 'Stockholm'}</span>
                                            </div>
                                        </button>

                                        {isUserMenuOpen && (
                                            <div className="user-menu-dropdown">
                                                <button className="user-menu-item" onClick={() => { setIsEditProfileModalOpen(true); setIsUserMenuOpen(false); }}>Edit contact</button>
                                                <button className="user-menu-item" onClick={() => { navigate(`/photographer/${user?.id || 'klara-fors'}`); setIsUserMenuOpen(false); }}>My public profile</button>
                                                <div style={{ height: '1px', background: '#eee', margin: '4px 0' }} />
                                                <button className="user-menu-item danger" onClick={() => { logout(); setIsUserMenuOpen(false); navigate('/'); }}>Log out</button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Guest: Cart & Auth Icon */}
                                    <button className="icon-btn cart-btn" aria-label="Cart" onClick={() => navigate(`/cart?from=${currentPath}`)}>
                                        <ShoppingBag size={22} />
                                        {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                                    </button>

                                    <div className="header-separator" />

                                    <button
                                        className="icon-btn"
                                        aria-label="Profile"
                                        onClick={() => {
                                            if (isMobile) {
                                                setIsDesktopRecommendationModalOpen(true);
                                            } else {
                                                setIsAuthModalOpen(true);
                                            }
                                        }}
                                    >
                                        <User size={22} />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="header-actions" />
                    )}
                </div>
            </header>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            <EditProfileModal
                isOpen={isEditProfileModalOpen}
                onClose={() => setIsEditProfileModalOpen(false)}
            />

            <DesktopRecommendationModal
                isOpen={isDesktopRecommendationModalOpen}
                onClose={() => setIsDesktopRecommendationModalOpen(false)}
            />
        </>
    );
};

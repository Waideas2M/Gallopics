import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import { ModernSearchBar } from './ModernSearchBar';
import { useCart } from '../context/CartContext';
import './Header.css';

export const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const { cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const currentPath = encodeURIComponent(location.pathname + location.search);

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

    return (
        <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
            <div className="header-top container">
                {/* 1. Logo (Left) */}
                <a href="/" className="logo-section">
                    <img src="/images/logo1.svg" alt="GALLOPICS" className="logo-img" />
                </a>

                {/* 3. Utility Icons (Right) */}
                <div className="header-actions">
                    <ModernSearchBar collapsible />
                    <button className="icon-btn cart-btn" aria-label="Cart" onClick={() => navigate(`/cart?from=${currentPath}`)}>
                        <ShoppingBag size={22} />
                        {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                    </button>
                    <button className="icon-btn" aria-label="Profile">
                        <User size={22} />
                    </button>
                </div>
            </div>
        </header>
    );
};

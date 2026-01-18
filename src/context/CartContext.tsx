import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Photo } from '../types';

interface CartContextType {
    cart: CartItem[];
    addToCart: (photo: Photo, quality: string, qualityLabel: string, price: number) => void;
    removeFromCart: (cartId: string) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('gallopics_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading cart from localStorage:', e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('gallopics_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (photo: Photo, quality: string, qualityLabel: string, price: number) => {
        setCart(prev => {
            // Prevent duplicates
            const exists = prev.some(item => item.photoId === photo.id && item.quality === quality);
            if (exists) return prev;

            const newItem: CartItem = {
                cartId: Math.random().toString(36).substr(2, 9),
                photoId: photo.id,
                photo,
                quality,
                qualityLabel,
                price
            };
            return [...prev, newItem];
        });
    };

    const removeFromCart = (cartId: string) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const clearCart = () => setCart([]);

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Photo } from '../types';
import './Highlights.css';

interface HighlightsProps {
    items: Photo[];
}

export const Highlights: React.FC<HighlightsProps> = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const highlightPhotos = items;

    const openCarousel = (index: number) => {
        setActiveIndex(index);
        setIsOpen(true);
    };

    const closeCarousel = () => setIsOpen(false);

    const nextPhoto = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveIndex(prev => (prev + 1) % highlightPhotos.length);
    };

    const prevPhoto = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveIndex(prev => (prev - 1 + highlightPhotos.length) % highlightPhotos.length);
    };

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeCarousel();
            if (e.key === 'ArrowRight') nextPhoto();
            if (e.key === 'ArrowLeft') prevPhoto();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, highlightPhotos.length]);

    return (
        <>
            <div className="highlights-grid">
                {highlightPhotos.map((photo, index) => (
                    <div
                        key={photo.id}
                        className="highlight-tile"
                        onClick={() => openCarousel(index)}
                    >
                        <img src={photo.src} alt="" loading="lazy" />
                    </div>
                ))}
            </div>

            {isOpen && (
                <div className="highlights-carousel-overlay" onClick={closeCarousel}>
                    <button className="carousel-close" onClick={closeCarousel}>
                        <X size={32} />
                    </button>

                    <div className="carousel-content" onClick={e => e.stopPropagation()}>
                        <div className="carousel-img-wrapper">
                            <img
                                src={highlightPhotos[activeIndex].src}
                                alt=""
                            />
                        </div>

                        {highlightPhotos.length > 1 && (
                            <>
                                <button className="carousel-nav prev" onClick={prevPhoto}>
                                    <ChevronLeft size={32} />
                                </button>
                                <button className="carousel-nav next" onClick={nextPhoto}>
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        {/* No watermark note implicitly handled by not rendering watermark overlays */}
                    </div>
                </div>
            )}
        </>
    );
};

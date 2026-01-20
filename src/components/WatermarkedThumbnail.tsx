import React from 'react';
import './WatermarkOverlay.css';

interface WatermarkedThumbnailProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    photographer?: string;
}

export const WatermarkedThumbnail: React.FC<WatermarkedThumbnailProps> = ({
    photographer = 'Gallopics',
    className,
    alt,
    ...props
}) => {
    return (
        <div className={`watermarked-thumbnail-wrapper ${className || ''}`}>
            <img
                className="watermarked-image"
                alt={alt}
                {...props}
            />
            <div className="thumbnail-watermark-overlay">
                <img src="/images/logo1.svg" alt="" className="thumbnail-watermark-logo" />
                <span className="thumbnail-watermark-text">© {photographer}</span>
            </div>
        </div>
    );
};

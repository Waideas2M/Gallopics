import React from 'react';
import './MasonryGrid.css';

interface MasonryGridProps {
    children: React.ReactNode;
    isLoading?: boolean;
    skeletonCount?: number;
    renderSkeleton?: () => React.ReactNode;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
    children,
    isLoading = false,
    skeletonCount = 12,
    renderSkeleton
}) => {
    if (isLoading && renderSkeleton) {
        return (
            <div className="masonry-grid">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <React.Fragment key={`skel-${index}`}>
                        {renderSkeleton()}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    return (
        <div className="masonry-grid">
            {children}
        </div>
    );
};

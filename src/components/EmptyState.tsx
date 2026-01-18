import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
    onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onClearFilters }) => {
    return (
        <div className="empty-state container">
            <div className="empty-content">
                <h3 className="empty-title">No photos found</h3>
                <p className="empty-text">Try adjusting your filters or search terms.</p>
                <button className="clear-btn" onClick={onClearFilters}>
                    Clear all filters
                </button>
            </div>
        </div>
    );
};

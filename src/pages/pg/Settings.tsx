import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePhotographer } from '../../context/PhotographerContext';
import { ManageHighlightsModal } from '../../components/ManageHighlightsModal';
import './Settings.css';

export const Settings: React.FC = () => {
    const { highlights, updateHighlights, availableToHire, toggleAvailableToHire, photographerId } = usePhotographer();
    const [isHighlightsModalOpen, setIsHighlightsModalOpen] = useState(false);

    return (
        <div className="pg-settings-container">
            <div className="pg-settings-header-row">
                <h1 className="pg-page-title">Settings</h1>
                <Link to={`/photographer/${photographerId}`} className="pg-btn pg-btn-secondary" target="_blank">
                    Visit my public profile
                </Link>
            </div>

            <div className="pg-settings-section">
                <h2 className="pg-section-title">Profile & public page</h2>

                <div className="pg-settings-row">
                    <div className="pg-row-info">
                        <div className="pg-row-label">Highlight photos</div>
                        <div className="pg-row-sub">{highlights.length} / 10 selected</div>
                    </div>
                    <button
                        className="pg-btn pg-btn-secondary"
                        onClick={() => setIsHighlightsModalOpen(true)}
                    >
                        Manage
                    </button>
                </div>

                <div className="pg-settings-row">
                    <div className="pg-row-info">
                        <div className="pg-row-label">Available to hire</div>
                        <div className="pg-row-sub">Allow potential clients to hire you from your public profile</div>
                    </div>
                    <label className="pg-toggle-switch">
                        <input
                            type="checkbox"
                            checked={availableToHire}
                            onChange={(e) => toggleAvailableToHire(e.target.checked)}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            <ManageHighlightsModal
                isOpen={isHighlightsModalOpen}
                onClose={() => setIsHighlightsModalOpen(false)}
                initialIds={highlights}
                onSave={updateHighlights}
            />
        </div>
    );
};

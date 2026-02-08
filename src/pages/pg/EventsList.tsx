import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotographer } from '../../context/PhotographerContext';
import { ModernDropdown } from '../../components/ModernDropdown';
import { Button } from '../../components/Button';
import { TitleHeader } from '../../components/TitleHeader';
import { PgEventCard } from './components/PgEventCard';
import { CoverImagePickerModal } from './components/CoverImagePickerModal';
import './EventsList.css';

export const EventsList: React.FC = () => {
    const { events, registerForEvent } = usePhotographer();
    const [view, setView] = useState<'my' | 'upcoming'>('my');
    const [county, setCounty] = useState('');
    const [activePickerEventId, setActivePickerEventId] = useState<string | null>(null);
    const navigate = useNavigate();

    const isSuperAdmin = false;

    // Filter Logic
    const filteredEvents = events.filter(e => {
        if (!county) return true;
        // Search by city as mock for county
        return e.city.toLowerCase().includes(county.toLowerCase());
    });

    const myEvents = filteredEvents.filter(e => e.isRegistered);
    const upcomingEvents = filteredEvents.filter(e => !e.isRegistered && e.status === 'upcoming');

    const handleRegister = (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        registerForEvent(eventId);
    };

    const handleCoverChange = (eventId: string) => {
        setActivePickerEventId(eventId);
    };

    return (
        <div className="pg-events-container">
            <TitleHeader
                variant="workspace"
                title="Events"
                rightContent={
                    <button
                        className="btn-primary-small"
                        disabled={!isSuperAdmin}
                        title="Admin only"
                        style={{ opacity: isSuperAdmin ? 1 : 0.5, cursor: isSuperAdmin ? 'pointer' : 'not-allowed' }}
                    >
                        Add an event
                    </button>
                }
            />

            {/* Controls: Toggle + Filters */}
            <div className="pg-events-controls">
                {/* Segmented Control */}
                <div className="pg-segmented-control">
                    <button
                        className={`pg-segment-btn ${view === 'my' ? 'active' : ''}`}
                        onClick={() => setView('my')}
                    >
                        My events
                    </button>
                    <button
                        className={`pg-segment-btn ${view === 'upcoming' ? 'active' : ''}`}
                        style={{ position: 'relative' }}
                        onClick={() => setView('upcoming')}
                    >
                        Upcoming
                        {/* Red Badge */}
                        <span className="pg-tab-badge-red" />
                    </button>
                </div>

                {/* Filters (Always visible) */}
                <div className="pg-events-filters">
                    <ModernDropdown
                        value="Sweden"
                        options={[{ label: 'Sweden', value: 'Sweden', icon: '🇸🇪' }]}
                        onChange={() => { }}
                        icon="🇸🇪"
                        variant="pill"
                        label="Country"
                    />
                    <ModernDropdown
                        value={county}
                        options={[
                            { label: 'All counties', value: '' },
                            { label: 'Skåne', value: 'Skane' },
                            { label: 'Stockholm', value: 'Stockholm' },
                            { label: 'Västra Götaland', value: 'VastraGotaland' }
                        ]}
                        onChange={(val) => setCounty(val)}
                        placeholder="Select county"
                        variant="pill"
                        label="County"
                    />
                </div>
            </div>

            {/* List Content */}
            {view === 'my' ? (
                <div className="pg-events-grid">
                    {myEvents.length === 0 ? (
                        <div className="pg-empty-state">You haven't joined any events yet.</div>
                    ) : (
                        myEvents.map(event => (
                            <PgEventCard
                                key={event.id}
                                event={event}
                                onCoverChange={handleCoverChange}
                            />
                        ))
                    )}
                </div>
            ) : (
                <div className="pg-events-list">
                    {upcomingEvents.length === 0 ? (
                        <div className="pg-empty-state">No upcoming events found.</div>
                    ) : (
                        upcomingEvents.map(event => (
                            <div key={event.id} className="pg-event-row upcoming-event">
                                <div className="pg-event-thumb">
                                    <img src={event.logo} alt={event.title} />
                                </div>
                                <div className="pg-event-info">
                                    <div className="pg-event-meta-line1">{event.dateRange}</div>
                                    <h3 className="pg-event-title">{event.title}</h3>
                                    <div className="pg-event-meta-line3">
                                        <span>{event.city}</span>
                                        <span className="meta-bullet">•</span>
                                        <span>{event.venueName}</span>
                                        <span className="meta-bullet">•</span>
                                        <span>{(event.disciplines || []).join(', ')}</span>
                                    </div>
                                </div>
                                <div className="pg-event-actions">
                                    <Button variant="secondary" size="small" onClick={() => navigate(`/event/${event.id}`)}>
                                        Details
                                    </Button>
                                    <Button variant="secondary" size="small" onClick={(e) => handleRegister(e, event.id)}>
                                        Request access
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Picker Modal */}
            <CoverImagePickerModal
                isOpen={!!activePickerEventId}
                onClose={() => setActivePickerEventId(null)}
                eventId={activePickerEventId || ''}
                onSelect={(url) => {
                    console.log('New cover selected:', url, 'for event:', activePickerEventId);
                }}
            />
        </div>
    );
};

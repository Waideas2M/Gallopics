import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { usePhotographer } from '../../context/PhotographerContext';
import './EventsList.css';

export const EventsList: React.FC = () => {
    const { events, registerForEvent, openUploadOverlay } = usePhotographer();
    const [view, setView] = useState<'upcoming' | 'my'>('upcoming');
    const navigate = useNavigate();

    // Filter Logic
    const upcomingEvents = events.filter(e => !e.isRegistered && e.status === 'upcoming');
    const myEvents = events.filter(e => e.isRegistered);

    const displayedEvents = view === 'upcoming' ? upcomingEvents : myEvents;

    const handleManage = (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        navigate(`/pg/events/${eventId}`);
    };

    const handleUpload = (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        openUploadOverlay(eventId);
    };

    const handleRegister = (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        registerForEvent(eventId);
    };

    const [country, setCountry] = useState('Sweden');
    const [county, setCounty] = useState('');
    const isSuperAdmin = false; // Mock flag

    return (
        <div className="pg-events-container">
            {/* Header: Title + Admin CTA */}
            <div className="pg-events-header">
                <h1>Events</h1>
                <button
                    className="pg-btn pg-btn-primary"
                    disabled={!isSuperAdmin}
                    title="Admin only"
                    style={{ opacity: isSuperAdmin ? 1 : 0.5, cursor: isSuperAdmin ? 'pointer' : 'not-allowed' }}
                >
                    Add an event
                </button>
            </div>

            {/* Controls: Toggle + Filters */}
            <div className="pg-events-controls">
                {/* Segmented Control */}
                <div className="pg-segmented-control">
                    <button
                        className={`pg-segment-btn ${view === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setView('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`pg-segment-btn ${view === 'my' ? 'active' : ''}`}
                        onClick={() => setView('my')}
                    >
                        My events
                    </button>
                </div>

                {/* Filters (Upcoming only) */}
                {view === 'upcoming' && (
                    <div className="pg-events-filters">
                        <div className="pg-filter-select">
                            <span style={{ fontSize: '1.2rem', marginRight: 6 }}>🇸🇪</span>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="pg-native-select"
                            >
                                <option value="Sweden">Sweden</option>
                            </select>
                        </div>
                        <div className="pg-filter-select">
                            <select
                                value={county}
                                onChange={(e) => setCounty(e.target.value)}
                                className="pg-native-select"
                                style={{ minWidth: '130px' }}
                            >
                                <option value="" disabled>Select county</option>
                                <option value="Skane">Skåne</option>
                                <option value="Stockholm">Stockholm</option>
                                <option value="VastraGotaland">Västra Götaland</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="pg-events-list">
                {displayedEvents.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                        {view === 'upcoming' ? 'No upcoming events found.' : 'You haven\'t joined any events yet.'}
                    </div>
                ) : (
                    displayedEvents.map(event => (
                        <div
                            key={event.id}
                            className={`pg-event-row ${view === 'my' ? 'my-event' : 'upcoming-event'}`}
                            onClick={() => view === 'my' && navigate(`/pg/events/${event.id}`)}
                            style={{ cursor: view === 'my' ? 'pointer' : 'default' }}
                        >
                            <div className="pg-event-thumb">
                                <img src={event.logo} alt={event.title} />
                            </div>

                            <div className="pg-event-info">
                                {view === 'upcoming' ? (
                                    <>
                                        <div className="pg-event-meta-line1">{event.dateRange}</div>
                                        <h3 className="pg-event-title">{event.title}</h3>
                                        <div className="pg-event-meta-line3">
                                            <span>{event.city}</span>
                                            <span className="meta-bullet">•</span>
                                            <span>{event.venueName}</span>
                                            <span className="meta-bullet">•</span>
                                            <span>{(event.disciplines || []).join(', ')}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="pg-event-meta-line1">{event.dateRange}</div>
                                        <h3 className="pg-event-title">{event.title}</h3>
                                        <div className="pg-event-meta-line3">
                                            <span>{event.city}</span>
                                            <span className="meta-bullet">•</span>
                                            <span>{event.venueName}</span>
                                            <span className="meta-bullet">•</span>
                                            <span>{(event.disciplines || []).join(', ')}</span>
                                        </div>
                                        <div className="pg-event-stats">
                                            <span>Photos: {event.photosCount || 0}</span>
                                            <span>Published: {event.publishedCount || 0}</span>
                                            <span>Sold: {event.soldCount || 0}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pg-event-actions">
                                {view === 'upcoming' ? (
                                    <>
                                        {/* Upcoming Actions */}
                                        <button className="pg-btn pg-btn-secondary" onClick={() => navigate(`/event/${event.id}`)}>
                                            Details
                                        </button>
                                        <button className="pg-btn pg-btn-primary" onClick={(e) => handleRegister(e, event.id)}>
                                            Request access
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* My Events Actions */}
                                        <button className="pg-btn pg-btn-secondary" onClick={(e) => handleUpload(e, event.id)}>
                                            <Upload size={16} style={{ marginRight: 6 }} />
                                            Upload
                                        </button>
                                        <button className="pg-btn pg-btn-secondary" onClick={(e) => handleManage(e, event.id)}>
                                            Manage
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

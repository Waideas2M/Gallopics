import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, RotateCcw, MoreHorizontal, Edit2, Archive, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

import { usePhotographer } from '../../context/PhotographerContext';
import { ModernDropdown } from '../../components/ModernDropdown';
import { Button } from '../../components/Button';
import { TitleHeader } from '../../components/TitleHeader';
import { PgEventCard } from './components/PgEventCard';
import { CoverImagePickerModal } from './components/CoverImagePickerModal';
import { ApplyEventModal } from './components/ApplyEventModal';
import { AddEventModal } from './components/AddEventModal';
import { PgToast } from './PgToast';
import { PHOTOGRAPHERS } from '../../data/mockData';
import '../../styles/shared-filters.css';
import './EventsList.css';

export const EventsList: React.FC = () => {
    const { isAdmin } = useWorkspace();
    const { events } = usePhotographer();
    const navigate = useNavigate();
    const [view, setView] = useState<'my' | 'upcoming' | 'live' | 'past' | 'archived'>(isAdmin ? 'live' : 'my');
    const [county, setCounty] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const [activePickerEventId, setActivePickerEventId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<any>(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [applyingEvent, setApplyingEvent] = useState<any>(null);
    const [showApplyToast, setShowApplyToast] = useState(false);

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: 'archive' | 'delete' | 'cancel_application'; event: any } | null>(null);

    const handleCancelAppClick = (event: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmModal({ isOpen: true, type: 'cancel_application', event });
    };

    const handleConfirmCancelApp = () => {
        // Mock cancellation logic
        console.log(`Cancelled application for ${confirmModal?.event?.title}`);
        setConfirmModal(null);
    };

    // Filter Logic
    const filteredEvents = events.filter(e => {
        const matchesCounty = !county || e.city.toLowerCase().includes(county.toLowerCase());
        const matchesSearch = !searchTerm ||
            e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.assignedPhotographers && e.assignedPhotographers.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())));
        return matchesCounty && matchesSearch;
    });

    const myEvents = filteredEvents.filter(e => e.isRegistered || e.status === 'open');
    const liveEvents = filteredEvents.filter(e => e.status === 'open');
    const pastEvents = filteredEvents.slice(2, 4); // Mock: slice some distinct ones for past
    const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming' && !e.isRegistered);
    const archivedEvents = filteredEvents.filter(e => e.status === 'archived').length > 0
        ? filteredEvents.filter(e => e.status === 'archived')
        : filteredEvents.slice(-2); // Fallback if no status match

    const handleRegister = (e: React.MouseEvent, event: any) => {
        e.stopPropagation();
        setApplyingEvent(event);
        setIsApplyModalOpen(true);
    };

    const handleApplySubmit = () => {
        setShowApplyToast(true);
        setTimeout(() => setShowApplyToast(false), 3000);
    };

    const handleCoverChange = (eventId: string) => {
        setActivePickerEventId(eventId);
    };

    const handleNavigateToEvent = (eventId: string) => {
        const basePath = isAdmin ? '/admin' : '/pg';
        navigate(`${basePath}/events/${eventId}`);
    };

    const activeList = (() => {
        if (isAdmin) {
            if (view === 'live') return liveEvents;
            if (view === 'past') return pastEvents;
            if (view === 'archived') return archivedEvents;
            if (view === 'upcoming') return upcomingEvents.slice(3);
            return upcomingEvents;
        }
        return view === 'upcoming' ? upcomingEvents : myEvents;
    })();

    return (
        <div className="pg-events-container" onClick={() => setActiveMenuId(null)}>
            <header className="pg-events-page-header">
                <TitleHeader
                    variant="workspace"
                    title="Events"
                    rightContent={
                        isAdmin && (
                            <Button
                                variant="primary"
                                size="small"
                                onClick={() => {
                                    setEventToEdit(null);
                                    setIsAddModalOpen(true);
                                }}
                            >
                                Add an event
                            </Button>
                        )
                    }
                />

                {/* Row B: Tabs only */}
                <div className="pg-events-header-controls">
                    <div className="container">
                        <div className="pg-events-header-row-b">
                            <div className="pg-tabs-list">
                                {isAdmin ? (
                                    <>
                                        <button className={`pg-tab-btn ${view === 'live' ? 'active' : ''}`} onClick={() => setView('live')}>Live events</button>
                                        <button className={`pg-tab-btn ${view === 'past' ? 'active' : ''}`} onClick={() => setView('past')}>Past events</button>
                                        <button className={`pg-tab-btn ${view === 'upcoming' ? 'active' : ''}`} onClick={() => setView('upcoming')}>Upcoming<span className="pg-tab-badge-dot" /></button>
                                        <button className={`pg-tab-btn ${view === 'archived' ? 'active' : ''}`} onClick={() => setView('archived')}>Archived</button>
                                    </>
                                ) : (
                                    <>
                                        <button className={`pg-tab-btn ${view === 'my' ? 'active' : ''}`} onClick={() => setView('my')}>My events</button>
                                        <button className={`pg-tab-btn ${view === 'upcoming' ? 'active' : ''}`} onClick={() => setView('upcoming')}>Upcoming<span className="pg-tab-badge-dot" /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="filters-wrapper">
                <div className="container">
                    <div className="filter-container">
                        <div className="filter-group">
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
                            <button
                                className="filter-reset-btn"
                                onClick={() => { setCounty(''); setSearchTerm(''); }}
                                title="Reset filters"
                                disabled={!county && !searchTerm}
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>

                        <div className="search-group">
                            <div className="admin-search-bar">
                                <Search className="search-icon" size={17} />
                                <input
                                    type="text"
                                    placeholder="Search event name, city, organiser..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button className="clear-btn" onClick={() => setSearchTerm('')}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="pg-events-filter-right">
                            <div className="filter-results-count">
                                Showing {activeList.length} events
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Content */}
            {(isAdmin || view === 'upcoming') ? (
                <div className="pg-events-list upcoming-list">
                    {activeList.length === 0 ? (
                        <div className="pg-empty-state">No events found.</div>
                    ) : (
                        activeList.map((event, index) => {
                            const isApplied = !isAdmin && view === 'upcoming' && index >= activeList.length - 2;
                            return (
                                <div
                                    key={event.id}
                                    className={`pg-event-row-grid upcoming-event ${isApplied ? 'applied' : ''} ${isAdmin ? 'clickable-row' : ''}`}
                                    style={{ zIndex: activeMenuId === event.id ? 1001 : 1, position: 'relative' }}
                                    onClick={() => isAdmin && handleNavigateToEvent(event.id)}
                                >
                                    <div className="pg-grid-col-thumb">
                                        <div className="pg-event-thumb-small">
                                            <img src={event.logo} alt={event.title} />
                                        </div>
                                    </div>
                                    <div className="pg-grid-col-content">
                                        <div className="pg-event-date-small">{event.dateRange}</div>
                                        <h3 className="pg-event-title-bold">{event.title}</h3>
                                        <div className="pg-event-meta-row">
                                            <span>{event.city}</span>
                                            <span className="meta-bullet">•</span>
                                            <span>{event.venueName}</span>
                                            {event.disciplines && (
                                                <>
                                                    <span className="meta-bullet">•</span>
                                                    <span className="meta-disciplines">{event.disciplines.join(', ')}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pg-grid-col-actions">
                                        <div className="pg-applied-action-group">
                                            {isAdmin ? (
                                                <div className="pg-admin-card-actions">
                                                    {/* Stats for Live/Past/Archived */}
                                                    {view !== 'upcoming' && (
                                                        <>
                                                            <div className="pg-stats-badges" style={{ gap: 8 }}>
                                                                <div className="pg-badge-item published stacked">
                                                                    <span className="label">Published</span>
                                                                    <span className="count">{event.publishedCount ?? 0}</span>
                                                                </div>
                                                                <div className="pg-badge-item sales stacked">
                                                                    <span className="label">Sales</span>
                                                                    <span className="count">{event.soldCount ?? 0}/{(event.photosCount ?? 40)}</span>
                                                                </div>
                                                                <div className="pg-badge-item earnings stacked">
                                                                    <span className="label">PG Earnings</span>
                                                                    <span className="value">SEK {((event.soldCount ?? 0) * 450).toLocaleString().replace(/,/g, ' ')}</span>
                                                                </div>
                                                                <div className="pg-badge-item earnings stacked" style={{ background: '#F5F3FF', color: '#5B21B6' }}>
                                                                    <span className="label">Gallop Earnings</span>
                                                                    <span className="value" style={{ color: '#7C3AED' }}>SEK {((event.soldCount ?? 0) * 4500).toLocaleString().replace(/,/g, ' ')}</span>
                                                                </div>
                                                            </div>
                                                            <div className="pg-action-separator" style={{ height: 32, margin: '0 20px' }} />
                                                        </>
                                                    )}
                                                    {/* Avatar Column */}
                                                    {(() => {
                                                        const showAvatar = true; // Show for all tabs in Admin flow
                                                        if (!showAvatar) return <div className="pg-avatar-placeholder" />;

                                                        const p = event.assignedPhotographers?.[0];
                                                        return (
                                                            <div className="pg-admin-event-photographer">
                                                                {(view !== 'past' && view !== 'archived') && (
                                                                    <span className={`pg-applications-watermark ${event.applicationsWelcomed === false ? 'off' : 'on'}`}>
                                                                        {event.applicationsWelcomed === false ? 'Closed' : 'Open'}
                                                                    </span>
                                                                )}
                                                                {p && (
                                                                    <img
                                                                        src={p.avatar}
                                                                        alt={p.name}
                                                                        title={`Photographer: ${p.name}`}
                                                                        className="pg-admin-avatar"
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* More Menu */}
                                                    <div className="pg-more-menu-container">
                                                        <div className="pg-action-separator" />
                                                        <button
                                                            className={`pg-action-round-btn ${activeMenuId === event.id ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuId(activeMenuId === event.id ? null : event.id);
                                                            }}
                                                        >
                                                            <MoreHorizontal size={18} />
                                                        </button>

                                                        {activeMenuId === event.id && (
                                                            <div className="pg-more-dropdown" onClick={(e) => e.stopPropagation()}>
                                                                {view === 'archived' ? (
                                                                    <>
                                                                        <button onClick={() => handleNavigateToEvent(event.id)}>
                                                                            <Search size={14} />
                                                                            View Dashboard
                                                                        </button>
                                                                        <button onClick={() => { console.log('Make active', event.id); setActiveMenuId(null); }}>
                                                                            <CheckCircle size={14} />
                                                                            Make active
                                                                        </button>
                                                                        <button className="delete" onClick={() => {
                                                                            setConfirmModal({ isOpen: true, type: 'delete', event });
                                                                            setActiveMenuId(null);
                                                                        }}>
                                                                            <Trash2 size={14} />
                                                                            Delete
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button onClick={() => handleNavigateToEvent(event.id)}>
                                                                            <Search size={14} />
                                                                            Manage uploads
                                                                        </button>
                                                                        <button onClick={() => {
                                                                            setEventToEdit(event);
                                                                            setIsAddModalOpen(true);
                                                                            setActiveMenuId(null);
                                                                        }}>
                                                                            <Edit2 size={14} />
                                                                            Edit Event
                                                                        </button>
                                                                        <button onClick={() => {
                                                                            setConfirmModal({ isOpen: true, type: 'archive', event });
                                                                            setActiveMenuId(null);
                                                                        }}>
                                                                            <Archive size={14} />
                                                                            Archive
                                                                        </button>
                                                                        <div className="dropdown-divider" />
                                                                        <button className="delete" onClick={() => {
                                                                            setConfirmModal({ isOpen: true, type: 'delete', event });
                                                                            setActiveMenuId(null);
                                                                        }}>
                                                                            <Trash2 size={14} />
                                                                            Delete
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : isApplied ? (
                                                <>
                                                    <div className="pg-avatar-stack">
                                                        {PHOTOGRAPHERS.slice(0, 2).map((p) => (
                                                            <img
                                                                key={p.id}
                                                                src={`/images/${p.firstName} ${p.lastName}.jpg`}
                                                                alt={`${p.firstName} ${p.lastName}`}
                                                                title={`${p.firstName} ${p.lastName}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <Button variant="secondary" size="small" className="pg-btn-red-outline" onClick={(e) => handleCancelAppClick(event, e)}>
                                                        Cancel application
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    {(() => {
                                                        // Demo logic for Photographer Flow (view === 'upcoming')
                                                        const isLast = index === activeList.length - 1;
                                                        const isThird = index === 2;
                                                        const isFirst = index === 0;

                                                        if (isLast) {
                                                            return (
                                                                <span className="pg-applications-watermark off">
                                                                    Closed
                                                                </span>
                                                            );
                                                        }

                                                        if (isFirst) {
                                                            return (
                                                                <span className="pg-applications-watermark off disabled-tag" title="Registration opens soon">
                                                                    Will open shortly
                                                                </span>
                                                            );
                                                        }

                                                        return (
                                                            <>
                                                                {isThird && (
                                                                    <div className="pg-avatar-stack solo">
                                                                        <img
                                                                            src={`/images/${PHOTOGRAPHERS[2].firstName} ${PHOTOGRAPHERS[2].lastName}.jpg`}
                                                                            alt={`${PHOTOGRAPHERS[2].firstName} ${PHOTOGRAPHERS[2].lastName}`}
                                                                            title={`${PHOTOGRAPHERS[2].firstName} ${PHOTOGRAPHERS[2].lastName}`}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <Button variant="secondary" size="small" onClick={(e) => handleRegister(e, event)}>
                                                                    Apply
                                                                </Button>
                                                            </>
                                                        );
                                                    })()}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="pg-events-grid">
                    {myEvents.length === 0 ? (
                        <div className="pg-empty-state">You haven't joined any events yet.</div>
                    ) : (
                        myEvents.map(event => (
                            <PgEventCard
                                key={event.id}
                                event={event}
                                onCoverChange={handleCoverChange}
                                onEdit={(ev) => {
                                    setEventToEdit(ev);
                                    setIsAddModalOpen(true);
                                }}
                            />
                        ))
                    )}
                </div>
            )
            }

            <CoverImagePickerModal
                isOpen={!!activePickerEventId}
                onClose={() => setActivePickerEventId(null)}
                eventId={activePickerEventId || ''}
                onSelect={(url) => { console.log('New cover selected:', url); }}
            />

            <AddEventModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEventToEdit(null);
                }}
                eventToEdit={eventToEdit}
            />

            <ApplyEventModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                event={applyingEvent}
                onSubmit={handleApplySubmit}
            />

            {
                showApplyToast && (
                    <PgToast
                        type="success"
                        message="Application sent."
                        style={{ position: 'fixed', bottom: '24px', right: '24px', animation: 'slideUp 0.3s ease' }}
                    />
                )
            }

            {/* Confirmation Modal */}
            {confirmModal && confirmModal.isOpen && (
                <div className="pg-modal-overlay">
                    <div className="pg-modal-card">
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{ minWidth: 40, height: 40, borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <AlertCircle size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 700, color: '#111', marginBottom: 8 }}>
                                    {confirmModal.type === 'archive' && 'Archive event?'}
                                    {confirmModal.type === 'delete' && 'Delete event?'}
                                    {confirmModal.type === 'cancel_application' && 'Cancel application?'}
                                </h3>
                                <p style={{ margin: '0 0 24px', color: '#666', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                                    {confirmModal.type === 'archive' && (
                                        <>Are you sure you want to archive <strong>{confirmModal.event?.title}</strong>? It will be moved to the Archived tab.</>
                                    )}
                                    {confirmModal.type === 'delete' && (
                                        <>This will permanently delete <strong>{confirmModal.event?.title}</strong>. This action cannot be undone.</>
                                    )}
                                    {confirmModal.type === 'cancel_application' && (
                                        <>Are you sure you want to cancel your application for <strong>{confirmModal.event?.title}</strong>?</>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="pg-modal-actions">
                            <button className="pg-modal-btn secondary" onClick={() => setConfirmModal(null)}>
                                Cancel
                            </button>
                            <button
                                className="pg-modal-btn destructive"
                                onClick={() => {
                                    if (confirmModal.type === 'cancel_application') {
                                        handleConfirmCancelApp();
                                    } else {
                                        console.log(`${confirmModal.type}ing event:`, confirmModal.event?.id);
                                        setConfirmModal(null);
                                    }
                                }}
                            >
                                {confirmModal.type === 'archive' && 'Archive'}
                                {confirmModal.type === 'delete' && 'Delete'}
                                {confirmModal.type === 'cancel_application' && 'Cancel application'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

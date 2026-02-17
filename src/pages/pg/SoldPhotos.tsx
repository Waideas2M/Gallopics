import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotographer, type Photo } from '../../context/PhotographerContext';
import { MasonryGrid } from '../../components/MasonryGrid';
import { PhotoCard } from '../../components/PhotoCard';
import { TitleHeader } from '../../components/TitleHeader';
import { DollarSign, RotateCcw, X, LayoutGrid, List, AlertCircle } from 'lucide-react';
import { ModernDropdown } from '../../components/ModernDropdown';
import { ScopedSearchBar, type ScopedSearchOption } from '../../components/ScopedSearchBar';

import '../../styles/shared-filters.css';
import './SoldPhotos.css';

import { useWorkspace } from '../../context/WorkspaceContext';

export const SoldPhotos: React.FC = () => {
    const { basePath, isAdmin } = useWorkspace();
    const navigate = useNavigate();
    const { events, getPhotosByEvent } = usePhotographer();

    // States
    const [selectedEventId, setSelectedEventId] = useState<string>('all');
    const [chartEventId, setChartEventId] = useState<string>('all'); // Separate event filter for the chart
    const [selectedBundleId, setSelectedBundleId] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
    const [previewPhoto, setPreviewPhoto] = useState<any | null>(null);
    const [trendPeriod, setTrendPeriod] = useState<'this_month' | 'this_year' | 'last_year' | 'all_time'>('this_year');
    const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; photoId: string; photoCode: string } | null>(null);


    // Mock Data Constants
    const REVENUE = 24700;

    // Bundle Colors Token
    const BUNDLE_COLORS = {
        basic: '#9ca3af',
        standard: '#f97316',
        premium: '#a855f7',
        custom: '#facc15' // Yellow-400
    };

    // Helper Functions for Bundles
    const getBundleId = (photoId: string) => {
        const bundles = ['web', 'high', 'commercial', 'custom'] as const;
        const bundleHash = photoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return bundles[bundleHash % 4];
    };

    const getBundleLabel = (photoId: string) => {
        const bundleId = getBundleId(photoId);
        return {
            web: 'Web',
            high: 'High',
            commercial: 'Commercial',
            custom: 'Custom'
        }[bundleId];
    };

    const getBundleColor = (photoId: string) => {
        const bundleId = getBundleId(photoId);
        return {
            web: BUNDLE_COLORS.basic,
            high: BUNDLE_COLORS.standard,
            commercial: BUNDLE_COLORS.premium,
            custom: BUNDLE_COLORS.custom
        }[bundleId];
    };

    const bundleOptions = [
        { label: 'All bundles', value: 'all' },
        {
            label: 'Web',
            value: 'web',
            icon: <div style={{ width: 8, height: 8, borderRadius: '50%', background: BUNDLE_COLORS.basic }} />
        },
        {
            label: 'High',
            value: 'high',
            icon: <div style={{ width: 8, height: 8, borderRadius: '50%', background: BUNDLE_COLORS.standard }} />
        },
        {
            label: 'Commercial',
            value: 'commercial',
            icon: <div style={{ width: 8, height: 8, borderRadius: '50%', background: BUNDLE_COLORS.premium }} />
        },
        {
            label: 'Custom',
            value: 'custom',
            icon: <div style={{ width: 8, height: 8, borderRadius: '50%', background: BUNDLE_COLORS.custom }} />
        },
    ];

    // Options
    const eventOptions = [
        { label: 'All events', value: 'all' },
        ...events.map(e => ({ label: e.title, value: e.id }))
    ];

    const trendPeriodOptions = [
        { label: 'This month', value: 'this_month' },
        { label: 'This year', value: 'this_year' },
        { label: 'Last year', value: 'last_year' },
        { label: 'All time', value: 'all_time' }
    ];

    const allSoldPhotos = useMemo(() => {
        return events
            .flatMap(e => getPhotosByEvent(e.id))
            .filter(p => p.soldCount > 0)
            .map(p => {
                // For demo: some photos should have multiple sales
                const hash = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const mockSoldCount = (hash % 8 === 0) ? 4 : (hash % 5 === 0 ? 2 : 1);
                return {
                    ...p,
                    soldCount: mockSoldCount,
                    clientEmail: `client_${p.id.slice(0, 4)}@example.com`
                };
            });
    }, [events, getPhotosByEvent]);

    const filteredPhotos = useMemo(() => {
        return allSoldPhotos.filter(p => {
            const matchEvent = selectedEventId === 'all' || p.eventId === selectedEventId;
            const matchSearch = !searchQuery ||
                (p.photoCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.clientEmail || '').toLowerCase().includes(searchQuery.toLowerCase());

            const mockBundle = getBundleId(p.id);
            const matchBundle = selectedBundleId === 'all' || mockBundle === selectedBundleId;

            return matchEvent && matchSearch && matchBundle;
        });
    }, [allSoldPhotos, selectedEventId, searchQuery, selectedBundleId]);

    const searchOptions = useMemo<ScopedSearchOption[]>(() => {
        const ids = Array.from(new Set(allSoldPhotos.map(p => p.photoCode || `#M-0-${p.id.slice(0, 8).toUpperCase()}`)))
            .map(id => ({ label: id, value: id, type: 'id' as const }));
        const emails = Array.from(new Set(allSoldPhotos.map(p => (p as any).clientEmail || `client_${p.id.slice(0, 4)}@example.com`)))
            .map(e => ({ label: e, value: e, type: 'email' as const }));
        return [...ids, ...emails];
    }, [allSoldPhotos]);

    const isResetDisabled = selectedEventId === 'all' && selectedBundleId === 'all' && searchQuery === '';

    const mapToUiPhoto = (photo: Photo) => {
        const event = events.find(e => e.id === photo.eventId);
        return {
            id: photo.id,
            src: photo.url,
            rider: photo.rider || 'Unknown',
            horse: photo.horse || 'Unknown',
            event: event?.title || 'Event',
            eventId: photo.eventId,
            date: photo.uploadDate || new Date().toISOString(),
            time: photo.timestamp || '14:20',
            city: event?.city || 'Unknown',
            countryCode: 'SE',
            priceStandard: photo.priceStandard,
            priceHigh: photo.priceHigh,
            priceCommercial: photo.priceCommercial,
            width: photo.width,
            height: photo.height,
            className: 'photo-grid-item',
            arena: 'Arena 1',
            soldCount: photo.soldCount
        };
    };

    // Graph Data Helper
    const graphData = useMemo(() => {
        let labels: string[] = [];
        let dataPoints: any[] = [];

        if (trendPeriod === 'this_month') {
            labels = ['1', '5', '10', '15', '20', '25', '30'];
            dataPoints = Array.from({ length: 30 }).map(() => ({
                basic: Math.random() * 20,
                standard: Math.random() * 25,
                premium: Math.random() * 20,
                custom: Math.random() * 15
            }));
        } else if (trendPeriod === 'this_year') {
            // Case A: 6 months for "This Year" demo
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            dataPoints = Array.from({ length: 6 }).map(() => ({
                basic: Math.random() * 20 + 5,
                standard: Math.random() * 25 + 10,
                premium: Math.random() * 15 + 5,
                custom: Math.random() * 12 + 3
            }));
        } else if (trendPeriod === 'last_year') {
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            dataPoints = Array.from({ length: 12 }).map(() => ({
                basic: Math.random() * 20 + 5,
                standard: Math.random() * 25 + 10,
                premium: Math.random() * 15 + 5,
                custom: Math.random() * 12 + 3
            }));
        } else {
            labels = ['2023', '2024', '2025', '2026'];
            dataPoints = Array.from({ length: 4 }).map(() => ({
                basic: Math.random() * 30 + 15,
                standard: Math.random() * 40 + 20,
                premium: Math.random() * 25 + 10,
                custom: Math.random() * 20 + 8
            }));
        }

        return { labels, dataPoints };
    }, [trendPeriod]);

    return (
        <div className="pg-sold-photos">
            <TitleHeader
                variant="workspace"
                title="Sales"
                subtitle={null}
                rightContent={null}
            />

            <div className="pg-grey-section">
                <div className="pg-grey-section-inner">
                    <div className="container">

                        {/* Sales Trend Card */}
                        <div className="pg-trend-card">
                            <div className="pg-trend-header">
                                <div className="pg-trend-row">
                                    <div className="pg-trend-title">Sales trend</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {/* Chart Event Filter */}
                                        <div style={{ width: 200 }}>
                                            <ModernDropdown
                                                value={chartEventId}
                                                options={eventOptions}
                                                onChange={setChartEventId}
                                                label="Event"
                                                placeholder="All events"
                                                variant="pill"
                                            />
                                        </div>

                                        {/* Chart Period Filter */}
                                        <div style={{ width: 160 }}>
                                            <ModernDropdown
                                                value={trendPeriod}
                                                options={trendPeriodOptions}
                                                onChange={(val) => setTrendPeriod(val as any)}
                                                label="Period"
                                                variant="pill"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pg-trend-row">
                                    <div className="pg-stats-badges" style={{ gap: 8 }}>
                                        <div className="pg-badge-item published stacked">
                                            <span className="label">Published</span>
                                            <span className="value">596</span>
                                        </div>
                                        <div className="pg-badge-item sales stacked">
                                            <span className="label">Sales</span>
                                            <span className="value">74/745</span>
                                        </div>
                                        {isAdmin ? (
                                            <>
                                                <div className="pg-badge-item earnings stacked">
                                                    <span className="label">PG Earnings</span>
                                                    <span className="value">SEK {REVENUE.toLocaleString().replace(/,/g, ' ')}</span>
                                                </div>
                                                <div className="pg-badge-item earnings stacked" style={{ background: '#F5F3FF', color: '#5B21B6' }}>
                                                    <span className="label">Gallop Earnings</span>
                                                    <span className="value" style={{ color: '#7C3AED' }}>SEK {(REVENUE * 10).toLocaleString().replace(/,/g, ' ')}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="pg-badge-item earnings stacked">
                                                <span className="label">Earnings</span>
                                                <span className="value">SEK {REVENUE.toLocaleString().replace(/,/g, ' ')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pg-trend-legend">
                                        <div className="pg-legend-item">
                                            <div className="pg-legend-dot" style={{ background: BUNDLE_COLORS.basic }} />
                                            <span>Web</span>
                                        </div>
                                        <div className="pg-legend-item">
                                            <div className="pg-legend-dot" style={{ background: BUNDLE_COLORS.standard }} />
                                            <span>High</span>
                                        </div>
                                        <div className="pg-legend-item">
                                            <div className="pg-legend-dot" style={{ background: BUNDLE_COLORS.premium }} />
                                            <span>Commercial</span>
                                        </div>
                                        <div className="pg-legend-item">
                                            <div className="pg-legend-dot" style={{ background: BUNDLE_COLORS.custom }} />
                                            <span>Custom</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pg-trend-content">
                                <div className="pg-trend-chart">
                                    {graphData.dataPoints.map((point, i) => {
                                        const total = point.basic + point.standard + point.premium + point.custom;
                                        // Show label only for specific indices if too many bars
                                        const showLabel = trendPeriod === 'this_month' ? (i % 5 === 0) : true;
                                        const label = trendPeriod === 'this_month' ? (i + 1).toString() : graphData.labels[i];
                                        const isHovered = hoveredBarIndex === i;

                                        return (
                                            <div
                                                key={i}
                                                className="pg-chart-bar-wrapper"
                                                onMouseEnter={() => setHoveredBarIndex(i)}
                                                onMouseLeave={() => setHoveredBarIndex(null)}
                                            >
                                                <div className="pg-chart-bar-total">{Math.round(total)}</div>
                                                <div className="pg-chart-bar" style={{ height: `${total}%` }}>
                                                    <div className="pg-bar-segment" style={{ height: `${(point.custom / total) * 100}%`, background: BUNDLE_COLORS.custom }} />
                                                    <div className="pg-bar-segment" style={{ height: `${(point.premium / total) * 100}%`, background: BUNDLE_COLORS.premium }} />
                                                    <div className="pg-bar-segment" style={{ height: `${(point.standard / total) * 100}%`, background: BUNDLE_COLORS.standard }} />
                                                    <div className="pg-bar-segment" style={{ height: `${(point.basic / total) * 100}%`, background: BUNDLE_COLORS.basic }} />
                                                </div>
                                                {showLabel && <span className="pg-chart-label">{label}</span>}

                                                {isHovered && (
                                                    <div className="pg-chart-tooltip" style={{
                                                        bottom: '100%',
                                                        left: i > graphData.dataPoints.length / 2 ? 'auto' : '50%',
                                                        right: i > graphData.dataPoints.length / 2 ? '50%' : 'auto',
                                                        marginBottom: 12,
                                                        transform: i > graphData.dataPoints.length / 2 ? 'translateX(20%)' : 'translateX(-20%)'
                                                    }}>
                                                        <div className="tooltip-header">{label} Sales</div>
                                                        <div className="tooltip-row">
                                                            <div className="label"><div className="pg-legend-dot" style={{ background: BUNDLE_COLORS.basic }} />Web</div>
                                                            <div className="value">{Math.round(point.basic)}</div>
                                                        </div>
                                                        <div className="tooltip-row">
                                                            <div className="label"><div className="pg-legend-dot" style={{ background: BUNDLE_COLORS.standard }} />High</div>
                                                            <div className="value">{Math.round(point.standard)}</div>
                                                        </div>
                                                        <div className="tooltip-row">
                                                            <div className="label"><div className="pg-legend-dot" style={{ background: BUNDLE_COLORS.premium }} />Commercial</div>
                                                            <div className="value">{Math.round(point.premium)}</div>
                                                        </div>
                                                        <div className="tooltip-row">
                                                            <div className="label"><div className="pg-legend-dot" style={{ background: BUNDLE_COLORS.custom }} />Custom</div>
                                                            <div className="value">{Math.round(point.custom)}</div>
                                                        </div>
                                                        <div className="tooltip-footer">
                                                            <div className="tooltip-row" style={{ fontWeight: 700 }}>
                                                                <div className="label" style={{ color: '#111' }}>Total Sold</div>
                                                                <div className="value">{Math.round(total)}</div>
                                                            </div>
                                                            {isAdmin ? (
                                                                <>
                                                                    <div className="tooltip-row" style={{ marginTop: 4 }}>
                                                                        <div className="label">PG Earnings</div>
                                                                        <div className="value" style={{ color: '#166534' }}>SEK {Math.round(total * 450).toLocaleString()}</div>
                                                                    </div>
                                                                    <div className="tooltip-row" style={{ marginTop: 2 }}>
                                                                        <div className="label">Gallop Earnings</div>
                                                                        <div className="value" style={{ color: '#7C3AED' }}>SEK {Math.round(total * 4500).toLocaleString()}</div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="tooltip-row" style={{ marginTop: 4 }}>
                                                                    <div className="label">Earnings</div>
                                                                    <div className="value" style={{ color: '#166534' }}>SEK {Math.round(total * 450).toLocaleString()}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="pg-section-separator" />

                        {/* Filters Row */}
                        <div className="filters-wrapper">
                            <div className="filter-container">
                                <div className="filter-group">
                                    <ModernDropdown
                                        value={selectedEventId}
                                        options={eventOptions}
                                        onChange={setSelectedEventId}
                                        label="Event"
                                        placeholder="Event"
                                        variant="pill"
                                    />
                                    <ModernDropdown
                                        value={selectedBundleId}
                                        options={bundleOptions}
                                        onChange={setSelectedBundleId}
                                        label="Bundle"
                                        placeholder="Bundle"
                                        variant="pill"
                                        icon={bundleOptions.find(o => o.value === selectedBundleId)?.icon}
                                    />
                                    <button
                                        className="filter-reset-btn"
                                        onClick={() => {
                                            setSelectedEventId('all');
                                            setSelectedBundleId('all');
                                            setSearchQuery('');
                                        }}
                                        title="Reset filters"
                                        disabled={isResetDisabled}
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                </div>

                                <div className="search-group">
                                    <ScopedSearchBar
                                        currentValue={searchQuery}
                                        onSearchChange={setSearchQuery}
                                        onSelect={setSearchQuery}
                                        placeholder="Search photo ID or client email..."
                                        options={searchOptions}
                                    />
                                </div>

                                <div className="pg-sales-filter-right">
                                    <div className="filter-results-count">
                                        Showing {filteredPhotos.length}
                                    </div>

                                    <div className="pg-view-actions">
                                        <div className="pg-view-separator" />
                                        <div className="pg-view-switcher">
                                            <button
                                                className={`pg-view-btn ${viewMode === 'card' ? 'active' : ''}`}
                                                onClick={() => setViewMode('card')}
                                                aria-label="Card view"
                                            >
                                                <LayoutGrid size={16} />
                                            </button>
                                            <button
                                                className={`pg-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                                onClick={() => setViewMode('grid')}
                                                aria-label="List view"
                                            >
                                                <List size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {filteredPhotos.length > 0 ? (
                            viewMode === 'card' ? (
                                <MasonryGrid isLoading={false}>
                                    {filteredPhotos.map(photo => (
                                        <div key={photo.id} className="pg-photo-card-wrapper">
                                            <PhotoCard
                                                photo={mapToUiPhoto(photo)}
                                                onClick={(p: any) => setPreviewPhoto(p)}
                                                variant="pgPublished"
                                                selectable={false}
                                                showEdit={false}
                                                onRemove={() => {
                                                    setConfirmModal({
                                                        isOpen: true,
                                                        photoId: photo.id,
                                                        photoCode: photo.photoCode || `#M-0-${photo.id.slice(0, 8).toUpperCase()}`
                                                    });
                                                }}
                                                pgMeta={{
                                                    fileName: photo.fileName,
                                                    photoCode: photo.photoCode || `#M-0-${photo.id.slice(0, 8).toUpperCase()}`,
                                                    soldCount: photo.soldCount,
                                                    priceStandard: photo.priceStandard,
                                                    priceHigh: photo.priceHigh,
                                                    priceCommercial: photo.priceCommercial
                                                }}
                                            />
                                        </div>
                                    ))}
                                </MasonryGrid>
                            ) : (
                                <div className="pg-grid-view-card">
                                    <table className="pg-sales-table">
                                        <thead>
                                            <tr>
                                                <th>Photo</th>
                                                <th>Photo ID</th>
                                                <th>Date / Time</th>
                                                <th>Event</th>
                                                <th>Client Info</th>
                                                <th>Bundle</th>
                                                <th style={{ textAlign: 'center' }}>Count</th>
                                                <th>Download Link</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPhotos.map(photo => {
                                                const event = events.find(e => e.id === photo.eventId);
                                                const photoIdDisplay = photo.photoCode || `#M-0-${photo.id.slice(0, 8).toUpperCase()}`;
                                                const clientEmail = (photo as any).clientEmail;
                                                const downloadLink = `gallopics.com/dl/${photo.photoCode || photo.id.slice(0, 8)}...`;
                                                const eventTitle = event?.title || 'Unknown Event';

                                                return (
                                                    <tr key={photo.id}>
                                                        <td>
                                                            <img
                                                                src={photo.url}
                                                                className="pg-table-thumb"
                                                                alt=""
                                                                onClick={() => setPreviewPhoto(mapToUiPhoto(photo))}
                                                            />
                                                        </td>
                                                        <td title={photoIdDisplay}>
                                                            <div className="truncate-cell-content" style={{ fontWeight: 600, color: '#111' }}>{photoIdDisplay}</div>
                                                            {photo.fileName && <div className="truncate-cell-content" style={{ fontSize: '0.75rem', color: '#666' }}>{photo.fileName}</div>}
                                                        </td>
                                                        <td title={`${photo.uploadDate} ${photo.timestamp || '14:20'}`}>
                                                            <div className="truncate-cell-content" style={{ fontWeight: 500 }}>{photo.uploadDate}</div>
                                                            <div className="truncate-cell-content" style={{ fontSize: '0.75rem', color: '#666' }}>{photo.timestamp || '14:20'}</div>
                                                        </td>
                                                        <td title={eventTitle}>
                                                            <div className="truncate-cell-content">
                                                                <a
                                                                    href={`${basePath}/events/${photo.eventId}`}
                                                                    className="pg-table-event-link"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        navigate(`${basePath}/events/${photo.eventId}`);
                                                                    }}
                                                                >
                                                                    {eventTitle}
                                                                </a>
                                                            </div>
                                                        </td>
                                                        <td title={clientEmail}>
                                                            <div className="truncate-cell-content" style={{ color: '#475569' }}>{clientEmail}</div>
                                                        </td>
                                                        <td title={getBundleLabel(photo.id)}>
                                                            <div className="pg-bundle-tag">
                                                                <div className="pg-bundle-dot" style={{ background: getBundleColor(photo.id) }} />
                                                                <span className="truncate-cell-content">{getBundleLabel(photo.id)}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <div style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
                                                                <div className="pg-sold-badge">{photo.soldCount || 1}</div>
                                                            </div>
                                                        </td>
                                                        <td title={`https://gallopics.com/dl/${photo.photoCode || photo.id.slice(0, 8)}`}>
                                                            <a href="#" className="pg-download-link" onClick={(e) => e.preventDefault()}>
                                                                {downloadLink}
                                                            </a>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button
                                                                className="pg-table-action-icon delete-action"
                                                                title="Unpublish"
                                                                onClick={() => {
                                                                    setConfirmModal({
                                                                        isOpen: true,
                                                                        photoId: photo.id,
                                                                        photoCode: photoIdDisplay
                                                                    });
                                                                }}
                                                            >
                                                                <RotateCcw size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            <div className="pg-empty-state" style={{ padding: '80px 20px' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: '#f0fdf4',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    <DollarSign size={32} color="#10b981" />
                                </div>
                                <h3 style={{ margin: '0 0 8px 0' }}>{allSoldPhotos.length === 0 ? "No sales yet" : "No results found"}</h3>
                                <p style={{ color: '#666', margin: 0 }}>
                                    {allSoldPhotos.length === 0
                                        ? "Your sold photos will appear here once customers make a purchase."
                                        : "Try adjusting your filters to find what you're looking for."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewPhoto && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }} onClick={() => setPreviewPhoto(null)}>
                    <img src={previewPhoto.src} alt="" style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: 4, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()} />
                    <button style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: 44, height: 44, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: 'background 0.2s' }} onClick={() => setPreviewPhoto(null)}>
                        <X size={24} />
                    </button>
                </div>
            )}
            {/* Unpublish Confirmation Modal */}
            {confirmModal && confirmModal.isOpen && (
                <div className="pg-modal-overlay">
                    <div className="pg-modal-card">
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{ minWidth: 40, height: 40, borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <AlertCircle size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 700, color: '#111', marginBottom: 8 }}>
                                    Unpublish photo?
                                </h3>
                                <p style={{ margin: '0 0 24px', color: '#666', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                                    This will move photo <strong>{confirmModal.photoCode}</strong> to the Archive tab. You can undo this action later from the event details page.
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
                                    console.log('Unpublishing photo:', confirmModal.photoId);
                                    setConfirmModal(null);
                                }}
                            >
                                Unpublish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

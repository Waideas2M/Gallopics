import React from 'react';
import { X, Clock, DollarSign, Calendar, MapPin, User, Hash } from 'lucide-react';
import './PgSelectionPanel.css'; // Reuse base styles
import { type Photo } from '../../context/PhotographerContext';

interface PgSalesPanelProps {
    isOpen: boolean;
    selectedIds: Set<string>;
    allPhotos: Photo[];
    onClose: () => void;
}

export const PgSalesPanel: React.FC<PgSalesPanelProps> = ({
    isOpen,
    selectedIds,
    allPhotos,
    onClose
}) => {
    const selectedPhotos = allPhotos.filter(p => selectedIds.has(p.id));
    const isSingle = selectedPhotos.length === 1;
    const count = selectedPhotos.length;
    const firstPhoto = selectedPhotos[0];

    if (!isOpen) return null;

    return (
        <div className={`pg-selection-panel ${isOpen ? 'is-open' : ''}`}>
            <div className="pg-panel-header">
                <span className="pg-panel-title">Sale details</span>
                <button className="pg-panel-close" onClick={onClose} title="Close">
                    <X size={20} />
                </button>
            </div>

            <div className="pg-panel-scroll-area">
                {!isSingle && count > 0 && (
                    <div className="pg-panel-section">
                        <div className="pg-panel-label" style={{ marginBottom: 16 }}>Multiple selection ({count})</div>
                        <div style={{ padding: '24px', textAlign: 'center', background: '#f9f9f9', borderRadius: '12px', border: '1px dashed #ddd' }}>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Details for multiple items will appear here.</p>
                        </div>
                    </div>
                )}

                {isSingle && firstPhoto && (
                    <>
                        <div className="pg-panel-meta-block">
                            <img src={firstPhoto.url} alt="" className="pg-panel-thumb" />
                            <div className="pg-meta-info">
                                <div className="pg-meta-filename" title={firstPhoto.fileName}>{firstPhoto.fileName}</div>
                                <div className="pg-meta-id">{firstPhoto.photoCode || firstPhoto.id}</div>
                                <div className="pg-meta-date">
                                    <Clock size={14} />
                                    <span>{firstPhoto.uploadDate} • {firstPhoto.timestamp}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pg-panel-section">
                            <div className="pg-panel-label">Sale Info</div>
                            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#16a34a' }}>Sold {firstPhoto.soldCount} time{firstPhoto.soldCount > 1 ? 's' : ''}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#15803d' }}>Last purchased: Yesterday</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pg-panel-label">Details</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                                    <User size={16} />
                                    <span>Rider: <b>{firstPhoto.rider || 'None'}</b></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                                    <Hash size={16} />
                                    <span>Horse: <b>{firstPhoto.horse || 'None'}</b></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                                    <Calendar size={16} />
                                    <span>Event: <b>{firstPhoto.eventId}</b></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                                    <MapPin size={16} />
                                    <span>Location: <b>{firstPhoto.storedLocation || 'Main Arena'}</b></span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {count === 0 && (
                    <div style={{ padding: '80px 24px', textAlign: 'center', color: '#999' }}>
                        <p>Select a photo to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

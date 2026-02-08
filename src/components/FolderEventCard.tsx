import { useNavigate } from 'react-router-dom';
import type { EventData } from '../data/mockEvents';

import './FolderEventCard.css';

interface FolderEventCardProps {
    event: EventData;
    onClick: (id: string) => void;
    forceDisabled?: boolean; // New prop to force disabled state
}

export const FolderEventCard: React.FC<FolderEventCardProps> = ({ event, onClick, forceDisabled }) => {
    const navigate = useNavigate();

    const isDisabled = forceDisabled || event.status === 'disabled';

    // Live Logic: Check if today is within event.period
    const isLive = (() => {
        try {
            const todayMock = new Date('2026-01-21T00:00:00');
            const currentYear = todayMock.getFullYear();
            const parts = event.period.split('–').map(s => s.trim());

            let start, end;
            if (parts.length === 2) {
                let startStr = parts[0];
                let endStr = parts[1];
                if (!startStr.match(/\d{4}/)) startStr += ` ${currentYear}`;
                if (!endStr.match(/\d{4}/)) endStr += ` ${currentYear}`;

                start = new Date(startStr);
                end = new Date(endStr);
            } else {
                let dateStr = parts[0];
                if (!dateStr.match(/\d{4}/)) dateStr += ` ${currentYear}`;
                start = new Date(dateStr);
                end = new Date(dateStr);
            }

            // Normalize times
            const TODAY = new Date(todayMock);
            TODAY.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            return TODAY.getTime() >= start.getTime() && TODAY.getTime() <= end.getTime();
        } catch (e) {
            return false;
        }
    })();


    return (
        <div
            className={`folder-card ${isDisabled ? 'disabled' : ''}`}
            onClick={() => !isDisabled && onClick(event.id)}
            tabIndex={isDisabled ? -1 : 0}
            title={isDisabled ? "Not available" : ""}
            style={isDisabled ? { opacity: 0.6, cursor: 'not-allowed', filter: 'grayscale(100%)' } : {}}
        >
            <div className="folder-inner">
                {/* Cover Area inside padding - Hide if disabled */}
                {!isDisabled && (
                    <div className="folder-cover">
                        <img
                            src={event.coverImage}
                            alt={event.name}
                            className="folder-img"
                            loading="lazy"
                        />
                        {isLive && (
                            <span className="live-badge" style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: '#FF0000',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                zIndex: 10
                            }}>
                                Live
                            </span>
                        )}
                    </div>
                )}

                {/* Info Panel - Compact if disabled (no cover above means it naturally shrinks, but maybe less padding?) */}
                {/* 
                   If forced disabled (Scheduled), we might want a label.
                   Prompt: "Render all Scheduled results as disabled folders: compact (no cover), 'Scheduled' or 'Not available yet' label" 
                */}
                <div className="folder-info" style={isDisabled ? { paddingTop: '0' } : {}}>
                    {/* Header Block: Avatar + (Title/Period) */}
                    <div className="folder-header-block">
                        {/* Event Avatar - Hide if disabled? Or keep? Prompt implies compact. Let's keep avatar but greyscale handled by wrapper. */}
                        <img src={event.logo} alt="" className="folder-event-avatar" />

                        <div className="folder-header-text">
                            <h3 className="folder-title">{event.name}</h3>
                            <span className="folder-period">{event.period}</span>
                            {/* Or show a label? The period is good info for scheduled. Let's stick to period unless user wants overwrite.
                                Prompt says: "Scheduled" or "Not available yet" label. 
                                Let's add a small label above title or replace period? 
                                Let's keep period (useful for scheduled) and add a label if space permits, or maybe just tooltip "Not available".
                                Re-reading: "Render all Scheduled results as disabled folders:... 'Scheduled' or 'Not available yet' label"
                                Let's use the title HTML attribute "Not available" (already done) and maybe a badge?
                                The prompt says "compact card (no cover) ... 'Scheduled' label".
                                Since we hide cover, maybe we can add a text label in the header or just trust the visual style.
                                Let's add a small text label if disabled.
                             */}
                            {isDisabled && <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#999', display: 'block' }}>Not available yet</span>}
                        </div>
                    </div>

                    {/* Bottom Row: Location + Count + Avatar */}
                    <div className="folder-bottom-row">
                        <div className="folder-location">
                            <span className="flag">{event.flag}</span>
                            <span className="city">{event.city}</span>
                        </div>

                        <div className="folder-stats-right">
                            {!isDisabled && event.photoCount && (
                                <span className="folder-photo-count">{event.photoCount} photos</span>
                            )}
                            {/* Photographer Avatar */}
                            {event.photographer && (
                                <img
                                    src={event.photographer.avatar}
                                    alt={event.photographer.name}
                                    className="folder-photographer-avatar"
                                    title={`Photo: ${event.photographer.name}`}
                                    style={{ cursor: 'pointer', pointerEvents: 'auto' }} // Ensure active click
                                    onClick={(e) => {
                                        if (!event.photographer) return;
                                        e.stopPropagation();
                                        navigate(`/photographer/${event.photographer.id}`);
                                    }}
                                    onError={(e) => {
                                        if (event.photographer) {
                                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + event.photographer.name;
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

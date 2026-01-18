import { useNavigate } from 'react-router-dom';
import type { EventData } from '../data/mockEvents';
import './FolderEventCard.css';

interface FolderEventCardProps {
    event: EventData;
    onClick: (id: string) => void;
}

export const FolderEventCard: React.FC<FolderEventCardProps> = ({ event, onClick }) => {
    const navigate = useNavigate();
    return (
        <div className="folder-card" onClick={() => onClick(event.id)} tabIndex={0}>
            <div className="folder-inner">
                {/* Cover Area inside padding */}
                <div className="folder-cover">
                    <img src={event.coverImage} alt={event.name} className="folder-img" loading="lazy" />
                </div>

                {/* Info Panel */}
                <div className="folder-info">
                    {/* Header Block: Avatar + (Title/Period) */}
                    <div className="folder-header-block">
                        {/* Event Avatar */}
                        <img src={event.logo} alt="" className="folder-event-avatar" />

                        <div className="folder-header-text">
                            <h3 className="folder-title">{event.name}</h3>
                            <span className="folder-period">{event.period}</span>
                        </div>
                    </div>

                    {/* Bottom Row: Location + Count + Avatar */}
                    <div className="folder-bottom-row">
                        <div className="folder-location">
                            <span className="flag">{event.flag}</span>
                            <span className="city">{event.city}</span>
                        </div>

                        <div className="folder-stats-right">
                            {event.photoCount && (
                                <span className="folder-photo-count">{event.photoCount} photos</span>
                            )}
                            {/* Photographer Avatar */}
                            {event.photographer && (
                                <img
                                    src={event.photographer.avatar}
                                    alt={event.photographer.name}
                                    className="folder-photographer-avatar"
                                    title={`Photo: ${event.photographer.name}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/photographer/${event.photographer.id}`);
                                    }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + event.photographer.name;
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

import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { TitleHeader } from '../components/TitleHeader';
import { Footer } from '../components/Footer';
import { EventBrowseFilter } from '../components/EventBrowseFilter';
import { FolderEventCard } from '../components/FolderEventCard';
import { mockEvents } from '../data/mockEvents';
import { useNavigate } from 'react-router-dom';

import { BenefitsSection } from '../components/BenefitsSection';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function EventsPage() {
    const navigate = useNavigate();

    // Intro Collapse State (Session Persistence)
    const [isIntroCollapsed, setIsIntroCollapsed] = useState(() => {
        const saved = sessionStorage.getItem('ehome_intro_collapsed');
        return saved === 'true';
    });

    const toggleIntro = () => {
        const newState = !isIntroCollapsed;
        setIsIntroCollapsed(newState);
        sessionStorage.setItem('ehome_intro_collapsed', newState.toString());
    };

    // Filters States
    const [country, setCountry] = useState('Sweden');
    const [city, setCity] = useState('All');
    const [discipline, setDiscipline] = useState('Any');

    // Filter Logic
    const filteredEvents = useMemo(() => {
        return mockEvents.filter(event => {
            const matchCountry = event.country === country || country === 'all';
            const matchCity = city === 'All' || city === 'all' || event.city === city;
            const matchDiscipline = discipline === 'Any' || discipline === 'all' || event.discipline === discipline;
            return matchCountry && matchCity && matchDiscipline;
        });
    }, [country, city, discipline]);

    const handleFilterChange = (key: 'country' | 'city' | 'discipline', value: string) => {
        if (key === 'country') setCountry(value);
        if (key === 'city') setCity(value);
        if (key === 'discipline') setDiscipline(value);
    };

    return (
        <div className="page-wrapper ehome-page">
            <Header />

            <div className={`ehome-intro-collapsible ${isIntroCollapsed ? 'collapsed' : ''}`}>
                <div className="ehome-intro-inner">
                    <TitleHeader
                        title={<>Your best moments,<br />captured</>}
                        description="We capture horse competitions across Sweden. Search your event, spot your photos, and purchase your favorites."
                        variant="ehome" // Added variant
                    />
                    <BenefitsSection />
                </div>
            </div>

            <div className="container">
                <div className="ehome-intro-toggle-wrapper">
                    <div className="ehome-divider"></div>
                    <button className="ehome-intro-toggle" onClick={toggleIntro} aria-label={isIntroCollapsed ? 'Show' : 'Hide'}>
                        {isIntroCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                </div>
            </div>

            <section className="grid-section">
                <div className="container">
                    <h2 className="section-title">Browse events</h2>
                    <div className="filters-wrapper">
                        <EventBrowseFilter
                            country={country}
                            city={city}
                            discipline={discipline}
                            onFilterChange={handleFilterChange}
                            isSticky={false}
                            resultsCount={filteredEvents.length}
                        />
                    </div>

                    <div className="events-folders-grid">
                        {filteredEvents.map(event => (
                            <FolderEventCard
                                key={event.id}
                                event={event}
                                onClick={(id) => navigate(`/event/${id}`)}
                            />
                        ))}
                    </div>
                </div>
            </section>
            <Footer minimal={false} />
        </div>
    );
}

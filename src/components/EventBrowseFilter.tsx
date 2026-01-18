import { RotateCcw } from 'lucide-react';
import { ModernDropdown } from './ModernDropdown';

interface EventBrowseFilterProps {
    country: string;
    city: string;
    discipline: string;
    onFilterChange: (type: 'country' | 'city' | 'discipline', value: string) => void;
    isSticky: boolean;
    resultsCount: number;
}

export const EventBrowseFilter: React.FC<EventBrowseFilterProps> = ({
    country,
    city,
    discipline,
    onFilterChange,
    isSticky,
    resultsCount
}) => {

    // Options Data (Ideally could come from props/global data, but hardcoded here as per original file)
    const countryOptions = [
        { label: 'All Countries', value: 'all', icon: '🌍' },
        { label: 'Sweden', value: 'Sweden', icon: '🇸🇪' },
        { label: 'Norway', value: 'Norway', icon: '🇳🇴' },
        { label: 'Denmark', value: 'Denmark', icon: '🇩🇰' },
        { label: 'Finland', value: 'Finland', icon: '🇫🇮' },
        { label: 'Germany', value: 'Germany', icon: '🇩🇪' },
        { label: 'France', value: 'France', icon: '🇫🇷' },
        { label: 'Netherlands', value: 'Netherlands', icon: '🇳🇱' },
    ];

    const cityOptions = [
        { label: 'All Cities', value: 'all' },
        { label: 'Stockholm', value: 'Stockholm' },
        { label: 'Gothenburg', value: 'Gothenburg' },
        { label: 'Falsterbo', value: 'Falsterbo' },
        { label: 'Uppsala', value: 'Uppsala' },
        { label: 'Malmö', value: 'Malmö' },
    ];

    const disciplineOptions = [
        { label: 'All Disciplines', value: 'all' },
        { label: 'Show Jumping', value: 'Show Jumping' },
        { label: 'Dressage', value: 'Dressage' },
        { label: 'Eventing', value: 'Eventing' },
    ];

    const isResetDisabled = country === 'all' && city === 'all' && discipline === 'all';

    return (
        <div className={`event-browse-filter ${isSticky ? 'sticky-glass' : ''}`}>
            <div className="filter-row">
                <div className="filter-group">
                    <ModernDropdown
                        value={country}
                        options={countryOptions}
                        onChange={(val) => onFilterChange('country', val)}
                        icon="🇸🇪" // Or dynamic based on selection, but user req "flag + label"
                        placeholder="Country"
                        label="Country"
                    />

                    <ModernDropdown
                        value={city}
                        options={cityOptions}
                        onChange={(val) => onFilterChange('city', val)}
                        placeholder="City"
                        label="City"
                    />

                    <ModernDropdown
                        value={discipline}
                        options={disciplineOptions}
                        onChange={(val) => onFilterChange('discipline', val)}
                        placeholder="Discipline"
                        label="Discipline"
                    />

                    <button
                        className="filter-reset-btn"
                        onClick={() => {
                            onFilterChange('country', 'all');
                            onFilterChange('city', 'all');
                            onFilterChange('discipline', 'all');
                        }}
                        title="Reset filters"
                        disabled={isResetDisabled}
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>

                <div className="filter-results-count">
                    Showing {resultsCount} events
                </div>
            </div>
        </div>
    );
};

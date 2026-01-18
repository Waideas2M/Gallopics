import { COMPETITIONS, PHOTOGRAPHERS } from './mockData';

export interface EventData {
    id: string;
    name: string;
    coverImage: string;
    period: string; // e.g., "12 Jun – 14 Jun 2026"
    flag: string; // Emoji
    city: string;
    discipline: string;
    country: string; // For filtering (e.g., "Sweden")
    photoCount?: number;
    logo: string; // New field for Event Avatar
    photographer: {
        id: string;
        name: string;
        avatar: string;
    };
}

// Config mapping for visual assets that aren't in the raw data
// cover: Random/Specific high quality Horse Photo
// logo: Specific Event Image/Logo from file list
const EVENT_ASSETS: Record<string, { cover: string; logo: string; count: number }> = {
    c1: {
        cover: '/images/Abdel_Said_Arpege_du_RU5978.jpg',
        logo: '/images/Sweden International Horse Show.jpg',
        count: 145
    },
    c2: {
        cover: '/images/Alice_Nilsson_Eunomia8286.jpg',
        logo: '/images/Gothenburg Indoor Masters.jpg',
        count: 192
    },
    c3: {
        cover: '/images/Falsterbo7800.jpg',
        logo: '/images/Falsterbo Summer Classic.jpg',
        count: 168
    },
    c4: {
        cover: '/images/Peder_Fredricson_Alcapone_des_Carmille8136.jpg',
        logo: '/images/Strömsholm Spring Dressage.jpg',
        count: 156
    },
    c5: {
        cover: '/images/Anna_Svanberg_Vidar9116.jpg',
        logo: '/images/Uppsala Arena Cup.jpg',
        count: 130
    },
    c6: {
        cover: '/images/Fredrik_Spetz_Galactee_de_Tivoli8292.jpg',
        logo: '/images/Malmö City Jumping.jpg',
        count: 120
    },
    c7: {
        cover: '/images/Alma_Nilsson_Sall_Kilimanjaro_WV7865.jpg',
        logo: '/images/Linköping Eventing Weekend.jpg',
        count: 175
    },
    c8: {
        cover: '/images/Felicia_Hultberg_Bollerup_Chiquelle8407.jpg',
        logo: '/images/Örebro Autumn Cup.jpg',
        count: 90
    },
    c9: {
        cover: '/images/Amanda_Landeblad_Joelina6763.jpg',
        logo: '/images/Umeå Northern Lights Dressage.jpg',
        count: 180
    },
    c10: {
        cover: '/images/Carl-Walter_Fox_Eka_First_Navy_Jack8998.jpg',
        logo: '/images/Jönköping Lake District Classic.jpg',
        count: 110
    },
};

// Helper: Format date range
function formatPeriod(start: string, end?: string): string {
    // start: YYYY-MM-DD
    const sDate = new Date(start);
    const eDate = end ? new Date(end) : null;

    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    const sStr = sDate.toLocaleDateString('en-GB', options);

    if (eDate) {
        const eStr = eDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        return `${sStr} – ${eStr}`;
    }
    return `${sStr} ${sDate.getFullYear()}`;
}

export const mockEvents: EventData[] = COMPETITIONS.map(comp => {
    // Find assigned photographer
    // Logic: pX assigned to cX
    const photographer = PHOTOGRAPHERS.find(p => p.primaryEventId === comp.id) || PHOTOGRAPHERS[0];
    const assets = EVENT_ASSETS[comp.id] || EVENT_ASSETS['c1'];

    return {
        id: comp.id,
        name: comp.name,
        coverImage: assets.cover,
        period: formatPeriod(comp.date, comp.endDate),
        flag: '🇸🇪', // Everyone is Sweden per request
        city: comp.city,
        discipline: comp.discipline || 'Show Jumping',
        country: comp.country,
        photoCount: assets.count,
        logo: assets.logo,
        photographer: {
            id: photographer.id,
            name: `${photographer.firstName} ${photographer.lastName}`,
            avatar: `/images/${photographer.firstName} ${photographer.lastName}.jpg` // Maps to real files e.g. "Hanna Björk.jpg"
        }
    };
});

import type { Photo } from '../types';

// --- USER PROVIDED MOCK DATA (Synced 2026-01-17) ---

export const RIDERS = [
    { "id": "r1", "firstName": "Ebba", "lastName": "Lindström", "gender": "F", "countryCode": "SE" },
    { "id": "r2", "firstName": "Maja", "lastName": "Sjöberg", "gender": "F", "countryCode": "SE" },
    { "id": "r3", "firstName": "Alva", "lastName": "Karlsson", "gender": "F", "countryCode": "SE" },
    { "id": "r4", "firstName": "Nora", "lastName": "Bergqvist", "gender": "F", "countryCode": "SE" },
    { "id": "r5", "firstName": "Elsa", "lastName": "Håkansson", "gender": "F", "countryCode": "SE" },
    { "id": "r6", "firstName": "Signe", "lastName": "Jonsson", "gender": "F", "countryCode": "SE" },
    { "id": "r7", "firstName": "Freja", "lastName": "Nyström", "gender": "F", "countryCode": "SE" },
    { "id": "r8", "firstName": "Linnea", "lastName": "Ek", "gender": "F", "countryCode": "SE" },
    { "id": "r9", "firstName": "Oskar", "lastName": "Wallin", "gender": "M", "countryCode": "SE" },
    { "id": "r10", "firstName": "Viktor", "lastName": "Sundberg", "gender": "M", "countryCode": "SE" }
];

export const PHOTOGRAPHERS = [
    { "id": "p1", "firstName": "Hanna", "lastName": "Björk", "gender": "F", "countryCode": "SE", "primaryEventId": "c1" },
    { "id": "p2", "firstName": "Klara", "lastName": "Fors", "gender": "F", "countryCode": "SE", "primaryEventId": "c2" },
    { "id": "p3", "firstName": "Ida", "lastName": "Holmgren", "gender": "F", "countryCode": "SE", "primaryEventId": "c3" },
    { "id": "p4", "firstName": "Tove", "lastName": "Lund", "gender": "F", "countryCode": "SE", "primaryEventId": "c4" },
    { "id": "p5", "firstName": "Sara", "lastName": "Engström", "gender": "F", "countryCode": "SE", "primaryEventId": "c5" },
    { "id": "p6", "firstName": "Johan", "lastName": "Lindahl", "gender": "M", "countryCode": "SE", "primaryEventId": "c6" },
    { "id": "p7", "firstName": "Erik", "lastName": "Nyberg", "gender": "M", "countryCode": "SE", "primaryEventId": "c7" },
    { "id": "p8", "firstName": "Mattias", "lastName": "Berg", "gender": "M", "countryCode": "SE", "primaryEventId": "c8" },
    { "id": "p9", "firstName": "Daniel", "lastName": "Söder", "gender": "M", "countryCode": "SE", "primaryEventId": "c9" },
    { "id": "p10", "firstName": "Per", "lastName": "Hedman", "gender": "M", "countryCode": "SE", "primaryEventId": "c10" }
];

export const HORSES = [
    { "id": "h1", "name": "Nordic Aurora", "registeredName": "Nordic Aurora" },
    { "id": "h2", "name": "Silver Tindra", "registeredName": "Silver Tindra" },
    { "id": "h3", "name": "Stormvind", "registeredName": "Stormvind" },
    { "id": "h4", "name": "Midnight Saga", "registeredName": "Midnight Saga" },
    { "id": "h5", "name": "Lilla Fjord", "registeredName": "Lilla Fjord" },
    { "id": "h6", "name": "Valhalla Rune", "registeredName": "Valhalla Rune" },
    { "id": "h7", "name": "Skärgårdsprins", "registeredName": "Skärgårdsprins" },
    { "id": "h8", "name": "Göta Glimt", "registeredName": "Göta Glimt" },
    { "id": "h9", "name": "Björkdal Brave", "registeredName": "Björkdal Brave" },
    { "id": "h10", "name": "Frost Nova", "registeredName": "Frost Nova" }
];

export const COMPETITIONS = [
    { "id": "c1", "name": "Sweden International Horse Show", "country": "Sweden", "countryCode": "SE", "city": "Stockholm", "discipline": "Show Jumping", "date": "2026-11-26", "endDate": "2026-11-30" },
    { "id": "c2", "name": "Gothenburg Indoor Masters", "country": "Sweden", "countryCode": "SE", "city": "Göteborg", "discipline": "Show Jumping", "date": "2026-02-19", "endDate": "2026-02-22" },
    { "id": "c3", "name": "Falsterbo Summer Classic", "country": "Sweden", "countryCode": "SE", "city": "Falsterbo", "discipline": "Show Jumping", "date": "2026-07-11", "endDate": "2026-07-19" },
    { "id": "c4", "name": "Strömsholm Spring Dressage", "country": "Sweden", "countryCode": "SE", "city": "Strömsholm", "discipline": "Dressage", "date": "2026-05-08", "endDate": "2026-05-10" },
    { "id": "c5", "name": "Uppsala Arena Cup", "country": "Sweden", "countryCode": "SE", "city": "Uppsala", "discipline": "Show Jumping", "date": "2026-03-14", "endDate": "2026-03-15" },
    { "id": "c6", "name": "Malmö City Jumping", "country": "Sweden", "countryCode": "SE", "city": "Malmö", "discipline": "Show Jumping", "date": "2026-04-25", "endDate": "2026-04-26" },
    { "id": "c7", "name": "Linköping Eventing Weekend", "country": "Sweden", "countryCode": "SE", "city": "Linköping", "discipline": "Eventing", "date": "2026-09-05", "endDate": "2026-09-06" },
    { "id": "c8", "name": "Örebro Autumn Cup", "country": "Sweden", "countryCode": "SE", "city": "Örebro", "discipline": "Show Jumping", "date": "2026-10-10", "endDate": "2026-10-11" },
    { "id": "c9", "name": "Umeå Northern Lights Dressage", "country": "Sweden", "countryCode": "SE", "city": "Umeå", "discipline": "Dressage", "date": "2026-01-31", "endDate": "2026-02-01" },
    { "id": "c10", "name": "Jönköping Lake District Classic", "country": "Sweden", "countryCode": "SE", "city": "Jönköping", "discipline": "Show Jumping", "date": "2026-06-12", "endDate": "2026-06-14" }
];

// Explicit Associations for Search/Profile logic
export const RIDER_PRIMARY_HORSE = [
    { "riderId": "r1", "primaryHorseId": "h9" },
    { "riderId": "r2", "primaryHorseId": "h4" },
    { "riderId": "r3", "primaryHorseId": "h8" },
    { "riderId": "r4", "primaryHorseId": "h1" },
    { "riderId": "r5", "primaryHorseId": "h10" },
    { "riderId": "r6", "primaryHorseId": "h2" },
    { "riderId": "r7", "primaryHorseId": "h6" },
    { "riderId": "r8", "primaryHorseId": "h7" },
    { "riderId": "r9", "primaryHorseId": "h5" },
    { "riderId": "r10", "primaryHorseId": "h3" }
];

export const HORSE_PRIMARY_RIDER = [
    { "horseId": "h9", "primaryRiderId": "r1" },
    { "horseId": "h4", "primaryRiderId": "r2" },
    { "horseId": "h8", "primaryRiderId": "r3" },
    { "horseId": "h1", "primaryRiderId": "r4" },
    { "horseId": "h10", "primaryRiderId": "r5" },
    { "horseId": "h2", "primaryRiderId": "r6" },
    { "horseId": "h6", "primaryRiderId": "r7" },
    { "horseId": "h7", "primaryRiderId": "r8" },
    { "horseId": "h5", "primaryRiderId": "r9" },
    { "horseId": "h3", "primaryRiderId": "r10" }
];

// Mapping Rule derived from PrimaryEventId in Photographer
const PHOTOGRAPHER_EVENT_MAP: Record<string, string> = {
    "p1": "c1", "p2": "c2", "p3": "c3", "p4": "c4", "p5": "c5",
    "p6": "c6", "p7": "c7", "p8": "c8", "p9": "c9", "p10": "c10"
};

const DUMMY_EVENTS = [
    { id: 'd1', name: "Club Series" },
    { id: 'd2', name: "Indoor Tour" },
    { id: 'd3', name: "Weekend Cup" }
];

// Helper
export const getActivePhotographerProfile = (photographerId: string = "p1") => {
    const photographer = PHOTOGRAPHERS.find(p => p.id === photographerId) || PHOTOGRAPHERS[0];
    const compId = PHOTOGRAPHER_EVENT_MAP[photographer.id] || photographer.primaryEventId;
    const realCompetition = COMPETITIONS.find(c => c.id === compId) || COMPETITIONS[0];

    return {
        photographer,
        primaryEvent: realCompetition,
        dummyEvents: DUMMY_EVENTS
    };
};

// --- REAL ASSETS (Web Safe) ---
const filenames = [
    "Abdel_Said_Arpege_du_RU5978.jpg",
    "Alice_Nilsson_Eunomia8286.jpg",
    "Alicia_Svensson_Filourado_PS8003.jpg",
    "Alma_Nilsson_Sall_Kilimanjaro_WV7865.jpg",
    "Amanda_Landeblad_Joelina6763.jpg",
    "Amanda_Landeblad_Little_Clara9952.jpg",
    "Amanda_Thagesson_Hop_Living8848.jpg",
    "Anna_Svanberg_Vidar9116.jpg",
    "Annie_Hjerten_Clementine_PJ9738.jpg",
    "Astrid_Lund_Wisholm_Kastanjelunds_Rainbow8397.jpg",
    "Ayleen_Ejderland_Fan_Byarah8230.jpg",
    "Carl-Walter_Fox_Eka_First_Navy_Jack8998.jpg",
    "Cathrine_Laudrup-Dufour_Mount_St_John_Freestyle7222.jpg",
    "Cathrine_Laudrup-Dufour_Mount_St_John_Freestyle7225.jpg",
    "DSC_8370.jpg",
    "Dorothee_Schneider_First_Romance_27059.jpg",
    "Ella_Lofqvist_Linus8899.jpg",
    "Falsterbo7800.jpg",
    "Felicia_Hultberg_Bollerup_Chiquelle8407.jpg",
    "Filippa_Skogstrom_Melvin_D7871.jpg",
    "Fredrik_Spetz_Galactee_de_Tivoli8292.jpg",
    "Hannes_Ahlmann_Coquetto6713.jpg",
    "Harrie_Smolders_Ecclestone_Z6875.jpg",
    "Harrie_Smolders_Kaspar_R5870.jpg",
    "Henrik_von_Eckermann_Minute_Man8186.jpg",
    "Ida_Kuchenmeistern_Nordenberg_Qorruption9047.jpg",
    "Jenny_Krogsaeter_Quana_Van_Klapscheut8330.jpg",
    "Jens_Fredricson_Diarado_s_Rose_Elith6554.jpg",
    "Kim_Emmen_Nimrod_Dmh6923.jpg",
    "Linda_Heed_Skylander_VS6604.jpg",
    "Linnea_Nord_Major_Dice9747.jpg",
    "Marcus_Westergren_Qualando_de_Caramel9946.jpg",
    "Maria_von_Essen_Invoice7241.jpg",
    "Max_Kuhner_Nouri_W6680.jpg",
    "Nicole_Holmen_Bollerup_Big_Bang9527.jpg",
    "Peder_Fredricson_Alcapone_des_Carmille8136.jpg",
    "Peder_Fredricson_Iggy9507.jpg",
    "Peder_Fredricson_Qurious_HS9235.jpg",
    "Philip_Svitzer_Alida_Nike9979.jpg",
    "Trevor_Breen_Konrad_Obolensky8300.jpg",
    "Viktor_Edvinsson_Ada_Race6935.jpg"
];

const generateId = () => Math.random().toString(36).substr(2, 9);
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate Photos combining Real Assets + Random Mock Data
export const photos: Photo[] = filenames.map((filename) => {
    const rider = pickRandom(RIDERS);
    const horseMapping = RIDER_PRIMARY_HORSE.find(m => m.riderId === rider.id);
    const horse = HORSES.find(h => h.id === horseMapping?.primaryHorseId) || HORSES[0];
    const comp = pickRandom(COMPETITIONS);
    const pg = pickRandom(PHOTOGRAPHERS);

    // Assign a fixed aspect ratio for staggered grid simulation or random sizes
    // Just a placeholder, assume standard or random
    const width = pickRandom([600, 800, 400]);
    const height = pickRandom([600, 800, 500, 900]);

    return {
        id: generateId(),
        src: `/images/${filename}`, // Corrected from 'image'
        rider: rider.firstName + ' ' + rider.lastName, // Corrected from 'title'
        horse: horse.name, // Corrected from 'subtitle'
        event: comp.name,
        eventId: comp.id,
        date: comp.date,
        width: width,   // Required by Photo interface
        height: height, // Required by Photo interface

        // Metadata required by Photo interface
        className: 'photo-grid-item',
        time: '14:00', // Mock time
        city: comp.city,
        arena: `${comp.city} Arena`,
        countryCode: 'se',
        discipline: comp.discipline,
        photographer: pg.firstName + ' ' + pg.lastName,
        photographerId: pg.id
    };
});

import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePhotographer, type Photo } from '../../context/PhotographerContext';
import { MasonryGrid } from '../../components/MasonryGrid';
import { PhotoCard } from '../../components/PhotoCard';
import { PgSelectionPanel } from './PgSelectionPanel';
import { PgToast } from './PgToast';
import { TOAST_TOKENS } from '../../context/ToastTokens';
import { TitleHeader } from '../../components/TitleHeader';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { X, Check, Trash2, Pencil, AlertCircle } from 'lucide-react';
import { ActionCluster, MoreMenu } from '../../components/HeaderActions';
import { FilterChip } from '../../components/FilterChip';
import { StickyActionBar, type SearchResult } from '../../components/StickyActionBar';
import { RIDERS, HORSES } from '../../data/mockData';
import './EventDetail.css';

// Tab type
type TabType = 'uploads' | 'published' | 'archive';

// Folder type
type FolderType = 'random' | 'misc' | 'uncategorised' | 'duplicates';
type PublishedFolderType = 'selling_photos' | 'unsold';

export const EventDetail: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const location = useLocation();
    const { getEvent, getPhotosByEvent, resolveDuplicate } = usePhotographer();

    const event = eventId ? getEvent(eventId) : undefined;
    const allPhotos = eventId ? getPhotosByEvent(eventId) : [];

    // State
    const [activeTab, setActiveTab] = useState<TabType>('uploads');
    const [activeFolder, setActiveFolder] = useState<FolderType>('random');
    const [activePublishedFolder, setActivePublishedFolder] = useState<PublishedFolderType>('selling_photos');
    const [activeChip, setActiveChip] = useState<string>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewPhoto, setPreviewPhoto] = useState<any | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [highlightedPhotoId, setHighlightedPhotoId] = useState<string | null>(null);

    // Scroll Header Logic
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const threshold = 10; // sensitivity

        const handleScroll = (currentY: number) => {
            const diff = currentY - lastScrollY.current;

            // Hide on scroll down (> threshold), Show on scroll up (< -threshold)
            // Also keep visible if near top (currentY < 100)
            if (diff > threshold && currentY > 100) {
                setHeaderVisible(false);
            } else if (diff < -threshold || currentY < 100) {
                setHeaderVisible(true);
            }
            lastScrollY.current = currentY;
        };

        // Expanded View Listener
        const container = scrollContainerRef.current;
        const onDivScroll = () => {
            if (!container) return;
            handleScroll(container.scrollTop);
        };

        // Document Listener (Non-expanded)
        const onWindowScroll = () => {
            handleScroll(window.scrollY);
        };

        if (isExpanded) {
            // Reset state when switching modes
            setHeaderVisible(true);
            if (container) container.addEventListener('scroll', onDivScroll);
        } else {
            window.addEventListener('scroll', onWindowScroll);
        }

        return () => {
            if (container) container.removeEventListener('scroll', onDivScroll);
            window.removeEventListener('scroll', onWindowScroll);
        };
    }, [isExpanded]); // dependency isExpanded to switch modes -> re-bind listeners

    const processedDupIds = React.useRef<Set<string>>(new Set());

    // Deep link effect: Scroll to duplicate group
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const dupId = params.get('dup');

        if (dupId && !processedDupIds.current.has(dupId)) {
            processedDupIds.current.add(dupId);

            // Force switch to duplicate view
            if (activeTab !== 'uploads') setActiveTab('uploads');
            if (activeFolder !== 'duplicates') setActiveFolder('duplicates');

            // Wait for render/transition
            setTimeout(() => {
                const el = document.getElementById(`dup-group-${dupId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('highlight-duplicate-group');
                    setTimeout(() => {
                        el.classList.remove('highlight-duplicate-group');
                        // Clear the param after highlight so navigation isn't locked
                        // We use the current location to avoid stale closures, but params are from render
                        const currentParams = new URLSearchParams(window.location.search);
                        currentParams.delete('dup');
                        navigate({ search: currentParams.toString() }, { replace: true });
                    }, 2000);
                }
            }, 300);
        }
    }, [location.search, activeFolder, activeTab, navigate]);

    // Reset active chip to 'all' when switching folders/buckets
    React.useEffect(() => {
        setActiveChip('all');
    }, [activeFolder]);

    // Reset selection when switching tabs
    React.useEffect(() => {
        setSelectedIds(new Set());
        setIsPanelOpen(false);
        setActiveChip('all');
    }, [activeTab]);

    // Photos by tab
    const uploadPhotos = useMemo(() =>
        allPhotos.filter(p => ['uploading', 'processing', 'needsReview', 'uploadedUnpublished'].includes(p.status)),
        [allPhotos]
    );

    // --- ADVANCED SEARCH LOGIC ---
    const searchSuggestions = useMemo(() => {
        if (!searchTerm.length) return [];
        const lower = searchTerm.toLowerCase();
        const results: SearchResult[] = [];

        // 1. Riders
        const matchingRiders = RIDERS.filter(r =>
            `${r.firstName} ${r.lastName}`.toLowerCase().includes(lower)
        ).slice(0, 3).map(r => ({
            id: r.id,
            type: 'rider' as const,
            title: `${r.firstName} ${r.lastName}`,
            subtitle: 'Rider',
            groupLabel: 'Rider'
        }));
        results.push(...matchingRiders);

        // 2. Horses
        const matchingHorses = HORSES.filter(h =>
            h.name.toLowerCase().includes(lower) || h.registeredName.toLowerCase().includes(lower)
        ).slice(0, 3).map(h => ({
            id: h.id,
            type: 'horse' as const,
            title: h.name,
            subtitle: 'Horse',
            groupLabel: 'Horse'
        }));
        results.push(...matchingHorses);

        // 3. Photos (by name or ID)
        const photoResults = allPhotos.filter(p =>
            (p.fileName?.toLowerCase().includes(lower)) ||
            (p.photoCode?.toLowerCase().includes(lower))
        ).slice(0, 5).map(p => {
            const isNameMatch = p.fileName?.toLowerCase().includes(lower);
            const secondaryId = isNameMatch ? `ID: ${p.photoCode || p.id}` : `Name: ${p.fileName || 'Untitled'}`;
            return {
                id: p.id,
                type: 'photo' as const,
                title: isNameMatch ? (p.fileName || '') : (p.photoCode || p.id),
                subtitle: `Photo • ${secondaryId}`,
                groupLabel: 'Photo'
            };
        });
        results.push(...photoResults);

        return results;
    }, [searchTerm, allPhotos]);

    const handleSuggestionSelect = (suggestion: SearchResult) => {
        // Set search term but don't clear it immediately so user sees what they selected
        setSearchTerm(suggestion.title);

        let targetPhoto: Photo | undefined;

        if (suggestion.type === 'photo') {
            targetPhoto = allPhotos.find(p => p.id === suggestion.id);
        } else if (suggestion.type === 'rider') {
            // Find most likely tab for rider: Uploads > Published > Archive
            targetPhoto = allPhotos.find(p => p.riderId === suggestion.id && ['uploading', 'processing', 'needsReview', 'uploadedUnpublished'].includes(p.status)) ||
                allPhotos.find(p => p.riderId === suggestion.id && p.status === 'published') ||
                allPhotos.find(p => p.riderId === suggestion.id);
        } else if (suggestion.type === 'horse') {
            targetPhoto = allPhotos.find(p => p.horseId === suggestion.id && ['uploading', 'processing', 'needsReview', 'uploadedUnpublished'].includes(p.status)) ||
                allPhotos.find(p => p.horseId === suggestion.id && p.status === 'published') ||
                allPhotos.find(p => p.horseId === suggestion.id);
        }

        if (targetPhoto) {
            // 1. Determine Tab
            let tab: TabType = 'uploads';
            if (targetPhoto.status === 'published') tab = 'published';
            if (targetPhoto.status === 'archived') tab = 'archive';
            setActiveTab(tab);

            // 2. Determine Bucket
            if (tab === 'uploads') {
                const batch = targetPhoto.batch?.toLowerCase();
                if (batch === 'random') setActiveFolder('random');
                else if (batch === 'misc') setActiveFolder('misc');
                else setActiveFolder('uncategorised');
            } else if (tab === 'published') {
                setActivePublishedFolder(targetPhoto.soldCount > 0 ? 'selling_photos' : 'unsold');
            }

            // 3. Determine Chip
            if (suggestion.type === 'rider') {
                setActiveChip(`rider-${suggestion.title}`);
            } else if (suggestion.type === 'horse') {
                setActiveChip(`horse-${suggestion.title}`);
            } else {
                setActiveChip('all');
            }

            // 4. Highlight and Scroll
            const photoId = targetPhoto.id;
            // Wait for React to re-render the appropriate view
            setTimeout(() => {
                setHighlightedPhotoId(photoId);
                const el = document.getElementById(`photo-${photoId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                // Clear highlight after 2 seconds
                setTimeout(() => setHighlightedPhotoId(null), 2000);
            }, 300);
        }
    };

    const publishedPhotosRaw = useMemo(() => {
        return allPhotos.filter(p => p.status === 'published');
    }, [allPhotos]);

    const publishedPhotosByBucket = useMemo(() => {
        if (activePublishedFolder === 'selling_photos') {
            return publishedPhotosRaw.filter(p => p.soldCount > 0);
        }
        return publishedPhotosRaw.filter(p => p.soldCount === 0);
    }, [publishedPhotosRaw, activePublishedFolder]);

    const publishedFolderCounts = useMemo(() => {
        const selling = publishedPhotosRaw.filter(p => p.soldCount > 0);
        return {
            selling_photos: selling.length,
            totalSales: selling.reduce((sum, p) => sum + p.soldCount, 0),
            unsold: publishedPhotosRaw.filter(p => p.soldCount === 0).length
        };
    }, [publishedPhotosRaw]);

    const publishedChips = useMemo(() => {
        const photos = publishedPhotosByBucket;

        const allChips = [
            { id: 'all', label: 'All', count: photos.length, filterFn: () => true },
            {
                id: 'generic',
                label: 'Generic',
                count: photos.filter(p => p.isGeneric).length,
                filterFn: (p: Photo) => p.isGeneric
            },
            {
                id: 'basic',
                label: 'Basic',
                color: '#9ca3af',
                count: photos.filter(p => p.priceStandard === 99 && p.priceHigh === 199).length,
                filterFn: (p: Photo) => p.priceStandard === 99 && p.priceHigh === 199
            },
            {
                id: 'standard',
                label: 'Standard',
                color: '#f97316',
                count: photos.filter(p => p.priceStandard === 299 && p.priceHigh === 499).length,
                filterFn: (p: Photo) => p.priceStandard === 299 && p.priceHigh === 499
            },
            {
                id: 'premium',
                label: 'Premium',
                color: '#a855f7',
                count: photos.filter(p => p.priceStandard === 499 && p.priceHigh === 999).length,
                filterFn: (p: Photo) => p.priceStandard === 499 && p.priceHigh === 999
            }
        ];

        return allChips;
    }, [publishedPhotosByBucket]);

    const filteredPublishedPhotos = useMemo(() => {
        const chip = publishedChips.find(c => c.id === activeChip);
        if (!chip || activeChip === 'all') return publishedPhotosByBucket;
        return publishedPhotosByBucket.filter(chip.filterFn);
    }, [publishedPhotosByBucket, activeChip, publishedChips]);


    const archivedPhotos = useMemo(() => {
        let photos = allPhotos.filter(p => p.status === 'archived');
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            photos = photos.filter(p =>
                (p.fileName?.toLowerCase().includes(term)) ||
                (p.photoCode?.toLowerCase().includes(term)) ||
                (p.id?.toLowerCase().includes(term))
            );
        }
        return photos;
    }, [allPhotos, searchTerm]);

    const tabCounts = useMemo(() => {
        return {
            uploads: uploadPhotos.length,
            published: allPhotos.filter(p => p.status === 'published').length,
            archive: allPhotos.filter(p => p.status === 'archived').length
        };
    }, [uploadPhotos, allPhotos]);

    // Compute valid duplicates (Cross-reference all uploads)
    // Only groups with 2+ instances are considered valid duplicates
    const validDuplicateIds = useMemo(() => {
        const groups = new Map<string, Photo[]>();
        uploadPhotos.forEach(p => {
            if (p.isDuplicate && !p.duplicateResolved) {
                const key = p.duplicateGroupId || p.url;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push(p);
            }
        });

        const validIds = new Set<string>();
        for (const photos of groups.values()) {
            if (photos.length >= 2) {
                photos.forEach(p => validIds.add(p.id));
            }
        }
        return validIds;
    }, [uploadPhotos]);

    // Folder counts
    const folderCounts = useMemo(() => ({
        random: uploadPhotos.filter(p => p.batch === 'Random').length,
        misc: uploadPhotos.filter(p => p.batch === 'Misc').length,
        uncategorised: uploadPhotos.filter(p => !p.batch || p.batch === '').length,
        duplicates: validDuplicateIds.size
    }), [uploadPhotos, validDuplicateIds]);

    // Photos in current folder
    const folderPhotos = useMemo(() => {
        let photos: Photo[] = [];
        switch (activeFolder) {
            case 'random':
                photos = uploadPhotos.filter(p => p.batch === 'Random');
                break;
            case 'misc':
                photos = uploadPhotos.filter(p => p.batch === 'Misc');
                break;
            case 'uncategorised':
                photos = uploadPhotos.filter(p => !p.batch || p.batch === '');
                break;
            case 'duplicates':
                // Show validated duplicates
                photos = uploadPhotos.filter(p => validDuplicateIds.has(p.id));
                break;
            default:
                photos = [];
        }

        // Apply search filter if search term exists
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            photos = photos.filter(p =>
                (p.fileName?.toLowerCase().includes(term)) ||
                (p.photoCode?.toLowerCase().includes(term)) ||
                (p.id?.toLowerCase().includes(term))
            );
        }

        return photos;
    }, [uploadPhotos, activeFolder, searchTerm]);



    // Determine if we're in duplicates folder
    const isDuplicatesFolder = activeFolder === 'duplicates';

    // Build chips for inside folder (NOT for duplicates folder)
    const folderChips = useMemo(() => {
        if (isDuplicatesFolder) return [];

        // Dynamically extract unique tags from currently displayed folder photos
        const uniqueClasses = Array.from(new Set(folderPhotos.map(p => p.className).filter(Boolean))) as string[];
        const uniqueRiders = Array.from(new Set(folderPhotos.map(p => p.rider).filter(r => r && r !== 'None'))) as string[];
        const uniqueHorses = Array.from(new Set(folderPhotos.map(p => p.horse).filter(h => h && h !== 'None'))) as string[];

        const allChips: any[] = [
            { id: 'all', label: 'All', count: folderPhotos.length, filterFn: () => true },
        ];

        // Add dynamic Class chips
        uniqueClasses.sort().forEach((cls) => {
            allChips.push({
                id: `class-${cls}`,
                label: cls,
                count: folderPhotos.filter(p => p.className === cls).length,
                filterFn: (p: Photo) => p.className === cls
            });
        });

        // Add dynamic Rider chips
        uniqueRiders.sort().forEach((rider) => {
            allChips.push({
                id: `rider-${rider}`,
                label: rider.toUpperCase(),
                count: folderPhotos.filter(p => p.rider === rider).length,
                filterFn: (p: Photo) => p.rider === rider
            });
        });

        // Add dynamic Horse chips
        uniqueHorses.sort().forEach((horse) => {
            allChips.push({
                id: `horse-${horse}`,
                label: horse,
                count: folderPhotos.filter(p => p.horse === horse).length,
                filterFn: (p: Photo) => p.horse === horse
            });
        });

        // Missing Tags logic - check ALL metadata fields
        allChips.push({
            id: 'missing-tags',
            label: 'Missing tags',
            count: folderPhotos.filter(p =>
                (!p.rider || p.rider === 'None') &&
                (!p.horse || p.horse === 'None') &&
                (!p.className || p.className === 'None') &&
                (!p.isGeneric || !p.title)
            ).length,
            filterFn: (p: Photo) =>
                (!p.rider || p.rider === 'None') &&
                (!p.horse || p.horse === 'None') &&
                (!p.className || p.className === 'None') &&
                (!p.isGeneric || !p.title)
        });

        return allChips;
    }, [folderPhotos, isDuplicatesFolder]);

    // Get filtered photos based on active chip
    const filteredFolderPhotos = useMemo(() => {
        // Duplicates folder shows all duplicates (no chip filtering)
        if (isDuplicatesFolder) return folderPhotos; // Return ALL duplicates, don't slice

        const chip = folderChips.find(c => c.id === activeChip);
        if (!chip || activeChip === 'all') return folderPhotos;
        return folderPhotos.filter(chip.filterFn);
    }, [folderPhotos, activeChip, folderChips, isDuplicatesFolder]);

    // Get display photos based on current tab
    const displayedPhotos = useMemo(() => {
        if (activeTab === 'uploads') return filteredFolderPhotos;
        if (activeTab === 'published') return filteredPublishedPhotos;
        if (activeTab === 'archive') return archivedPhotos;
        return [];
    }, [activeTab, filteredFolderPhotos, filteredPublishedPhotos, archivedPhotos]);

    // Group duplicates by duplicateGroupId (or URL if missing)
    const duplicateGroups = useMemo(() => {
        if (!isDuplicatesFolder) return new Map<string, Photo[]>();

        const groups = new Map<string, Photo[]>();
        displayedPhotos.forEach(p => {
            const key = p.duplicateGroupId || p.url;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(p);
        });

        // Logic already filtered by strict validDuplicateIds, but grouping here ensures structure
        // No extra filtering needed for size < 2 if validDuplicateIds already enforces it,
        // but keeping the loop or just relying on validDuplicateIds is fine.
        // We'll trust validDuplicateIds.
        return groups;
    }, [displayedPhotos, isDuplicatesFolder]);

    // Compute "Also in" for duplicates - ONLY batch or Uncategorised (no class/rider/horse)
    // Reset chip selection when folder changes
    React.useEffect(() => {
        setActiveChip('all');
    }, [activeFolder]);

    // Selection handlers
    const handleToggleSelect = (photo: Photo, multiSelect: boolean) => {
        const newSelected = new Set(multiSelect ? selectedIds : []);

        if (multiSelect) {
            if (newSelected.has(photo.id)) newSelected.delete(photo.id);
            else newSelected.add(photo.id);
        } else {
            if (newSelected.has(photo.id) && newSelected.size === 1) {
                newSelected.clear();
            } else {
                newSelected.clear();
                newSelected.add(photo.id);
            }
        }

        setSelectedIds(newSelected);

        if (newSelected.size === 0) {
            // Panel closed logic handled manually or by clear
        }
    };

    const handleClearSelection = () => {
        setSelectedIds(new Set());
        setIsPanelOpen(false);
    };

    // Duplicate actions
    const handleRemove = (photoId: string) => {
        resolveDuplicate(photoId, 'remove');
    };

    // Legacy handler for MasonryGrid fallback
    const handleKeep = (photoId: string) => {
        resolveDuplicate(photoId, 'keep');
    };

    // Handle bucket switching safely
    const handleFolderChange = (folder: FolderType) => {
        setActiveFolder(folder);
        // Clear dup param if present to ensure clean state
        if (location.search.includes('dup=')) {
            const params = new URLSearchParams(location.search);
            params.delete('dup');
            navigate({ search: params.toString() }, { replace: true });
        }
    };

    // Manage handler for cards in other views
    const handleManageDuplicate = (groupId?: string) => {
        if (!groupId) return;
        navigate(`?dup=${groupId}`, { replace: true });
    };



    // Map PG Photo to UI Photo for PhotoCard
    const mapToUiPhoto = (photo: Photo) => ({
        id: photo.id,
        src: photo.url,
        rider: photo.rider || 'Unknown',
        house: photo.horse || 'Unknown',
        horse: photo.horse || 'Unknown', // Fix typo fallback
        event: event?.title || 'Event',
        eventId: photo.eventId,
        date: photo.uploadDate || new Date().toISOString(),
        time: photo.timestamp || '12:00',
        city: event?.city || 'Location',
        countryCode: 'SE',
        width: photo.width,
        height: photo.height,
        className: photo.className || 'photo-grid-item',
        arena: event?.venueName || 'Arena 1',
        isDuplicate: validDuplicateIds.has(photo.id),
        duplicateGroupId: photo.duplicateGroupId,
        priceStandard: photo.priceStandard,
        priceHigh: photo.priceHigh
    });

    // Selection Helpers
    const isAllSelected = displayedPhotos.length > 0 && displayedPhotos.every(p => selectedIds.has(p.id));

    const handleSelectAll = () => {
        const newSet = new Set(selectedIds);
        displayedPhotos.forEach(p => newSet.add(p.id));
        setSelectedIds(newSet);
    };

    const handleEditPhoto = (photo: Photo) => {
        // Exclusive select + Open Panel
        setSelectedIds(new Set([photo.id]));
        setIsPanelOpen(true);
    };

    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'danger'; onUndo?: () => void } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ type: 'delete' | 'publish' | 'unpublish', isOpen: boolean }>({ type: 'delete', isOpen: false });
    const [activePanelTab, setActivePanelTab] = useState<'tags' | 'price'>('tags');

    const undoSelectionRef = useRef<Set<string>>(new Set());
    const actionBarRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!actionBarRef.current) return;
        const ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                const height = Math.max((entry.target as HTMLElement).offsetHeight, 64);
                document.documentElement.style.setProperty('--bucketBarH', `${height}px`);
            }
        });
        ro.observe(actionBarRef.current);
        return () => ro.disconnect();
    }, []);

    const handleEditPrice = (photo: Photo) => {
        setSelectedIds(new Set([photo.id]));
        setActivePanelTab('price');
        setIsPanelOpen(true);
    };

    const handleDeleteSelection = () => {
        if (selectedIds.size === 0) return;
        setConfirmModal({ type: 'delete', isOpen: true });
    };

    const handleUnpublishSelection = () => {
        if (selectedIds.size === 0) return;
        setConfirmModal({ type: 'unpublish', isOpen: true });
    };

    const handlePublishSelection = () => {
        if (selectedIds.size === 0) return;
        setConfirmModal({ type: 'publish', isOpen: true });
    };

    const handleUndoDelete = () => {
        setSelectedIds(new Set(undoSelectionRef.current));
        setToast(null);
    };

    const handleConfirmAction = () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setIsPanelOpen(false); // Close panel on confirmation (delete/publish/unpublish)

        if (confirmModal.type === 'delete') {
            undoSelectionRef.current = new Set(selectedIds);
            setToast({
                msg: `${selectedIds.size} photo${selectedIds.size > 1 ? 's' : ''} deleted`,
                type: TOAST_TOKENS.DELETE.type,
                onUndo: handleUndoDelete
            });
            setSelectedIds(new Set());
            setTimeout(() => setToast(null), 3000);
        } else if (confirmModal.type === 'publish') {
            setToast({
                msg: 'Published successfully',
                type: TOAST_TOKENS.PUBLISH.type
            });
            setSelectedIds(new Set());
            setTimeout(() => setToast(null), 3000);
        } else if (confirmModal.type === 'unpublish') {
            // Mock move to archive
            undoSelectionRef.current = new Set(selectedIds);
            setToast({
                msg: `${selectedIds.size} photo${selectedIds.size > 1 ? 's' : ''} moved to Archive`,
                type: TOAST_TOKENS.DELETE.type, // Use delete type for red accent or similar
                onUndo: () => {
                    // Undo logic
                    setToast({ msg: 'Unpublish undone', type: 'success' });
                    setTimeout(() => setToast(null), 3000);
                }
            });
            setSelectedIds(new Set());
            setTimeout(() => setToast(null), 3000);
        }
    };

    // Override edit photo to default to tags
    const handleEditPhotoOverride = (photo: Photo) => {
        handleEditPhoto(photo);
        setActivePanelTab('tags');
    };

    if (!event) return <div>Event not found</div>;

    // Tab styles
    const tabStyle: React.CSSProperties = {
        padding: '16px 24px',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#666',
        borderBottom: '2px solid transparent',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        borderBottomWidth: '2px',
        transition: 'all 0.2s',
        marginBottom: '-1px'
    };

    const activeTabStyle: React.CSSProperties = {
        ...tabStyle,
        color: '#1B3AEC',
        borderBottom: '2px solid #1B3AEC'
    };

    const renderContent = () => {
        return (
            <>
                {/* Tabs Row */}
                <div className={`pg-tabs-container ${isExpanded ? 'expanded-tabs' : ''} ${!headerVisible ? 'header-hidden' : ''}`}>
                    <div className="container" style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                        <button
                            className={activeTab === 'uploads' ? 'active' : ''}
                            style={activeTab === 'uploads' ? activeTabStyle : tabStyle}
                            onClick={() => setActiveTab('uploads')}
                        >
                            Uploads
                            <span className="pg-tab-badge">{tabCounts.uploads}</span>
                        </button>
                        <button
                            className={activeTab === 'published' ? 'active' : ''}
                            style={activeTab === 'published' ? activeTabStyle : tabStyle}
                            onClick={() => setActiveTab('published')}
                        >
                            Published
                            <span className="pg-tab-badge">{tabCounts.published}</span>
                        </button>
                        <button
                            className={activeTab === 'archive' ? 'active' : ''}
                            style={activeTab === 'archive' ? activeTabStyle : tabStyle}
                            onClick={() => setActiveTab('archive')}
                        >
                            Archive
                            <span className="pg-tab-badge">{tabCounts.archive}</span>
                        </button>

                        {isExpanded && (
                            <div className="pg-expanded-header-identity" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <img src={event.logo} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                                <span className="pg-expanded-title" title={event.title} style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {event.title}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grey Content Section */}
                <div
                    className={`pg-grey-section ${isExpanded ? 'expanded-view' : ''}`}
                    ref={scrollContainerRef}
                >
                    <div className="pg-grey-section-inner">
                        <div className="container">

                            {/* Chips Row (Uploads OR Published) */}
                            {((activeTab === 'uploads' && !isDuplicatesFolder && folderChips.length > 0) || (activeTab === 'published' && publishedChips.length > 0)) && (
                                <div className="pg-filter-chips-row">
                                    {/* Scrollable Chips */}
                                    <div className="pg-chips-scroll-container">
                                        {(activeTab === 'uploads' ? folderChips : publishedChips).map((chip: any, index) => (
                                            <FilterChip
                                                key={chip.id}
                                                label={(
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {chip.color && (
                                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: chip.color }} />
                                                        )}
                                                        {chip.label}
                                                    </div>
                                                )}
                                                isActive={activeChip === chip.id}
                                                onClick={() => setActiveChip(chip.id)}
                                                variant="filterCount"
                                                accent={chip.id === 'missing-tags' ? 'red' : undefined}
                                                count={chip.count}
                                                className={index === 0 && activeChip === 'all' ? 'chip-all-black' : ''}
                                            />
                                        ))}
                                    </div>

                                    {/* Actions Cluster (Fixed Right) */}
                                    <div className="pg-chip-actions-cluster">
                                        {/* Select All (Always visible) */}
                                        <button
                                            className={`pg-chip-btn ${isAllSelected ? 'disabled' : ''}`}
                                            onClick={handleSelectAll}
                                            disabled={isAllSelected}
                                            style={isAllSelected ? { opacity: 0.6, cursor: 'default' } : {}}
                                        >
                                            Select all
                                        </button>

                                        {selectedIds.size > 0 && (
                                            <>
                                                <span className="pg-selection-status" style={{ marginLeft: 8 }}>{selectedIds.size} selected</span>

                                                {/* Clear Action */}
                                                <button className="pg-chip-btn" onClick={handleClearSelection}>
                                                    Clear
                                                </button>

                                                {/* Edit Action (Multi) */}
                                                <button className="pg-action-round-btn size-lg" onClick={() => setIsPanelOpen(true)} title="Edit selection">
                                                    <Pencil size={18} />
                                                </button>

                                                {/* Actions based on tab */}
                                                {activeTab === 'uploads' ? (
                                                    <>
                                                        {/* Delete Action (Red Round) */}
                                                        <button className="pg-action-round-btn delete size-lg" onClick={handleDeleteSelection} title="Delete selection">
                                                            <Trash2 size={18} />
                                                        </button>

                                                        {/* Publish Action (Primary Pill) */}
                                                        <button className="pg-chip-btn primary size-lg" onClick={handlePublishSelection}>
                                                            Publish
                                                        </button>
                                                    </>
                                                ) : activeTab === 'published' ? (
                                                    <>
                                                        {/* Unpublish Action (Red Primary Pill) */}
                                                        <button
                                                            className="pg-chip-btn size-lg"
                                                            onClick={handleUnpublishSelection}
                                                            style={{ background: '#ef4444', color: '#fff', borderColor: 'transparent', boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)' }}
                                                        >
                                                            Unpublish
                                                        </button>
                                                    </>
                                                ) : null}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Content Split: Grid/Groups + Inspector */}
                            <div className="pg-content-split">
                                <div className="pg-photos-grid" style={{ flex: 1 }}>
                                    {activeTab === 'uploads' && isDuplicatesFolder ? (
                                        // DUPLICATES VIEW (GROUPED)
                                        <div className="pg-duplicates-list" style={{ paddingBottom: 100 }}>
                                            {Array.from(duplicateGroups.entries()).map(([groupId, photos]) => {
                                                const firstPhoto = photos[0];
                                                const count = photos.length;

                                                return (
                                                    <div key={groupId} id={`dup-group-${groupId}`} className="pg-duplicate-group" style={{ marginBottom: 32, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                        <div className="pg-duplicate-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                                            <div className="pg-dup-title" style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                Duplicate: {firstPhoto.fileName} <span style={{ color: '#666', fontWeight: 400 }}>({count} instances)</span>
                                                            </div>
                                                        </div>
                                                        <div className="pg-duplicate-row" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                                                            {photos.map((photo) => {
                                                                const uiPhoto = mapToUiPhoto(photo);
                                                                const isSelected = selectedIds.has(photo.id);

                                                                return (
                                                                    <div key={photo.id} style={{ width: 260, flexShrink: 0, position: 'relative' }}>
                                                                        <div className={`pg-photo-card-wrapper ${isSelected ? 'selected' : ''}`}
                                                                            onClick={(e) => handleToggleSelect(photo, e.shiftKey || e.metaKey || e.ctrlKey)}
                                                                        >
                                                                            <PhotoCard
                                                                                photo={uiPhoto}
                                                                                onClick={() => { }}
                                                                                variant="pgDuplicate"
                                                                                pgMeta={{
                                                                                    fileName: photo.fileName,
                                                                                    photoCode: photo.photoCode,
                                                                                    uploadDate: photo.uploadDate,
                                                                                    timestamp: photo.timestamp,
                                                                                    storedLocation: photo.storedLocation
                                                                                }}
                                                                                onKeep={() => handleKeep(photo.id)}
                                                                                onRemove={() => handleRemove(photo.id)}
                                                                            />
                                                                            {/* Selection Overlay with Checkbox */}
                                                                            <div
                                                                                className={`pg-selection-overlay ${isSelected ? 'visible' : ''}`}
                                                                                onClick={(e) => { e.stopPropagation(); handleToggleSelect(photo, true); }}
                                                                            >
                                                                                <div className={`pg-new-checkbox ${isSelected ? 'checked' : ''}`}>
                                                                                    {isSelected && <Check size={14} strokeWidth={3} />}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {duplicateGroups.size === 0 && (
                                                <div className="pg-empty-state">No duplicates found.</div>
                                            )}
                                        </div>
                                    ) : (
                                        <MasonryGrid isLoading={false}>
                                            {displayedPhotos.map(photo => {
                                                const uiPhoto = mapToUiPhoto(photo);
                                                const isSelected = selectedIds.has(photo.id);

                                                // Determine card variant
                                                let cardVariant: 'pgUpload' | 'pgDuplicate' | 'pgPublished' | 'default' = 'default';
                                                if (activeTab === 'uploads') {
                                                    cardVariant = isDuplicatesFolder ? 'pgDuplicate' : 'pgUpload';
                                                } else if (activeTab === 'published') {
                                                    cardVariant = 'pgPublished';
                                                }

                                                return (
                                                    <div
                                                        key={photo.id}
                                                        id={`photo-${photo.id}`}
                                                        className={`pg-photo-card-wrapper ${isSelected ? 'selected' : ''} ${highlightedPhotoId === photo.id ? 'highlight-ring' : ''}`}
                                                        onClick={(e) => handleToggleSelect(photo, e.shiftKey || e.metaKey || e.ctrlKey)}
                                                    >
                                                        <PhotoCard
                                                            photo={uiPhoto}
                                                            onClick={() => { }}
                                                            variant={cardVariant}
                                                            pgMeta={(activeTab === 'uploads' || activeTab === 'published') ? {
                                                                fileName: photo.fileName,
                                                                photoCode: photo.photoCode,
                                                                uploadDate: photo.uploadDate,
                                                                timestamp: photo.timestamp,
                                                                priceStandard: isDuplicatesFolder ? undefined : photo.priceStandard,
                                                                priceHigh: isDuplicatesFolder ? undefined : photo.priceHigh,
                                                                storedLocation: photo.storedLocation,
                                                                soldCount: (activeTab === 'published') ? photo.soldCount : 0,
                                                                totalBucketSales: (activeTab === 'published' && activePublishedFolder === 'selling_photos') ? publishedFolderCounts.totalSales : 0
                                                            } : undefined}
                                                            // Note: MasonryGrid view usually not for duplicates anymore
                                                            onKeep={isDuplicatesFolder ? () => handleKeep(photo.id) : undefined}
                                                            onRemove={() => {
                                                                if (isDuplicatesFolder) {
                                                                    handleRemove(photo.id);
                                                                } else if (activeTab === 'published') {
                                                                    setSelectedIds(new Set([photo.id]));
                                                                    setConfirmModal({ type: 'unpublish', isOpen: true });
                                                                } else {
                                                                    setSelectedIds(new Set([photo.id]));
                                                                    setConfirmModal({ type: 'delete', isOpen: true });
                                                                }
                                                            }}
                                                            onManageDuplicate={() => handleManageDuplicate(photo.duplicateGroupId)}
                                                            onEdit={() => handleEditPhotoOverride(photo)}
                                                            onEditPrice={() => handleEditPrice(photo)}
                                                            onPreview={() => setPreviewPhoto(uiPhoto)}
                                                        />

                                                        {/* Selection Overlay */}
                                                        {/* Selection Overlay with Checkbox */}
                                                        <div
                                                            className={`pg-selection-overlay ${isSelected ? 'visible' : ''}`}
                                                            onClick={(e) => { e.stopPropagation(); handleToggleSelect(photo, true); }}
                                                        >
                                                            <div className={`pg-new-checkbox ${isSelected ? 'checked' : ''}`}>
                                                                {isSelected && <Check size={14} strokeWidth={3} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </MasonryGrid>
                                    )}
                                    {activeTab === 'uploads' && !isDuplicatesFolder && displayedPhotos.length === 0 && (
                                        <div className="pg-empty-state">
                                            No photos found {searchTerm ? `matching \"${searchTerm}\"` : 'in this folder'}.
                                        </div>
                                    )}
                                </div>
                                {/* Selection Panel - Always mounted for animation */}
                                <PgSelectionPanel
                                    isOpen={isPanelOpen}
                                    selectedIds={selectedIds}
                                    allPhotos={allPhotos}
                                    activeTab={activePanelTab}
                                    currentTab={activeTab === 'published' ? 'published' : 'uploads'}
                                    onClose={() => setIsPanelOpen(false)}
                                />
                            </div>
                        </div>

                        {/* Bottom Action Bar (StickyActionBar) */}
                        <StickyActionBar
                            variant={activeTab}
                            activeFolderId={activeTab === 'uploads' ? activeFolder : activePublishedFolder}
                            onFolderChange={(id) => {
                                if (activeTab === 'uploads') handleFolderChange(id);
                                else setActivePublishedFolder(id);
                            }}
                            folders={activeTab === 'uploads' ? [
                                { id: 'random', label: 'Random', count: folderCounts.random },
                                { id: 'misc', label: 'Misc', count: folderCounts.misc },
                                { id: 'uncategorised', label: 'Uncategorised', count: folderCounts.uncategorised },
                                { id: 'duplicates', label: 'Duplicates', count: folderCounts.duplicates, isDuplicate: true },
                            ] : activeTab === 'published' ? [
                                {
                                    id: 'selling_photos',
                                    label: 'Selling',
                                    count: publishedFolderCounts.selling_photos,
                                    badgeLabel: `${publishedFolderCounts.selling_photos}/${publishedFolderCounts.totalSales}`,
                                    title: 'Photos/total sales'
                                },
                                { id: 'unsold', label: 'Unsold', count: publishedFolderCounts.unsold },
                            ] : []}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            suggestions={searchSuggestions}
                            onSuggestionSelect={handleSuggestionSelect}
                            onUploadClick={() => navigate(`/pg/upload?eventId=${event.id}&from=event`)}
                            onExpandToggle={() => setIsExpanded(!isExpanded)}
                            isExpanded={isExpanded}
                        />

                    </div>
                </div>
            </>
        );
    };

    return (
        <div className={`pg-event-detail ${isExpanded ? 'is-expanded' : ''}`}>
            {!isExpanded && (
                <Breadcrumbs
                    items={[
                        { label: 'Events', onClick: () => navigate('/pg/events') },
                        { label: event.title, active: true }
                    ]}
                />
            )}

            {/* Title Header - Compact V2 (Only non-expanded) */}
            {!isExpanded && (
                <TitleHeader
                    className={`no-border pg-compact-header`}
                    variant="workspace"
                    title={event.title}
                    topSubtitle={event.dateRange}
                    avatar={event.logo}
                    avatarShape="square"
                    subtitle={(
                        <span>
                            {event.city} <span className="meta-bullet">•</span> {event.venueName} <span className="meta-bullet">•</span> {(event.disciplines || []).join(', ')}
                        </span>
                    )}
                    rightContent={(
                        <ActionCluster>
                            <MoreMenu
                                actions={[
                                    {
                                        label: 'Cancel registration',
                                        onClick: () => { console.log('Cancel registration clicked'); },
                                        variant: 'destructive'
                                    }
                                ]}
                            />
                        </ActionCluster>
                    )}
                />
            )}

            {renderContent()}

            {/* Preview Modal */}
            {previewPhoto && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }} onClick={() => setPreviewPhoto(null)}>
                    <img src={previewPhoto.src} alt="" style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: 4, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()} />
                    <button style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: 44, height: 44, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: 'background 0.2s' }} onClick={() => setPreviewPhoto(null)}>
                        <X size={24} />
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="pg-modal-overlay">
                    <div className="pg-modal-card" style={{ maxWidth: 400, padding: 24 }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ minWidth: 40, height: 40, borderRadius: '50%', background: (confirmModal.type === 'delete' || confirmModal.type === 'unpublish') ? '#FEF2F2' : '#EFF6FF', color: (confirmModal.type === 'delete' || confirmModal.type === 'unpublish') ? '#DC2626' : '#1B3AEC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: 8 }}>
                                    {confirmModal.type === 'delete' ? `Delete photo${selectedIds.size > 1 ? 's' : ''}?` : (confirmModal.type === 'unpublish' ? `Unpublish photo${selectedIds.size > 1 ? 's' : ''}?` : 'Publish photos?')}
                                </h3>
                                <p style={{ margin: '0 0 24px', color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    {confirmModal.type === 'delete'
                                        ? `This will remove the photo${selectedIds.size > 1 ? 's' : ''} from this event. You can undo right after deleting.`
                                        : confirmModal.type === 'unpublish'
                                            ? `This will move the selected photo${selectedIds.size > 1 ? 's' : ''} to the Archive tab. You can undo this action.`
                                            : (Array.from(selectedIds).some(id => validDuplicateIds.has(id))
                                                ? `Warning: ${Array.from(selectedIds).filter(id => validDuplicateIds.has(id)).length} duplicates found. Fix duplicates before publishing.`
                                                : 'This will move photos to Published.')}
                                </p>
                                <div className="pg-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                    <button className="pg-action-btn secondary" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Cancel</button>
                                    <button
                                        className="pg-action-btn primary"
                                        style={(confirmModal.type === 'delete' || confirmModal.type === 'unpublish') ? { background: '#ef4444', border: 'none', boxShadow: 'none', color: '#fff' } : {}}
                                        onClick={handleConfirmAction}
                                        disabled={confirmModal.type === 'publish' && Array.from(selectedIds).some(id => validDuplicateIds.has(id))}
                                    >
                                        {confirmModal.type === 'delete' ? 'Delete' : (confirmModal.type === 'unpublish' ? 'Unpublish' : 'Publish')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Page Level Toast (Portal to Body) */}
            {toast && createPortal(
                <div style={{
                    position: 'fixed',
                    bottom: 'calc(var(--sab-bottom-offset, 16px) + var(--sab-height, 64px) + 12px)',
                    left: 0,
                    width: '100%',
                    pointerEvents: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <PgToast
                        type={toast.type}
                        message={toast.msg}
                        onUndo={toast.onUndo}
                        style={{ pointerEvents: 'auto', position: 'relative', transform: 'none', bottom: 'auto', left: 'auto', right: 'auto' }}
                    />
                </div>,
                document.body
            )}
        </div>
    );
};

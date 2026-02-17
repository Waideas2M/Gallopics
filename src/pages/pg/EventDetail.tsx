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
import { useWorkspace } from '../../context/WorkspaceContext';
import { X, Check, Trash2, Pencil, AlertCircle, RotateCcw, Info } from 'lucide-react';
import { ScopedSearchBar } from '../../components/ScopedSearchBar';
import { ActionCluster, MoreMenu, ActionSeparator } from '../../components/HeaderActions';
import { InfoChip } from '../../components/InfoChip';
import { PHOTOGRAPHERS } from '../../data/mockData';
import { FilterChip } from '../../components/FilterChip';
import { StickyActionBar } from '../../components/StickyActionBar';
import './EventDetail.css';
import '../../components/AuthModal.css';
import '../../components/EditProfileModal.css';
import '../../components/Modal.css';

// Tab type
type TabType = 'uploads' | 'published' | 'archive';

// Folder type
type FolderType = 'random' | 'misc' | 'uncategorised' | 'duplicates';
type PublishedFolderType = 'selling_photos' | 'unsold';

export const EventDetail: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const location = useLocation();
    const { basePath, isAdmin } = useWorkspace();
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
    const [showInfoModal, setShowInfoModal] = useState(false);

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
                count: photos.filter(p => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500).length,
                filterFn: (p: Photo) => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500
            },
            {
                id: 'standard',
                label: 'Standard',
                color: '#f97316',
                count: photos.filter(p => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500).length,
                filterFn: (p: Photo) => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500
            },
            {
                id: 'premium',
                label: 'Premium',
                color: '#a855f7',
                count: photos.filter(p => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500).length,
                filterFn: (p: Photo) => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500
            }
        ];

        return allChips;
    }, [publishedPhotosByBucket]);

    const filteredPublishedPhotos = useMemo(() => {
        let photos = publishedPhotosByBucket;

        // Apply search filter if search term exists
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            photos = photos.filter(p => {
                const clientEmail = (p as any).clientEmail || `client_${p.id.slice(0, 4)}@example.com`;
                return (p.fileName?.toLowerCase().includes(term)) ||
                    (p.photoCode?.toLowerCase().includes(term)) ||
                    (p.id?.toLowerCase().includes(term)) ||
                    (clientEmail.toLowerCase().includes(term));
            });
        }

        const chip = publishedChips.find(c => c.id === activeChip);
        if (!chip || activeChip === 'all') return photos;
        return photos.filter(chip.filterFn);
    }, [publishedPhotosByBucket, activeChip, publishedChips, searchTerm]);


    const archivedPhotosRaw = useMemo(() => {
        return allPhotos.filter(p => p.status === 'archived');
    }, [allPhotos]);

    const archivedPhotosByBucket = useMemo(() => {
        if (activePublishedFolder === 'selling_photos') {
            return archivedPhotosRaw.filter(p => p.soldCount > 0);
        }
        return archivedPhotosRaw.filter(p => p.soldCount === 0);
    }, [archivedPhotosRaw, activePublishedFolder]);

    const archivedFolderCounts = useMemo(() => {
        const selling = archivedPhotosRaw.filter(p => p.soldCount > 0);
        return {
            selling_photos: selling.length,
            totalSales: selling.reduce((sum, p) => sum + p.soldCount, 0),
            unsold: archivedPhotosRaw.filter(p => p.soldCount === 0).length
        };
    }, [archivedPhotosRaw]);

    const archivedChips = useMemo(() => {
        const photos = archivedPhotosByBucket;

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
                count: photos.filter(p => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500).length,
                filterFn: (p: Photo) => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500
            },
            {
                id: 'standard',
                label: 'Standard',
                color: '#f97316',
                count: photos.filter(p => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500).length,
                filterFn: (p: Photo) => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500
            },
            {
                id: 'premium',
                label: 'Premium',
                color: '#a855f7',
                count: photos.filter(p => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500).length,
                filterFn: (p: Photo) => p.priceStandard === 499 && p.priceHigh === 999 && p.priceCommercial === 1500
            }
        ];

        return allChips;
    }, [archivedPhotosByBucket]);

    const filteredArchivedPhotos = useMemo(() => {
        let photos = archivedPhotosByBucket;

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            photos = photos.filter(p =>
                (p.fileName?.toLowerCase().includes(term)) ||
                (p.photoCode?.toLowerCase().includes(term)) ||
                (p.id?.toLowerCase().includes(term)) ||
                (p.rider?.toLowerCase().includes(term)) ||
                (p.horse?.toLowerCase().includes(term))
            );
        }

        const chip = archivedChips.find(c => c.id === activeChip);
        if (!chip || activeChip === 'all') return photos;
        return photos.filter(chip.filterFn);
    }, [archivedPhotosByBucket, activeChip, archivedChips, searchTerm]);

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
        uncategorised: uploadPhotos.filter(p => !p.batch || p.batch === '' || p.batch === 'Uncategorised').length,
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
                photos = uploadPhotos.filter(p => !p.batch || p.batch === '' || p.batch === 'Uncategorised');
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

    // Search Options for Autocomplete
    const searchOptions = useMemo(() => {
        if (!allPhotos.length) return [];
        const options: any[] = [];
        const uniqueRiders = new Set<string>();
        const uniqueHorses = new Set<string>();

        allPhotos.forEach(p => {
            if (p.rider && p.rider !== 'None' && !uniqueRiders.has(p.rider)) {
                uniqueRiders.add(p.rider);
                options.push({ label: p.rider, value: p.rider, type: 'rider', subtitle: p.horse });
            }
            if (p.horse && p.horse !== 'None' && !uniqueHorses.has(p.horse)) {
                uniqueHorses.add(p.horse);
                options.push({ label: p.horse, value: p.horse, type: 'horse', subtitle: p.rider });
            }

            // ADDED: Photo Search Functionality (Search by ID/Code)
            if (p.photoCode) {
                options.push({
                    label: `#${p.photoCode}`,
                    value: p.photoCode,
                    type: 'photo',
                    // Format: "IMG_2024.jpg • Rider Name"
                    subtitle: `${p.fileName}${p.rider ? ` • ${p.rider}` : ''}`
                });
            }
        });
        return options;
    }, [allPhotos]);

    // Get filtered photos based on active chip AND search term
    const filteredFolderPhotos = useMemo(() => {
        // Base: Folder photos
        let photos = folderPhotos;

        // 1. Filter by Search Term
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            photos = photos.filter(p =>
                (p.rider && p.rider.toLowerCase().includes(lower)) ||
                (p.horse && p.horse.toLowerCase().includes(lower)) ||
                (p.fileName && p.fileName.toLowerCase().includes(lower)) ||
                (p.id && p.id.toLowerCase().includes(lower))
            );
        }

        // Duplicates folder shows all duplicates (no chip filtering)
        if (isDuplicatesFolder) return photos;

        // 2. Filter by Chip
        const chip = folderChips.find(c => c.id === activeChip);
        if (!chip || activeChip === 'all') return photos;

        return photos.filter(chip.filterFn);
    }, [folderPhotos, activeChip, folderChips, isDuplicatesFolder, searchTerm]);

    // Get display photos based on current tab
    const displayedPhotos = useMemo(() => {
        if (activeTab === 'uploads') return filteredFolderPhotos;
        if (activeTab === 'published') return filteredPublishedPhotos;
        if (activeTab === 'archive') return filteredArchivedPhotos;
        return [];
    }, [activeTab, filteredFolderPhotos, filteredPublishedPhotos, filteredArchivedPhotos]);

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

    // Event Info modal: ESC handling + scroll lock to match EditProfile modal behavior
    React.useEffect(() => {
        if (!showInfoModal) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowInfoModal(false);
            }
        };

        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [showInfoModal]);

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
                msg: activeTab === 'archive' ? 'Republished successfully' : 'Published successfully',
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

                {/* Grey Content Section */}
                <div
                    className={`pg-grey-section ${isExpanded ? 'expanded-view' : ''}`}
                    ref={scrollContainerRef}
                >
                    {/* Tabs Row (Inside scroll container for expanded autohide/stick behavior) */}
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

                    <div className="pg-grey-section-inner">
                        <div className="container">

                            {/* Filter Bar (On Grey Surface) */}
                            <div className="pg-split-layout" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>

                                {/* LEFT SIDEBAR: Tags (Conditional) */}
                                {((activeTab === 'uploads' && !isDuplicatesFolder && (folderChips.length > 1 || searchTerm)) || (activeTab === 'published' && publishedChips.length > 0) || (activeTab === 'archive' && archivedChips.length > 0)) && (
                                    <div className="pg-filter-sidebar pg-sticky-sidebar" style={{ width: 190, flexShrink: 0, paddingTop: 12 }}>
                                        <div className="pg-chips-scroll-container" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', width: '100%', paddingRight: 8 }}>
                                            {(activeTab === 'uploads' ? folderChips : activeTab === 'published' ? publishedChips : archivedChips).map((chip: any, index) => (
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
                                                    className={index === 0 && activeChip === 'all' ? '' : ''}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* RIGHT CONTENT COLUMN */}
                                <div className="pg-main-content-col" style={{ flex: 1, minWidth: 0 }}>

                                    {/* TOP: Search & Actions (Conditional matches sidebar) */}
                                    {((activeTab === 'uploads' && !isDuplicatesFolder && (folderChips.length > 1 || searchTerm)) || (activeTab === 'published' && publishedChips.length > 0) || (activeTab === 'archive' && archivedChips.length > 0)) && (
                                        <div className="search-actions-row pg-sticky-search" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: 12, background: 'rgba(243, 244, 246, 0.95)', backdropFilter: 'blur(10px)', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0,0,0,0.05)', marginLeft: -8, marginRight: -8, paddingLeft: 8, paddingRight: 8, borderRadius: '0 0 4px 4px' }}>
                                            {/* Search */}
                                            <div className="search-group" style={{ flex: 1, maxWidth: 600 }}>
                                                <ScopedSearchBar
                                                    placeholder="Search riders, horses, photo ID..."
                                                    options={searchOptions}
                                                    currentValue={searchTerm}
                                                    onSelect={(val) => setSearchTerm(val === 'All' ? '' : val)}
                                                    onSearchChange={(val) => setSearchTerm(val)}
                                                    variant="v2"
                                                />
                                            </div>

                                            {/* Actions Cluster */}
                                            <div className="pg-events-filter-right" style={{ display: 'flex', alignItems: 'center' }}>
                                                {selectedIds.size > 0 ? (
                                                    // SELECTION MODE ACTIONS
                                                    <div className="pg-selection-inline-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span className="pg-selection-status" style={{ marginRight: 16, fontSize: '0.9rem', color: '#111', fontWeight: 600 }}>
                                                            {selectedIds.size} selected
                                                        </span>

                                                        {/* Edit Action */}
                                                        <button className="pg-action-round-btn size-lg" onClick={() => setIsPanelOpen(true)} title="Edit selection">
                                                            <Pencil size={18} />
                                                        </button>

                                                        {activeTab === 'uploads' || activeTab === 'archive' ? (
                                                            <>
                                                                <button className="pg-action-round-btn delete size-lg" onClick={handleDeleteSelection} title="Delete selection">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                                <button className="pg-chip-btn primary size-lg" onClick={handlePublishSelection} style={{ marginLeft: 8 }}>
                                                                    {activeTab === 'archive' ? 'Republish' : 'Publish'}
                                                                </button>
                                                            </>
                                                        ) : activeTab === 'published' ? (
                                                            <button
                                                                className="pg-action-round-btn delete size-lg"
                                                                onClick={handleUnpublishSelection}
                                                                title="Unpublish"
                                                            >
                                                                <RotateCcw size={18} />
                                                            </button>
                                                        ) : null}

                                                        {/* Single consistent separator */}
                                                        <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.1)', margin: '0 8px 0 16px' }} />

                                                        <button className="pg-chip-btn ghost" onClick={handleClearSelection} style={{ color: '#666' }}>
                                                            Clear
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // DEFAULT MODE ACTIONS
                                                    <>
                                                        <div className="filter-results-count" style={{ marginRight: 16, height: 24, display: 'flex', alignItems: 'center', color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>
                                                            Showing {displayedPhotos.length} photos
                                                        </div>

                                                        <div className="pg-view-actions">
                                                            <div className="pg-chip-actions-cluster">
                                                                {isAllSelected ? (
                                                                    <button className="pg-chip-btn ghost" onClick={() => setSelectedIds(new Set())}>
                                                                        <X size={14} />
                                                                        Clear
                                                                    </button>
                                                                ) : (
                                                                    <button className="pg-chip-btn ghost" onClick={handleSelectAll}>
                                                                        Select all
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
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
                                                        let cardVariant: 'pgUpload' | 'pgDuplicate' | 'pgPublished' | 'pgArchived' | 'default' = 'default';
                                                        if (activeTab === 'uploads') {
                                                            cardVariant = isDuplicatesFolder ? 'pgDuplicate' : 'pgUpload';
                                                        } else if (activeTab === 'published') {
                                                            cardVariant = 'pgPublished';
                                                        } else if (activeTab === 'archive') {
                                                            cardVariant = 'pgArchived';
                                                        }

                                                        return (
                                                            <div
                                                                key={photo.id}
                                                                id={`photo-${photo.id}`}
                                                                className={`pg-photo-card-wrapper ${isSelected ? 'selected' : ''}`}
                                                                onClick={(e) => handleToggleSelect(photo, e.shiftKey || e.metaKey || e.ctrlKey)}
                                                            >
                                                                <PhotoCard
                                                                    photo={uiPhoto}
                                                                    onClick={() => { }}
                                                                    variant={cardVariant}
                                                                    pgMeta={(activeTab === 'uploads' || activeTab === 'published' || activeTab === 'archive') ? {
                                                                        fileName: photo.fileName,
                                                                        photoCode: photo.photoCode,
                                                                        uploadDate: photo.uploadDate,
                                                                        timestamp: photo.timestamp,
                                                                        priceStandard: isDuplicatesFolder ? undefined : photo.priceStandard,
                                                                        priceHigh: isDuplicatesFolder ? undefined : photo.priceHigh,
                                                                        storedLocation: photo.storedLocation,
                                                                        soldCount: (activeTab === 'published' || activeTab === 'archive') ? photo.soldCount : 0,
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
                                                    No photos found {searchTerm ? `matching "${searchTerm}"` : 'in this folder'}.
                                                </div>
                                            )}
                                        </div>

                                        {/* Selection Panel - Always mounted for animation */}
                                        <PgSelectionPanel
                                            isOpen={isPanelOpen}
                                            selectedIds={selectedIds}
                                            allPhotos={allPhotos}
                                            activeTab={activePanelTab}
                                            currentTab={activeTab === 'published' ? 'published' : (activeTab === 'archive' ? 'archive' : 'uploads')}
                                            onClose={() => setIsPanelOpen(false)}
                                        />
                                    </div></div></div>
                        </div >
                    </div >
                </div >

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
                    ] : (activeTab === 'published' || activeTab === 'archive') ? [
                        {
                            id: 'selling_photos',
                            label: activeTab === 'archive' ? 'Sold' : 'Selling',
                            count: activeTab === 'published' ? publishedFolderCounts.selling_photos : archivedFolderCounts.selling_photos,
                            badgeLabel: activeTab === 'published'
                                ? `${publishedFolderCounts.selling_photos}/${publishedFolderCounts.totalSales}`
                                : `${archivedFolderCounts.selling_photos}/${archivedFolderCounts.totalSales}`,
                            title: 'Photos/total sales'
                        },
                        {
                            id: 'unsold',
                            label: 'Unsold',
                            count: activeTab === 'published' ? publishedFolderCounts.unsold : archivedFolderCounts.unsold
                        },
                    ] : []}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSelect={setSearchTerm}
                    searchPlaceholder={activeTab === 'published' ? "Search photo ID or client email..." : "Search riders, horses, photo ID..."}
                    searchOptions={searchOptions.map((opt: any) => ({
                        id: opt.value,
                        type: opt.type,
                        title: opt.label,
                        subtitle: opt.subtitle,
                        groupLabel: opt.type === 'rider' ? 'Riders' : 'Horses'
                    }))}
                    onUploadClick={() => navigate(`${basePath}/upload?eventId=${event.id}&from=event`)}
                    onExpandToggle={() => setIsExpanded(!isExpanded)}
                    isExpanded={isExpanded}
                />
            </>
        );
    };

    const eventPhotographer = useMemo(() => {
        if (!eventId) return null;
        return PHOTOGRAPHERS.find(p => p.primaryEventId === eventId) || PHOTOGRAPHERS[0];
    }, [eventId]);

    return (
        <div className={`pg-event-detail ${isExpanded ? 'is-expanded' : ''}`}>
            {!isExpanded && (
                <Breadcrumbs
                    items={[
                        { label: 'Events', onClick: () => navigate(`${basePath}/events`) },
                        { label: event.title, active: true }
                    ]}
                />
            )}

            {/* Title Header - Compact V2 (Only non-expanded) */}
            {!isExpanded && (
                <TitleHeader
                    className={`no-border pg-compact-header`}
                    variant="workspace"
                    title={(
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {event.title}
                            <button
                                onClick={() => setShowInfoModal(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 4,
                                    cursor: 'pointer',
                                    color: '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderRadius: '50%',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <Info size={18} />
                            </button>
                        </div>
                    )}
                    topSubtitle={event.dateRange}
                    avatar={event.logo}
                    avatarShape="square"
                    // subtitle removed to save space
                    rightContent={(
                        <ActionCluster>
                            {/* Stats Chips (Persistent in header) */}
                            <div className="pg-stats-badges" style={{ gap: 8 }}>
                                <div className="pg-badge-item published stacked">
                                    <span className="label">Published</span>
                                    <span className="count">{event.publishedCount ?? 0}</span>
                                </div>
                                <div className="pg-badge-item sales stacked">
                                    <span className="label">Sales</span>
                                    <span className="count">{event.soldCount ?? 0}/{(event.photosCount ?? 40)}</span>
                                </div>
                                {isAdmin ? (
                                    <>
                                        <div className="pg-badge-item earnings stacked">
                                            <span className="label">PG Earnings</span>
                                            <span className="value">SEK {((event.soldCount ?? 0) * 450).toLocaleString().replace(/,/g, ' ')}</span>
                                        </div>
                                        <div className="pg-badge-item earnings stacked" style={{ background: '#F5F3FF', color: '#5B21B6' }}>
                                            <span className="label">Gallop Earnings</span>
                                            <span className="value" style={{ color: '#7C3AED' }}>SEK {((event.soldCount ?? 0) * 4500).toLocaleString().replace(/,/g, ' ')}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="pg-badge-item earnings stacked">
                                        <span className="label">Earnings</span>
                                        <span className="value">SEK {((event.soldCount ?? 0) * 450).toLocaleString().replace(/,/g, ' ')}</span>
                                    </div>
                                )}
                            </div>

                            <ActionSeparator />

                            {isAdmin && eventPhotographer && (
                                <>
                                    <InfoChip
                                        label="Photographer"
                                        name={`${eventPhotographer.firstName} ${eventPhotographer.lastName}`}
                                        variant="photographer"
                                        avatarUrl={`/images/${eventPhotographer.firstName} ${eventPhotographer.lastName}.jpg`}
                                    />
                                    <ActionSeparator />
                                </>
                            )}
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
                    <div className="pg-modal-card">
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{ minWidth: 40, height: 40, borderRadius: '50%', background: (confirmModal.type === 'delete' || confirmModal.type === 'unpublish') ? '#FEF2F2' : '#EFF6FF', color: (confirmModal.type === 'delete' || confirmModal.type === 'unpublish') ? '#DC2626' : '#1B3AEC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <AlertCircle size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginTop: 0, fontSize: '1.125rem', fontWeight: 700, color: '#111', marginBottom: 8 }}>
                                    {confirmModal.type === 'delete' ? `Delete photo${selectedIds.size > 1 ? 's' : ''}?` : (confirmModal.type === 'unpublish' ? `Unpublish photo${selectedIds.size > 1 ? 's' : ''}?` : 'Publish photos?')}
                                </h3>
                                <p style={{ margin: '0 0 24px', color: '#666', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                                    {confirmModal.type === 'delete' ? 'This will remove the selected photo(s) from the event. This action cannot be undone.' : (confirmModal.type === 'unpublish' ? 'This will move photos to the Archive tab.' : (Array.from(selectedIds).some(id => validDuplicateIds.has(id))
                                        ? `Warning: ${Array.from(selectedIds).filter(id => validDuplicateIds.has(id)).length} duplicates found. Fix duplicates before publishing.`
                                        : 'This will move photos to Published.'))}
                                </p>
                                <div className="pg-modal-actions">
                                    <button className="pg-modal-btn secondary" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Cancel</button>
                                    <button
                                        className={`pg-modal-btn ${confirmModal.type === 'delete' || confirmModal.type === 'unpublish' ? 'destructive' : 'primary'}`}
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


            {/* Event Info Modal (Read Only) - Reuses Edit Profile modal shell */}
            {showInfoModal && (
                <div className="auth-modal-overlay" onClick={() => setShowInfoModal(false)} style={{ zIndex: 2100, alignItems: 'center' }}>
                    <div
                        className="edit-profile-modal-container event-details-modal-container"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="event-details-title"
                    >
                        {/* Header */}
                        <div className="modal-header-standard">
                            <h2 id="event-details-title" className="edit-profile-title">Event details</h2>
                            <button
                                className="edit-profile-close"
                                onClick={() => setShowInfoModal(false)}
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body (Scrollable) */}
                        <div className="modal-body-standard">
                            {/* Read Only Fields */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                {/* Identity */}
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                                        <img src={event.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', lineHeight: 1.2, marginBottom: 8 }}>{event.title}</div>
                                        <div style={{ fontSize: '0.95rem', color: '#666' }}>{event.dateRange}</div>
                                    </div>
                                </div>

                                {/* Organiser (Text Only) */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.02em' }}>Organiser</label>
                                    <div style={{ fontSize: '1rem', fontWeight: 500, color: '#111' }}>EquiSport Events AB</div>
                                </div>

                                {/* Location Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.02em' }}>City</label>
                                        <div style={{ fontSize: '1rem', color: '#111' }}>{event.city}</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.02em' }}>Venue</label>
                                        <div style={{ fontSize: '1rem', color: '#111' }}>{event.venueName}</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.02em' }}>County</label>
                                        <div style={{ fontSize: '1rem', color: '#111' }}>Stockholm County</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.02em' }}>Country</label>
                                        <div style={{ fontSize: '1rem', color: '#111' }}>Sweden</div>
                                    </div>
                                </div>

                                {/* Disciplines */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.02em' }}>Disciplines</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {(event.disciplines || []).map(d => (
                                            <span key={d} style={{ fontSize: '0.85rem', padding: '6px 12px', background: '#f3f4f6', borderRadius: 20, color: '#374151', fontWeight: 500 }}>
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Photographer */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.02em' }}>Photographer</label>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 20, padding: '4px 12px 4px 4px' }}>
                                        <img src={`/images/John Doe.jpg`} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', background: '#e5e7eb' }} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>John Doe</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer - single primary Close action, right-aligned */}
                        <div className="modal-footer-actions">
                            <button
                                className="edit-profile-btn-save"
                                onClick={() => setShowInfoModal(false)}
                            >
                                Close
                            </button>
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

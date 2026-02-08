import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Trash2, MoreVertical, RotateCcw, Save, Slash, ChevronDown, CheckCircle, Plus, AlertTriangle, AlertCircle, Check, Pencil, Info, ChevronRight, HelpCircle, ChevronLeft } from 'lucide-react';
import './PgSelectionPanel.css';
import { usePhotographer, type Photo } from '../../context/PhotographerContext';
import { RIDERS, HORSES } from '../../data/mockData';
import { PgCustomSelect } from './PgCustomSelect';
import { PgToast } from './PgToast';
import { TOAST_TOKENS } from '../../context/ToastTokens';

interface PgSelectionPanelProps {
    isOpen: boolean;
    selectedIds: Set<string>;
    allPhotos: Photo[];
    onClose: () => void;
    activeTab?: 'tags' | 'price';
    currentTab?: 'uploads' | 'published';
    onShowToast?: (msg: string, type: 'success' | 'moved' | 'warning' | 'danger', onUndo?: () => void) => void;
}

const CLASSES = ['1.20m Jumping', '1.30m Grand Prix', '1.10m Young Horses', 'Dressage Int. B'];
const BATCHES = ['Random', 'Misc', 'Uncategorised'];

const BUNDLES = {
    basic: { web: 99, high: 199, label: 'Basic' },
    standard: { web: 299, high: 499, label: 'Standard' },
    premium: { web: 499, high: 999, label: 'Premium' }
};

export const PgSelectionPanel: React.FC<PgSelectionPanelProps> = ({
    isOpen,
    selectedIds,
    allPhotos,
    onClose: propsOnClose,
    activeTab: activeTabProp,
    currentTab,
    onShowToast
}) => {
    const { updatePhotoMetadata, deletePhotos, updatePhotoStatus, restorePhotos, republishPhoto } = usePhotographer();

    // Derived Selection
    const selectedPhotos = useMemo(() => {
        return allPhotos.filter(p => selectedIds.has(p.id));
    }, [selectedIds, allPhotos]);

    const isSingle = selectedPhotos.length === 1;
    const count = selectedPhotos.length;
    const firstPhoto = selectedPhotos[0];

    // State for Edits (Tags)
    const [rider, setRider] = useState<string>('');
    const [horse, setHorse] = useState<string>('');
    const [cls, setCls] = useState<string>('');
    const [isGeneric, setIsGeneric] = useState(false);
    const [cachedSelections, setCachedSelections] = useState<{ rider: string, horse: string, cls: string } | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [viewMode, setViewMode] = useState<'edit' | 'summary'>('edit');

    // State for Edits (Price)
    const [priceBundle, setPriceBundle] = useState<'basic' | 'standard' | 'premium' | 'custom'>('standard');
    const [customPriceWeb, setCustomPriceWeb] = useState<string>('');
    const [customPriceHigh, setCustomPriceHigh] = useState<string>('');

    // Panel Tab State
    const [panelTab, setPanelTab] = useState<'tags' | 'price'>('tags');

    // Info Panel State
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    // Original State for dirty check (stores VALUES for price)
    const [originalState, setOriginalState] = useState<{
        rider: string, horse: string, cls: string,
        isGeneric: boolean, title: string, description: string,
        priceWeb: number, priceHigh: number
    } | null>(null);

    // Modal State
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [targetBatch, setTargetBatch] = useState<string>('');
    const [isCreatingBatch, setIsCreatingBatch] = useState(false);
    const [newBatchName, setNewBatchName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Confirmation Modals State
    const [confirmModal, setConfirmModal] = useState<{
        type: 'delete' | 'refresh' | 'close' | 'publish' | 'unpublish',
        isOpen: boolean
    }>({ type: 'close', isOpen: false });

    const isArchived = useMemo(() => selectedPhotos.length > 0 && selectedPhotos.every(p => p.status === 'archived'), [selectedPhotos]);

    // Filter Logic
    const availableHorses = useMemo(() => {
        return HORSES;
    }, []);

    // Toast State
    const [toast, setToast] = useState<{
        msg: string,
        undo?: () => void,
        type: 'success' | 'moved' | 'warning' | 'danger',
        context: 'global' | 'panel'
    } | null>(null);
    const toastTimeoutRef = useRef<any>(null);

    const triggerToast = (msg: string, type: 'success' | 'moved' | 'warning' | 'danger', context: 'global' | 'panel', undo?: () => void) => {
        if (context === 'global' && onShowToast) {
            onShowToast(msg, type, undo);
            return;
        }
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast({ msg, undo, type, context });
        toastTimeoutRef.current = setTimeout(() => setToast(null), 6000);
    };

    // Helper to get effective current price based on selection
    const getEffectivePrice = () => {
        if (priceBundle === 'custom') {
            return {
                web: Number(customPriceWeb) || 0,
                high: Number(customPriceHigh) || 0
            };
        } else {
            return {
                web: BUNDLES[priceBundle].web,
                high: BUNDLES[priceBundle].high
            };
        }
    };

    // Sync State on Selection Change
    useEffect(() => {
        if (isOpen && activeTabProp) {
            setPanelTab(activeTabProp);
        }
    }, [isOpen, activeTabProp]);

    useEffect(() => {
        if (selectedPhotos.length > 0) {
            const p = selectedPhotos[0];
            const inMissingBucket = !p.batch || p.batch === 'Uncategorised';

            // Metadata State
            const displayTitle = /^Photo \d+$/.test(p.title || '') ? '' : (p.title || '');

            // Price State (Multi: take first)
            const pWeb = p.priceStandard || 299;
            const pHigh = p.priceHigh || 499;

            let bundle: 'basic' | 'standard' | 'premium' | 'custom' = 'custom';
            if (pWeb === BUNDLES.basic.web && pHigh === BUNDLES.basic.high) bundle = 'basic';
            else if (pWeb === BUNDLES.standard.web && pHigh === BUNDLES.standard.high) bundle = 'standard';
            else if (pWeb === BUNDLES.premium.web && pHigh === BUNDLES.premium.high) bundle = 'premium';

            // Special case logic for Multi selection:
            if (selectedPhotos.length > 1) {
                setRider('');
                setHorse('');
                setCls('');
                setIsGeneric(false);
                setTitle('');
                setDescription('');

                setPriceBundle(bundle);
                // If custom bundle, pre-fill custom inputs. If standard bundle, empty.
                if (bundle === 'custom') {
                    setCustomPriceWeb(pWeb.toString());
                    setCustomPriceHigh(pHigh.toString());
                } else {
                    setCustomPriceWeb('');
                    setCustomPriceHigh('');
                }

                setOriginalState({
                    rider: '', horse: '', cls: '', isGeneric: false, title: '', description: '',
                    priceWeb: pWeb, priceHigh: pHigh
                });
                setViewMode('edit');
            } else {
                // Single
                setRider(p.rider || (inMissingBucket ? 'None' : ''));
                setHorse(p.horse || (inMissingBucket ? 'None' : ''));
                setCls(p.className || (inMissingBucket ? 'None' : ''));
                setIsGeneric(p.isGeneric || false);
                setTitle(displayTitle);
                setDescription(p.description || '');
                setCachedSelections(null);

                setPriceBundle(bundle);
                if (bundle === 'custom') {
                    setCustomPriceWeb(pWeb.toString());
                    setCustomPriceHigh(pHigh.toString());
                } else {
                    setCustomPriceWeb('');
                    setCustomPriceHigh('');
                }

                setOriginalState({
                    rider: p.rider || (inMissingBucket ? 'None' : ''),
                    horse: p.horse || (inMissingBucket ? 'None' : ''),
                    cls: p.className || (inMissingBucket ? 'None' : ''),
                    isGeneric: p.isGeneric || false, title: displayTitle, description: p.description || '',
                    priceWeb: pWeb, priceHigh: pHigh
                });

                if ((p.isGeneric) && (displayTitle || p.description)) {
                    setViewMode('summary');
                } else {
                    setViewMode('edit');
                }
            }
        }
    }, [selectedPhotos]);

    // Computed Dirty
    const [touched, setTouched] = useState(false);

    const isDirty = useMemo(() => {
        if (!originalState) return false;

        // Price check
        const current = getEffectivePrice();
        if (current.web !== originalState.priceWeb || current.high !== originalState.priceHigh) return true;

        if (isSingle) {
            if (rider !== originalState.rider || horse !== originalState.horse || cls !== originalState.cls) return true;
            if (isGeneric !== originalState.isGeneric) return true;
            if (isGeneric) {
                if (title !== originalState.title || description !== originalState.description) return true;
            }
            return false;
        }

        return touched;
    }, [rider, horse, cls, isGeneric, title, description, priceBundle, customPriceWeb, customPriceHigh, originalState, isSingle, touched]);

    const canReset = useMemo(() => {
        return (!!rider && rider !== 'None') || (!!horse && horse !== 'None') || (!!cls && cls !== 'None') || isGeneric || !!title || !!description;
    }, [rider, horse, cls, isGeneric, title, description]);

    // Handlers
    const handleChange = (field: string, value: string) => {
        setTouched(true);
        if (field === 'rider') setRider(value);
        if (field === 'horse') setHorse(value);
        if (field === 'cls') setCls(value);
        if (field === 'title') setTitle(value);
        if (field === 'description') setDescription(value);

        if (field === 'customPriceWeb') {
            setCustomPriceWeb(value);
            // Implicit switch if editing (though UI hides inputs unless custom selected)
            setPriceBundle('custom');
        }
        if (field === 'customPriceHigh') {
            setCustomPriceHigh(value);
            setPriceBundle('custom');
        }
    };

    const handleBundleSelect = (bundle: 'basic' | 'standard' | 'premium' | 'custom') => {
        setTouched(true);
        setPriceBundle(bundle);
        // Do NOT overwrite custom inputs from bundle values
    };

    const toggleGeneric = () => {
        setTouched(true);
        const willBeGeneric = !isGeneric;
        setIsGeneric(willBeGeneric);
        if (willBeGeneric) {
            setCachedSelections({ rider, horse, cls });
            setRider('None');
            setHorse('None');
            setCls('None');
        } else {
            if (cachedSelections) {
                setRider(cachedSelections.rider);
                setHorse(cachedSelections.horse);
                setCls(cachedSelections.cls);
            }
        }
    };

    const enterEditMode = () => {
        setViewMode('edit');
    };

    const handleReset = () => {
        if (!canReset) return;
        setConfirmModal({ type: 'refresh', isOpen: true });
    };

    const confirmRefresh = () => {
        const undoSnapshot = {
            rider: rider === 'None' ? '' : rider,
            horse: horse === 'None' ? '' : horse,
            className: cls === 'None' ? '' : cls,
            isGeneric,
            title,
            description
        };
        // Price reset logic: Not resetting prices on tag refresh

        setRider('');
        setHorse('');
        setCls('');
        setIsGeneric(false);
        setTitle('');
        setDescription('');
        setTouched(true);

        const ids = selectedPhotos.map(p => p.id);
        const updates = {
            rider: '', horse: '', className: '',
            isGeneric: false, title: '', description: ''
        };
        updatePhotoMetadata(ids, updates);

        // Preserve Price in "Original State" reset if we treat Refresh as a Tag Reset only?
        // Prompt implies Refresh only affects tags.
        // So we should Update Original State for Tags BUT Keep Price?
        // Or essentially, we are committing standard Tag state.

        setOriginalState(prev => prev ? ({
            ...prev,
            rider: '', horse: '', cls: '',
            isGeneric: false, title: '', description: ''
        }) : null);

        setTouched(false);
        setViewMode('edit');

        triggerToast("Tags refreshed", 'warning', 'panel', () => {
            updatePhotoMetadata(ids, undoSnapshot);
        });
        setConfirmModal({ type: 'refresh', isOpen: false });
    };

    const onCloseSafe = () => {
        if (isDirty) {
            setConfirmModal({ type: 'close', isOpen: true });
        } else {
            propsOnClose();
        }
    };

    const confirmCloseDiscard = () => {
        setTouched(false);
        setConfirmModal({ type: 'close', isOpen: false });
        propsOnClose();
    };

    const handleSave = () => {
        const ids = selectedPhotos.map(p => p.id);
        const prevMetadata = selectedPhotos.map(p => ({
            id: p.id,
            rider: p.rider, horse: p.horse, className: p.className,
            isGeneric: p.isGeneric, title: p.title, description: (p as any).description,
            priceStandard: p.priceStandard, priceHigh: p.priceHigh
        }));

        const updates: Partial<Photo> & { description?: string, isGeneric?: boolean } = {};

        // Tag Updates
        if (isSingle) {
            updates.rider = rider === 'None' ? '' : rider;
            updates.horse = horse === 'None' ? '' : horse;
            updates.className = cls === 'None' ? '' : cls;
            updates.isGeneric = isGeneric;
            if (isGeneric) {
                updates.title = title;
                updates.description = description;
            }
        } else {
            if (rider) updates.rider = rider === 'None' ? '' : rider;
            if (horse) updates.horse = horse === 'None' ? '' : horse;
            if (cls) updates.className = cls === 'None' ? '' : cls;
        }

        // Price Updates
        const finalPrice = getEffectivePrice();
        updates.priceStandard = finalPrice.web;
        updates.priceHigh = finalPrice.high;

        updatePhotoMetadata(ids, updates);

        triggerToast("Changes saved", 'success', 'panel', () => {
            prevMetadata.forEach(meta => {
                updatePhotoMetadata([meta.id], {
                    rider: meta.rider,
                    horse: meta.horse,
                    className: meta.className,
                    isGeneric: meta.isGeneric,
                    title: meta.title || '',
                    description: meta.description || '',
                    priceStandard: meta.priceStandard,
                    priceHigh: meta.priceHigh
                });
            });
        });

        setOriginalState({
            rider, horse, cls, isGeneric, title, description,
            priceWeb: finalPrice.web, priceHigh: finalPrice.high
        });
        setTouched(false);

        if (isSingle && isGeneric && (title || description)) {
            setViewMode('summary');
        }
    };

    const handleCancel = () => {
        if (originalState) {
            setRider(originalState.rider);
            setHorse(originalState.horse);
            setCls(originalState.cls);
            setIsGeneric(originalState.isGeneric);
            setTitle(originalState.title);
            setDescription(originalState.description);

            // Re-calc bundle from original state
            const pWeb = originalState.priceWeb;
            const pHigh = originalState.priceHigh;

            let bundle: 'basic' | 'standard' | 'premium' | 'custom' = 'custom';
            if (pWeb === BUNDLES.basic.web && pHigh === BUNDLES.basic.high) bundle = 'basic';
            else if (pWeb === BUNDLES.standard.web && pHigh === BUNDLES.standard.high) bundle = 'standard';
            else if (pWeb === BUNDLES.premium.web && pHigh === BUNDLES.premium.high) bundle = 'premium';

            setPriceBundle(bundle);
            if (bundle === 'custom') {
                setCustomPriceWeb(pWeb.toString());
                setCustomPriceHigh(pHigh.toString());
            } else {
                setCustomPriceWeb('');
                setCustomPriceHigh('');
            }
            // Ensure inputs are reset if we were in custom mode editing but then cancelled to a bundle?
            // "If user typed custom values, switching away... preserve custom values internally... switching back restores".
            // If I Cancel, I should restore the *Saved* state.
            // My implementation clears custom inputs if restored state is Bundle. Correct.
            // If restored state was Custom, it restores custom inputs. Correct.

            setTouched(false);
            if (originalState.isGeneric && (originalState.title || originalState.description)) {
                setViewMode('summary');
            } else {
                setViewMode('edit');
            }
        }
    };

    const handlePublish = () => {
        setConfirmModal({ type: 'publish', isOpen: true });
    };

    const confirmPublish = () => {
        const ids = selectedPhotos.map(p => p.id);
        const undoSnapshot = [...selectedPhotos];

        if (isArchived) {
            ids.forEach(id => republishPhoto(id));
            triggerToast("Photo republished", 'success', 'panel', () => {
                restorePhotos(undoSnapshot);
                triggerToast("Republish undone (Original restored)", 'moved', 'panel');
            });
        } else {
            updatePhotoStatus(ids, 'published');
            triggerToast("Photos published", 'success', 'panel', () => {
                undoSnapshot.forEach(p => {
                    updatePhotoStatus([p.id], p.status);
                });
                triggerToast("Publish undone", 'moved', 'panel');
            });
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
        propsOnClose();
    };

    const handleUnpublish = () => {
        setConfirmModal({ type: 'unpublish', isOpen: true });
    };

    const confirmUnpublish = () => {
        const ids = selectedPhotos.map(p => p.id);
        const undoSnapshot = [...selectedPhotos];

        updatePhotoStatus(ids, 'archived');
        triggerToast(`${count} photo${count > 1 ? 's' : ''} moved to Archive`, 'danger', 'panel', () => {
            undoSnapshot.forEach(p => {
                updatePhotoStatus([p.id], p.status);
            });
            triggerToast("Unpublish undone", 'moved', 'panel');
        });
        setConfirmModal({ ...confirmModal, isOpen: false });
        propsOnClose();
    };

    const handleDeleteInit = () => {
        setConfirmModal({ type: 'delete', isOpen: true });
    };

    const confirmDelete = () => {
        const ids = selectedPhotos.map(p => p.id);
        const undoSnapshot = [...selectedPhotos];

        deletePhotos(ids);
        setConfirmModal({ type: 'delete', isOpen: false });
        propsOnClose();

        triggerToast("Photo deleted", TOAST_TOKENS.DELETE.type, 'global', () => {
            restorePhotos(undoSnapshot);
            triggerToast("Delete undone", 'moved', 'global');
        });
    };

    const handleMoveInit = () => {
        setIsMoveModalOpen(true);
        setTargetBatch('');
        setIsCreatingBatch(false);
        setIsDropdownOpen(false);
    };

    const handleMoveConfirm = () => {
        const finalBatch = isCreatingBatch ? newBatchName : targetBatch;
        if (!finalBatch) return;

        const ids = selectedPhotos.map(p => p.id);
        const prevMetadata = selectedPhotos.map(p => ({
            id: p.id,
            batch: p.batch || 'Uncategorised',
            storedLocation: p.storedLocation
        }));

        updatePhotoMetadata(ids, {
            batch: finalBatch,
            storedLocation: (['Random', 'Misc', 'Uncategorised'].includes(finalBatch) ? finalBatch : 'Misc') as any
        });

        const undoAction = () => {
            const batches = new Set(prevMetadata.map(p => p.batch));
            batches.forEach(b => {
                const idsForBatch = prevMetadata.filter(p => p.batch === b).map(p => p.id);
                const loc = (['Random', 'Misc', 'Uncategorised'].includes(b) ? b : 'Misc') as any;
                updatePhotoMetadata(idsForBatch, {
                    batch: b === 'Uncategorised' ? '' : b,
                    storedLocation: loc
                });
            });
            triggerToast("Move undone", 'moved', 'global');
        };

        triggerToast(
            `Moved ${isSingle ? 'photo' : `${count} photos`} to ${finalBatch}`,
            'moved',
            'global',
            undoAction
        );

        setIsMoveModalOpen(false);
        propsOnClose();
    };

    const currentBatch = useMemo(() => {
        if (selectedPhotos.length === 0) return null;
        const first = selectedPhotos[0].batch || 'Uncategorised';
        const allMatch = selectedPhotos.every(p => (p.batch || 'Uncategorised') === first);
        return allMatch ? first : null;
    }, [selectedPhotos]);



    return (
        <>
            <div className={`pg-selection-panel ${isOpen ? 'is-open' : ''}`}>
                <div className="pg-panel-header">
                    <span className="pg-panel-title">Selection details</span>
                    <button className="pg-panel-close" onClick={onCloseSafe} title="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="pg-panel-scroll-area" style={{ position: 'relative' }}>
                    {!isSingle && count > 0 && (
                        <div className="pg-panel-section">
                            <div className="pg-panel-label" style={{ marginBottom: 16 }}>Multiple selection ({count})</div>
                        </div>
                    )}

                    {isSingle && firstPhoto && (
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
                    )}

                    {(isSingle || count > 0) && (
                        <div className="pg-panel-section">
                            {/* COMPACT TABS */}
                            <div className="pg-panel-compact-tabs">
                                <button
                                    className={`pg-panel-compact-tab ${panelTab === 'tags' ? 'active' : ''}`}
                                    onClick={() => setPanelTab('tags')}
                                >
                                    Tags
                                </button>
                                <button
                                    className={`pg-panel-compact-tab ${panelTab === 'price' ? 'active' : ''}`}
                                    onClick={() => setPanelTab('price')}
                                >
                                    Price
                                </button>
                            </div>

                            {/* TAGS TAB CONTENT */}
                            {panelTab === 'tags' && (
                                <>
                                    <div className="pg-panel-section-header">
                                        <span className="pg-panel-label">What do you see in the image</span>
                                        <button
                                            className="reset-btn"
                                            onClick={handleReset}
                                            title={canReset ? "Refresh tags" : "Nothing to reset"}
                                            disabled={!canReset}
                                            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid #e5e7eb', background: '#fff', opacity: canReset ? 1 : 0.5, cursor: canReset ? 'pointer' : 'not-allowed', color: '#666' }}
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                    </div>

                                    {/* EDIT MODE */}
                                    {viewMode === 'edit' ? (
                                        <>
                                            {!isGeneric ? (
                                                <>
                                                    <div className="pg-form-group">
                                                        <Label text="Rider" />
                                                        <div className="pg-form-row">
                                                            <PgCustomSelect
                                                                value={rider}
                                                                onChange={(val) => handleChange('rider', val)}
                                                                options={[
                                                                    { label: "None", value: "None" },
                                                                    ...RIDERS.map(r => ({ label: `${r.firstName} ${r.lastName}`, value: `${r.firstName} ${r.lastName}` }))
                                                                ]}
                                                                placeholder={isSingle ? "Select Rider..." : (rider ? "Mixed (Overwriting)" : "Mixed (Keep existing)")}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="pg-form-group">
                                                        <Label text="Horse" />
                                                        <div className="pg-form-row">
                                                            <PgCustomSelect
                                                                value={horse}
                                                                onChange={(val) => handleChange('horse', val)}
                                                                options={[
                                                                    { label: "None", value: "None" },
                                                                    ...availableHorses.map(h => ({ label: h.name, value: h.name }))
                                                                ]}
                                                                placeholder={isSingle ? "Select Horse..." : "Mixed (Keep existing)"}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="pg-form-group">
                                                        <Label text="Class" />
                                                        <div className="pg-form-row">
                                                            <PgCustomSelect
                                                                value={cls}
                                                                onChange={(val) => handleChange('cls', val)}
                                                                options={[
                                                                    { label: "None", value: "None" },
                                                                    ...CLASSES.map(c => ({ label: c, value: c }))
                                                                ]}
                                                                placeholder={isSingle ? "Select Class..." : "Mixed (Keep existing)"}
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ marginBottom: 24, padding: '12px 0', color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>
                                                    No rider, horse, or class info.
                                                </div>
                                            )}

                                            {/* Generic Option Checks */}
                                            {isSingle && (
                                                <div className="pg-form-group" style={{ marginTop: isGeneric ? 0 : 24 }}>
                                                    <div
                                                        className="pg-scan-checkbox-row"
                                                        onClick={toggleGeneric}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer'
                                                        }}
                                                    >
                                                        <div className={`pg-new-checkbox ${isGeneric ? 'checked' : ''}`} style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isGeneric ? '#1B3AEC' : '#fff', borderColor: isGeneric ? '#1B3AEC' : '#d1d5db' }}>
                                                            {isGeneric && <Check size={12} color="#fff" strokeWidth={3} />}
                                                        </div>
                                                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111' }}>This is a generic photo</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Specific Fields (Generic Only) */}
                                            {isGeneric && (
                                                <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                                                    <div className="pg-form-group">
                                                        <Label text="Title" />
                                                        <input
                                                            className="pg-panel-input"
                                                            value={title}
                                                            onChange={(e) => handleChange('title', e.target.value)}
                                                            maxLength={20}
                                                            placeholder="Pricing ceremony"
                                                        />
                                                    </div>
                                                    <div className="pg-form-group">
                                                        <Label text="Description" />
                                                        <textarea
                                                            className="pg-panel-textarea"
                                                            value={description}
                                                            onChange={(e) => handleChange('description', e.target.value)}
                                                            maxLength={30}
                                                            placeholder=""
                                                            rows={2}
                                                            style={{ minHeight: 'auto', resize: 'none' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        /* SUMMARY MODE (Generic Saved) */
                                        <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1B3AEC', textTransform: 'uppercase' }}>Generic photo</div>
                                                <button
                                                    onClick={enterEditMode}
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#666' }}
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </div>
                                            {title && (
                                                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111', marginBottom: 4 }}>
                                                    {title}
                                                </div>
                                            )}
                                            {description && (
                                                <div style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.4 }}>
                                                    {description}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* PRICE TAB CONTENT */}
                            {panelTab === 'price' && (
                                <div>
                                    <div className="pg-panel-section-header">
                                        <span className="pg-panel-label">Pricing bundle</span>
                                        <button
                                            className="reset-btn"
                                            onClick={() => setIsInfoOpen(!isInfoOpen)}
                                            title="Pricing Info"
                                            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid #e5e7eb', background: isInfoOpen ? '#eaeaea' : '#fff', color: '#666' }}
                                        >
                                            <Info size={18} />
                                        </button>
                                    </div>

                                    <div className="pg-price-bundle-list" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                                        {(Object.keys(BUNDLES) as Array<keyof typeof BUNDLES>).map(key => {
                                            const b = BUNDLES[key];
                                            const isSelected = priceBundle === key;
                                            // Bundle Colors: Basic=Grey, Standard=Orange, Premium=Purple
                                            const colors = {
                                                basic: { dot: '#9ca3af', bg: '#f3f4f6', border: '#e5e7eb' },
                                                standard: { dot: '#f97316', bg: '#ffedd5', border: '#fed7aa' },
                                                premium: { dot: '#a855f7', bg: '#f3e8ff', border: '#e9d5ff' }
                                            };
                                            const c = colors[key] || colors.basic;

                                            return (
                                                <div
                                                    key={key}
                                                    onClick={() => handleBundleSelect(key)}
                                                    style={{
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        padding: '12px 12px 12px 16px',
                                                        border: `1px solid ${isSelected ? c.dot : '#e5e7eb'}`,
                                                        borderRadius: 8,
                                                        background: isSelected ? c.bg : '#fff',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: 12
                                                    }}
                                                >
                                                    {/* Left Accent Bar */}
                                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: c.dot }} />
                                                    <div style={{
                                                        width: 16, height: 16, borderRadius: '50%',
                                                        border: `1px solid ${isSelected ? '#1B3AEC' : '#d1d5db'}`,
                                                        background: '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B3AEC' }} />}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>{b.label}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>Web {b.web} / High {b.high} SEK</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Custom Bundle Card */}
                                        <div
                                            onClick={() => handleBundleSelect('custom')}
                                            style={{
                                                padding: 12,
                                                border: `1px solid ${priceBundle === 'custom' ? '#1B3AEC' : '#e5e7eb'}`,
                                                borderRadius: 8,
                                                background: priceBundle === 'custom' ? '#eff6ff' : '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                                <div style={{
                                                    width: 16, height: 16, borderRadius: '50%',
                                                    border: `1px solid ${priceBundle === 'custom' ? '#1B3AEC' : '#d1d5db'}`,
                                                    background: '#fff',
                                                    marginTop: 2,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {priceBundle === 'custom' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B3AEC' }} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>Custom</div>
                                                    {priceBundle !== 'custom' && (
                                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>Set your own Web and High prices</div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Inputs for Custom */}
                                            {priceBundle === 'custom' && (
                                                <div className="pg-form-group" style={{ margin: '12px 0 0 28px' }}>
                                                    <div style={{ display: 'flex', gap: 12 }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: 4 }}>Web (SEK)</div>
                                                            <input
                                                                className="pg-panel-input"
                                                                type="number"
                                                                value={customPriceWeb}
                                                                onChange={(e) => handleChange('customPriceWeb', e.target.value)}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: 4 }}>High Res (SEK)</div>
                                                            <input
                                                                className="pg-panel-input"
                                                                type="number"
                                                                value={customPriceHigh}
                                                                onChange={(e) => handleChange('customPriceHigh', e.target.value)}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                </div>
                            )}
                        </div>
                    )}


                </div>

                {/* Footer */}
                <div className={`pg-panel-footer ${isDirty ? 'dirty-state' : ''}`}>
                    {isDirty ? (
                        <>
                            <button className="pg-action-btn secondary" onClick={handleCancel}>
                                <Slash size={16} /> Cancel
                            </button>
                            <button className="pg-action-btn primary" onClick={handleSave}>
                                <Save size={16} /> Save changes
                            </button>
                        </>
                    ) : (
                        <>
                            {currentTab === 'published' ? (
                                <button className="pg-action-btn primary" onClick={handleUnpublish} style={{ background: '#ef4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' }}>
                                    Unpublish
                                </button>
                            ) : (
                                <button className="pg-action-btn primary" onClick={handlePublish}>
                                    {isArchived ? "Republish" : "Publish"}
                                </button>
                            )}
                            <div style={{ display: 'flex', gap: 8 }}>
                                {currentTab !== 'published' && (
                                    <button className="pg-action-btn icon-only secondary delete-action" title="Delete" onClick={handleDeleteInit}>
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button className="pg-action-btn icon-only secondary" title="Move to..." onClick={handleMoveInit}>
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Confirm Modals etc ... same as before */}
                {isMoveModalOpen && (
                    <div className="pg-modal-overlay">
                        <div className="pg-modal-card">
                            <h3>Move to other batch</h3>
                            {/* ... */}
                            <div className="pg-modal-body">
                                {!isCreatingBatch ? (
                                    <>
                                        <Label text="Batch" />
                                        <div className="pg-custom-select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                            <span>{targetBatch || "Select batch..."}</span>
                                            <ChevronDown size={16} color="#666" />
                                            {isDropdownOpen && (
                                                <div className="pg-custom-select-list" onClick={(e) => e.stopPropagation()}>
                                                    {BATCHES.map(b => {
                                                        const isDisabled = b === currentBatch;
                                                        return (
                                                            <div
                                                                key={b}
                                                                className={`pg-select-option ${isDisabled ? 'disabled' : ''}`}
                                                                onClick={() => {
                                                                    if (!isDisabled) {
                                                                        setTargetBatch(b);
                                                                        setIsDropdownOpen(false);
                                                                    }
                                                                }}
                                                            >
                                                                {b}
                                                                {isDisabled && <span style={{ fontSize: '0.75rem', color: '#999' }}>Current batch</span>}
                                                            </div>
                                                        );
                                                    })}
                                                    <div
                                                        className="pg-select-option create-new"
                                                        onClick={() => {
                                                            setIsCreatingBatch(true);
                                                            setTargetBatch('');
                                                            setIsDropdownOpen(false);
                                                        }}
                                                    >
                                                        <Plus size={14} style={{ marginRight: 6 }} />
                                                        Create new batch...
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="pg-form-group">
                                        <Label text="New Batch Name" />
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input
                                                className="pg-panel-input"
                                                placeholder="Enter name..."
                                                value={newBatchName}
                                                onChange={(e) => setNewBatchName(e.target.value)}
                                                autoFocus
                                            />
                                            <button className="pg-action-btn secondary icon-only" onClick={() => setIsCreatingBatch(false)}><X size={16} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="pg-modal-actions">
                                <button className="pg-action-btn secondary" onClick={() => setIsMoveModalOpen(false)}>Cancel</button>
                                <button
                                    className="pg-action-btn primary"
                                    onClick={handleMoveConfirm}
                                    disabled={!isCreatingBatch ? !targetBatch : !newBatchName}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Unified Confirmation Modal */}
                {confirmModal.isOpen && (
                    <div className="pg-modal-overlay">
                        <div className="pg-modal-card" style={{ width: 340, padding: 24 }}>
                            {/* ... */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                {confirmModal.type === 'delete' ? (
                                    <AlertCircle size={24} color="#ef4444" />
                                ) : (
                                    <AlertCircle size={24} color="#f59e0b" />
                                )}
                                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>
                                    {confirmModal.type === 'delete' && 'Delete photo?'}
                                    {confirmModal.type === 'refresh' && 'Refresh tags?'}
                                    {confirmModal.type === 'close' && 'Discard changes?'}
                                    {confirmModal.type === 'publish' && (isArchived ? 'Republish photo?' : 'Publish photo?')}
                                    {confirmModal.type === 'unpublish' && 'Unpublish photo?'}
                                </h3>
                            </div>
                            <div className="pg-modal-body" style={{ fontSize: '0.9375rem', color: '#666', marginBottom: 24, lineHeight: 1.5 }}>
                                {confirmModal.type === 'delete' && 'This will remove the photo from this event. You can undo right after deleting.'}
                                {confirmModal.type === 'refresh' && 'This will revert tags to organiser data and remove your custom title/description.'}
                                {confirmModal.type === 'close' && 'You have unsaved changes in your selection. Are you sure you want to discard them?'}
                                {confirmModal.type === 'publish' && 'This will move the photo to Published and make it available for buyers.'}
                                {confirmModal.type === 'unpublish' && 'This will move the photo to the Archive tab. You can undo this action.'}
                            </div>
                            <div className="pg-modal-actions">
                                <button className="pg-action-btn secondary" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
                                    Cancel
                                </button>
                                {confirmModal.type === 'delete' && (
                                    <button
                                        className="pg-action-btn primary"
                                        style={{ background: '#ef4444', border: 'none', boxShadow: 'none' }}
                                        onClick={confirmDelete}
                                    >
                                        Delete
                                    </button>
                                )}
                                {confirmModal.type === 'refresh' && (
                                    <button
                                        className="pg-action-btn primary"
                                        onClick={confirmRefresh}
                                    >
                                        Refresh
                                    </button>
                                )}
                                {confirmModal.type === 'close' && (
                                    <button
                                        className="pg-action-btn primary"
                                        style={{ background: '#ef4444', border: 'none', boxShadow: 'none' }}
                                        onClick={confirmCloseDiscard}
                                    >
                                        Discard
                                    </button>
                                )}
                                {confirmModal.type === 'publish' && (
                                    <button
                                        className="pg-action-btn primary"
                                        onClick={confirmPublish}
                                    >
                                        {isArchived ? "Republish" : "Publish"}
                                    </button>
                                )}
                                {confirmModal.type === 'unpublish' && (
                                    <button
                                        className="pg-action-btn primary"
                                        style={{ background: '#ef4444', border: 'none', boxShadow: 'none' }}
                                        onClick={confirmUnpublish}
                                    >
                                        Unpublish
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Panel Overlay (Covering entire panel) */}
                {isInfoOpen && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: '#fff', zIndex: 2000,
                        display: 'flex', flexDirection: 'column',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        {/* Header: Back + Info + Close */}
                        <div className="pg-panel-header" style={{ justifyContent: 'space-between', paddingRight: 24, paddingLeft: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button
                                    onClick={() => setIsInfoOpen(false)}
                                    style={{
                                        background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, margin: '-8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111'
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="pg-panel-title">Info</span>
                            </div>
                            <button className="pg-panel-close" onClick={onCloseSafe} title="Close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="pg-panel-scroll-area" style={{ padding: 24 }}>
                            {/* Quality Info */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111', marginBottom: 12 }}>Quality info</div>
                                <div style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 500, color: '#111' }}>Web quality</div>
                                        <div>Best for social media and screen use.</div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500, color: '#111' }}>High resolution</div>
                                        <div>Best for printing and large displays.</div>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: '#999', marginTop: 4 }}>
                                        Gallopics automatically delivers the right resolution—no extra prep needed.
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderBottom: '1px solid #f1f2f4', marginBottom: 24 }} />

                            {/* Revenue Split */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111', marginBottom: 12 }}>Revenue split</div>
                                <div style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.5 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span>Photographer</span>
                                        <span style={{ fontWeight: 500, color: '#111' }}>75%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span>Gallopics</span>
                                        <span style={{ fontWeight: 500, color: '#111' }}>15%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Organiser</span>
                                        <span style={{ fontWeight: 500, color: '#111' }}>10%</span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: '#999', marginTop: 12 }}>
                                        Taxes depend on your status (freelancer vs business). Receipts are generated automatically.
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderBottom: '1px solid #f1f2f4', marginBottom: 24 }} />

                            {/* Links */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <a href="#" className="pg-panel-link" style={{ fontSize: '0.875rem', color: '#111', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1B3AEC'} onMouseLeave={(e) => e.currentTarget.style.color = '#111'}>
                                    Terms of Service <ChevronRight size={16} color="#ccc" />
                                </a>
                                <a href="#" className="pg-panel-link" style={{ fontSize: '0.875rem', color: '#111', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1B3AEC'} onMouseLeave={(e) => e.currentTarget.style.color = '#111'}>
                                    Privacy Policy <ChevronRight size={16} color="#ccc" />
                                </a>
                                <a href="#" className="pg-panel-link" style={{ fontSize: '0.875rem', color: '#111', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1B3AEC'} onMouseLeave={(e) => e.currentTarget.style.color = '#111'}>
                                    FAQ <HelpCircle size={16} color="#ccc" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {toast && toast.context === 'panel' && (
                    <PgToast
                        type={toast.type === 'moved' ? 'success' : (toast.type === 'warning' ? 'info' : (toast.type === 'danger' ? 'danger' : 'success'))}
                        message={toast.msg}
                        onUndo={toast.undo}
                        style={{ bottom: 84, left: 24, right: 24, width: 'auto', minWidth: 200 }}
                    />
                )}
            </div>

        </>
    );
};

const Label: React.FC<{ text: string }> = ({ text }) => (
    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666', marginBottom: 6 }}>{text}</div>
);

import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePhotographer } from '../../context/PhotographerContext';
import { UploadCloud, CheckCircle, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { ModernDropdown } from '../../components/ModernDropdown';
import { CreatableCombobox } from '../../components/CreatableCombobox';
import './UploadPage.css';

export const UploadPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const {
        events,
        startUpload,
        uploadSessions,
        clearUploadSession,
        setCurrentUploadEventId
    } = usePhotographer();

    // Local State
    const urlEventId = searchParams.get('eventId');
    const [selectedEventId, setSelectedEventId] = useState<string>(urlEventId || '');
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [existingBatches, setExistingBatches] = useState(['random', 'day 3', 'misc', 'others']);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Event Selection Logic
    useEffect(() => {
        if (!selectedEventId && events.length > 0) {
            const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const defaultEvent = sorted[0];
            if (defaultEvent) setSelectedEventId(defaultEvent.id);
        }
    }, [events, selectedEventId]);

    // Sync Context whenever selectedEventId changes
    useEffect(() => {
        if (selectedEventId) {
            setSearchParams({ eventId: selectedEventId }, { replace: true });
            setCurrentUploadEventId(selectedEventId);
        }
    }, [selectedEventId, setSearchParams, setCurrentUploadEventId]);

    // Derived Data
    const session = selectedEventId ? uploadSessions[selectedEventId] : null;
    const files = session?.files || [];
    const hasFiles = files.length > 0;

    // Options for Dropdowns
    const eventOptions = events.map(e => ({ label: e.title, value: e.id }));

    // Handlers
    const handleClose = () => {
        const from = searchParams.get('from');
        const urlEventId = searchParams.get('eventId');

        if (from === 'event' && urlEventId) {
            // Explicitly go back to the event we came from
            navigate(`/pg/events/${urlEventId}`);
        } else if (from === 'sidebar') {
            // Usually means we came from "anywhere", so events list is a safe home
            navigate('/pg/events');
        } else if (window.history.length > 1) {
            // General fallback: standard back button behavior
            navigate(-1);
        } else {
            // Emergency fallback: events list
            navigate('/pg/events');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
        else if (e.type === 'dragleave') setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(f => f.type.startsWith('image/'));
        if (validFiles.length > 0) {
            // Pass the selected batch as classId metadata
            startUpload(validFiles, { classId: selectedBatch || undefined });
        } else {
            alert('Please upload image files only.');
        }
    };

    const handleBatchChange = (val: string) => {
        setSelectedBatch(val);
        // If it's a new batch, add it to our local list so it doesn't show "Create" again
        if (val && !existingBatches.some(b => b.toLowerCase() === val.toLowerCase())) {
            setExistingBatches(prev => [val, ...prev]);
        }
    };

    const handleClearAll = () => {
        if (selectedEventId && hasFiles) {
            if (confirm("Clear all items from the current queue?")) {
                clearUploadSession(selectedEventId);
            }
        }
    };

    const handleViewPhotos = () => selectedEventId && navigate(`/pg/events/${selectedEventId}`);

    return (
        <div className="pg-upload-page">
            {/* Header */}
            <div className="pg-upload-header">
                <h1 className="pg-upload-title">Upload photos</h1>
                <button className="pg-upload-close" onClick={handleClose}>
                    <X size={20} />
                </button>
            </div>

            {/* Main Content Area - 2 Columns */}
            <div className="pg-upload-container">
                {/* Left Column - Forms & Drop Zone */}
                <main className="pg-upload-main">

                    {/* Simplified Card: Event & Batch Only */}
                    <div className="pg-upload-card">
                        <div className="pg-form-row">
                            <div className="pg-form-field">
                                <label className="pg-field-label">Event*</label>
                                <ModernDropdown
                                    value={selectedEventId}
                                    options={eventOptions}
                                    onChange={(val) => setSelectedEventId(val)}
                                    placeholder="Select event"
                                />
                            </div>
                            <div className="pg-form-field">
                                <label className="pg-field-label">Batch (optional)</label>
                                <CreatableCombobox
                                    value={selectedBatch}
                                    options={existingBatches}
                                    onChange={handleBatchChange}
                                    placeholder="Choose or create batch…"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card C: Drop Zone - Flex Fills Remaining Space */}
                    <div className="pg-upload-card dropzone-card">
                        <div
                            className={`pg-drop-zone ${isDragActive ? 'is-dragging' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            <div className="drop-content-wrapper">
                                <div className="drop-icon-circle">
                                    <UploadCloud size={28} />
                                </div>
                                <h2 className="drop-title">Drag & drop photos here</h2>
                                <p className="drop-text">Supported formats: JPG, PNG</p>
                                <Button variant="primary" size="medium" onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}>
                                    Browse files
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Upload Status */}
                    {hasFiles && (
                        <div className="pg-upload-status">
                            <span className="status-count">{files.length} photos ready</span>
                            <div className="status-actions">
                                <Button className="btn-status-cancel" variant="secondary" size="medium" onClick={handleClearAll}>
                                    Cancel
                                </Button>
                                <Button className="btn-status-view" variant="primary" size="medium" onClick={handleViewPhotos}>
                                    View photos
                                </Button>
                            </div>
                        </div>
                    )}
                </main>

                {/* Right Sidebar - Queue Card */}
                <aside className="pg-upload-queue">
                    <div className="queue-header">
                        <span className="queue-title">
                            In queue ({files.filter(f => f.status === 'completed').length}/{files.length})
                        </span>
                    </div>
                    <div className="queue-list">
                        {files.length === 0 ? (
                            <div className="queue-empty-simple">
                                <span className="queue-empty-text">No files in queue</span>
                            </div>
                        ) : (
                            files.map((item) => (
                                <div key={item.id} className="queue-item">
                                    <div className="queue-info">
                                        <div className="queue-filename">{item.file.name}</div>
                                        <div className="queue-progress">
                                            <div
                                                className={`queue-bar ${item.status === 'completed' ? 'completed' : ''}`}
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    {item.status === 'completed' && (
                                        <CheckCircle size={16} className="queue-check" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

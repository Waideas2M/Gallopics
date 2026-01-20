import React, { useRef, useState, useEffect } from 'react';
import { usePhotographer } from '../../context/PhotographerContext';
import { X, UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import './UploadOverlay.css';

// Safe Thumbnail Component
const FileThumbnail: React.FC<{ file: File }> = ({ file }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) return;

        let objectUrl: string | null = null;
        try {
            objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        } catch (e) {
            console.error("Failed to create object URL", e);
        }

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    if (!previewUrl) return <ImageIcon size={20} color="#ccc" />;

    return (
        <img
            src={previewUrl}
            alt="preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    );
};

export const UploadOverlay: React.FC = () => {
    const {
        isUploadOverlayOpen,
        currentUploadEventId,
        closeUploadOverlay,
        startUpload,
        uploadSessions,
        getEvent,
        clearUploadSession
    } = usePhotographer();

    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const event = currentUploadEventId ? getEvent(currentUploadEventId) : null;
    const session = currentUploadEventId ? uploadSessions[currentUploadEventId] : null;

    if (!isUploadOverlayOpen) return null;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
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

    const handleFiles = (files: File[]) => {
        const validFiles = files.filter(f => f.type.startsWith('image/'));
        if (validFiles.length > 0) {
            // Start upload (appends to session)
            startUpload(validFiles);
        } else {
            alert('Please upload image files only.');
        }
    };

    // Derived State
    const files = session?.files || [];
    const activeUploads = files.filter(q => q.status === 'uploading' || q.status === 'pending').length;
    const completedUploads = files.filter(q => q.status === 'completed').length;
    const isBatchComplete = session?.status === 'completed' && files.length > 0;

    const handleClose = () => {
        // Just hide, state persists
        closeUploadOverlay();
    };

    const handleStartNewBatch = () => {
        // Clear session logic?
        // Or just let them drag more? 
        // "Batch finishes: Keep overlay open and show... CTA: Upload another batch"
        // Usually implies clearing the success state or just waiting for new files.
        // If we just verify files, we append. 
        // We can just explicitly reset if user wants "fresh start".
        // But "Upload another batch" usually means "Add more".
        if (currentUploadEventId) {
            // To "reset" UI visually but keep photos, we might want to clear session *files* from view?
            // Prompt: "Batch-by-batch UX (no page reset)... Batch 1 -> Batch 2".
            // If we keep appending, the list grows.
            // Maybe "Upload another batch" clears the *session list* (since photos are already in main list)?
            // Yes, clearUploadSession does that.
            if (confirm("Start new batch? This clears the upload history list (photos remain saved).")) {
                clearUploadSession(currentUploadEventId);
            }
        }
    };

    const handleViewPhotos = () => {
        closeUploadOverlay();
        // Route is already correct (/pg/events/:id).
        // Maybe trigger a refresh or filter change? 
        // Context photos are updated, so List automatically shows new photos.
    };

    return (
        <div className="pg-upload-overlay">
            {/* Header */}
            <div className="pg-upload-header">
                <div className="pg-upload-h-title">
                    Upload Photos
                    {event && <span className="pg-upload-h-meta"> to {event.title}</span>}
                </div>
                <button className="pg-upload-close-btn" onClick={handleClose}>
                    <X size={24} />
                </button>
            </div>

            {/* Body */}
            <div className="pg-upload-body">

                {/* View: Batch Complete Success */}
                {isBatchComplete ? (
                    <div className="pg-upload-success-view">
                        <div className="pg-success-icon">
                            <CheckCircle size={64} color="#10b981" />
                        </div>
                        <h3>Batch Upload Complete!</h3>
                        <p>{files.length} photos have been added to the event.</p>

                        <div className="pg-success-actions">
                            <button className="pg-btn pg-btn-secondary" onClick={handleStartNewBatch}>
                                <Plus size={18} style={{ marginRight: 8 }} />
                                Upload another batch
                            </button>
                            <button className="pg-btn pg-btn-primary" onClick={handleViewPhotos}>
                                View Photos
                                <ArrowRight size={18} style={{ marginLeft: 8 }} />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* View: Drag & Drop + Queue */
                    <>
                        <div
                            className={`pg-upload-zone ${isDragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />

                            <div className="pg-drop-area">
                                <UploadCloud size={48} className="pg-upload-icon" />
                                <h3 className="pg-upload-title">Drag & drop photos here</h3>
                                <p className="pg-upload-desc">
                                    or <button className="pg-btn-links" onClick={() => fileInputRef.current?.click()}>browse files</button> from your computer
                                </p>
                            </div>
                        </div>

                        {/* Sidebar Queue */}
                        <div className="pg-upload-queue-panel">
                            <div className="pg-queue-header">
                                Queue ({completedUploads}/{files.length})
                            </div>
                            <div className="pg-queue-list">
                                {files.length === 0 ? (
                                    <div className="pg-queue-empty">No active uploads</div>
                                ) : (
                                    files.map((item) => (
                                        <div key={item.id} className="pg-queue-item">
                                            <div className="pg-queue-thumb">
                                                <FileThumbnail file={item.file} />
                                            </div>
                                            <div className="pg-queue-info">
                                                <div className="pg-queue-name" title={item.file.name}>{item.file.name}</div>
                                                <div className="pg-queue-bar-bg">
                                                    <div
                                                        className={`pg-queue-bar-fill ${item.status === 'completed' ? 'completed' : ''}`}
                                                        style={{ width: `${item.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="pg-queue-status-icon">
                                                {item.status === 'completed' ? (
                                                    <CheckCircle size={18} color="#10b981" />
                                                ) : item.status === 'failed' ? (
                                                    <AlertCircle size={18} color="#ef4444" />
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>{item.progress}%</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer (Hidden if Batch Complete, or just secondary actions) */}
            {!isBatchComplete && (
                <div className="pg-upload-footer">
                    <button className="pg-btn pg-btn-secondary" onClick={handleClose}>
                        Minimize
                    </button>
                </div>
            )}
        </div>
    );
};

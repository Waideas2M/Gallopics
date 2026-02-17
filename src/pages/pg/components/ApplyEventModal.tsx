import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ModernDropdown } from '../../../components/ModernDropdown';
import type { PgEvent } from '../../../context/PhotographerContext';
import '../../../components/AuthModal.css';
import '../../../components/EditProfileModal.css';
import '../../../components/Modal.css';

interface ApplyEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: PgEvent | null;
    onSubmit: () => void;
}

export const ApplyEventModal: React.FC<ApplyEventModalProps> = ({ isOpen, onClose, event, onSubmit }) => {
    const [applyType, setApplyType] = useState<'myself' | 'behalf'>('myself');
    const [photographerName, setPhotographerName] = useState('Klara Fors');
    const [phoneCode, setPhoneCode] = useState('+46');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('klara.fors@example.com');
    const [message, setMessage] = useState('I am interested in this event.');

    const phoneCodeOptions = [
        { label: '+46', value: '+46' },
        { label: '+45', value: '+45' },
        { label: '+47', value: '+47' },
        { label: '+358', value: '+358' },
    ];

    useEffect(() => {
        if (applyType === 'myself') {
            setPhotographerName('Klara Fors');
        } else {
            setPhotographerName('');
        }
    }, [applyType]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !event) return null;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
        onClose();
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose} style={{ zIndex: 1200, alignItems: 'center' }}>
            <div
                className="edit-profile-modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{ width: '500px' }}
            >
                {/* Header */}
                <div className="modal-header-standard">
                    <h2 className="edit-profile-title">Apply for this event</h2>
                    <button className="edit-profile-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body-standard">

                    {/* Event Summary */}
                    <div style={{
                        background: '#f8f9fa',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        border: '1px solid #eee'
                    }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600 }}>{event.title}</h4>
                        <div style={{ color: '#666', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span>{event.dateRange}</span>
                            <span>{event.venueName}, {event.city}</span>
                        </div>
                    </div>

                    <form onSubmit={handleFormSubmit} className="edit-profile-form-grid" style={{ gap: '20px' }}>



                        {/* 1. Apply Type (Myself or Behalf) */}
                        <div className="edit-profile-full-width">
                            <label className="edit-profile-label">Who are you applying for?</label>
                            <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input
                                        type="radio"
                                        name="apply-type"
                                        checked={applyType === 'myself'}
                                        onChange={() => setApplyType('myself')}
                                        style={{ width: '18px', height: '18px', accentColor: '#1B3AEC' }}
                                    />
                                    <span>Myself</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input
                                        type="radio"
                                        name="apply-type"
                                        checked={applyType === 'behalf'}
                                        onChange={() => setApplyType('behalf')}
                                        style={{ width: '18px', height: '18px', accentColor: '#1B3AEC' }}
                                    />
                                    <span>On behalf of someone</span>
                                </label>
                            </div>
                        </div>

                        {/* 2. Photographer Name */}
                        <div className="edit-profile-full-width">
                            <label className="edit-profile-label">Photographer name</label>
                            <input
                                type="text"
                                className="auth-input"
                                value={photographerName}
                                onChange={(e) => setPhotographerName(e.target.value)}
                                disabled={applyType === 'myself'}
                                style={applyType === 'myself' ? { background: '#f5f5f5', color: '#888' } : {}}
                                placeholder="Enter name"
                            />
                        </div>

                        {/* Section: Contact - Header Removed */}
                        <div className="edit-profile-full-width" style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', marginTop: '16px' }} />

                        {/* 3. Phone Number */}
                        <div className="edit-profile-full-width edit-profile-row-2col" style={{ gridTemplateColumns: '100px 1fr' }}>
                            <div>
                                <label className="edit-profile-label">Code</label>
                                <ModernDropdown
                                    value={phoneCode}
                                    options={phoneCodeOptions}
                                    onChange={setPhoneCode}
                                />
                            </div>
                            <div>
                                <label className="edit-profile-label">Phone number</label>
                                <input
                                    type="tel"
                                    className="auth-input"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="70 123 45 67"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        {/* 4. Email */}
                        <div className="edit-profile-full-width">
                            <label className="edit-profile-label">Email</label>
                            <input
                                type="email"
                                className="auth-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                            />
                        </div>

                        {/* 5. Message */}
                        <div className="edit-profile-full-width">
                            <label className="edit-profile-label">Message</label>
                            <textarea
                                className="auth-input"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                style={{ height: '80px', paddingTop: '12px', paddingBottom: '12px', resize: 'none' }}
                                placeholder="I am interested in this event."
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="modal-footer-actions">
                    <button className="edit-profile-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="edit-profile-btn-save" onClick={handleFormSubmit}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

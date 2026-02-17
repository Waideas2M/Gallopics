import React, { useState, useEffect } from 'react';
import { X, Camera, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css'; // Keep for shared input styles
import './EditProfileModal.css'; // New layout styles
import './Modal.css';
import { ModernDropdown } from './ModernDropdown';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();

    // State
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [country, setCountry] = useState('Sweden');
    const [city, setCity] = useState('');
    const [phoneCode, setPhoneCode] = useState('+46');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Options
    const countryOptions = [
        { label: 'Sweden', value: 'Sweden', icon: '🇸🇪' },
        { label: 'Norway', value: 'Norway', icon: '🇳🇴' },
        { label: 'Denmark', value: 'Denmark', icon: '🇩🇰' },
        { label: 'Finland', value: 'Finland', icon: '🇫🇮' },
        { label: 'United States', value: 'United States', icon: '🇺🇸' },
        { label: 'United Kingdom', value: 'United Kingdom', icon: '🇬🇧' },
        { label: 'Germany', value: 'Germany', icon: '🇩🇪' },
    ];

    const phoneCodeOptions = [
        { label: '+46', value: '+46' },
        { label: '+45', value: '+45' },
        { label: '+47', value: '+47' },
        { label: '+358', value: '+358' },
        { label: '+1', value: '+1' },
        { label: '+44', value: '+44' },
    ];

    // Initialize/Reset state when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setAvatarUrl(user.avatarUrl || null);
            setDisplayName(user.displayName || '');
            setCountry(user.city ? 'Sweden' : 'Sweden'); // Simplified for prototype
            setCity(user.city || '');
            setErrors({});
        }
    }, [isOpen, user]);

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

    if (!isOpen) return null;

    const handleAvatarUpload = () => {
        setAvatarUrl('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
    };

    const handleClearAvatar = () => {
        setAvatarUrl(null);
    };

    const handleSave = () => {
        const newErrors: { [key: string]: string } = {};
        if (!displayName.trim()) newErrors.displayName = 'Display Name is required';
        if (!country.trim()) newErrors.country = 'Country is required';
        if (!city.trim()) newErrors.city = 'City is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        updateProfile({
            avatarUrl: avatarUrl || undefined,
            displayName,
            city,
        });

        onClose();
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose} style={{ zIndex: 1100, alignItems: 'center' }}>
            <div
                className="edit-profile-modal-container"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* 1. Header (Sticky) */}
                <div className="modal-header-standard">
                    <h2 className="edit-profile-title">Edit Profile</h2>
                    <button className="edit-profile-close" onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>

                {/* 2. Body (Scrollable) */}
                <div className="modal-body-standard">

                    {/* A) Avatar Section */}
                    <div className="edit-profile-avatar-row">
                        <div className="edit-profile-avatar-preview">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={28} />
                            )}
                        </div>
                        <div className="edit-profile-avatar-actions">
                            <button className="edit-profile-upload-btn" onClick={handleAvatarUpload}>
                                <Camera size={16} />
                                {avatarUrl ? 'Change photo' : 'Upload photo'}
                            </button>
                            {avatarUrl && (
                                <button className="edit-profile-remove-btn" onClick={handleClearAvatar}>
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    {/* B) Form Fields Grid */}
                    <div className="edit-profile-form-grid">

                        {/* Display Name (Full Width) */}
                        <div className="edit-profile-full-width">
                            <label className="edit-profile-label">Display Name</label>
                            <input
                                type="text"
                                className={`auth-input ${errors.displayName ? 'error' : ''}`}
                                value={displayName}
                                onChange={(e) => {
                                    setDisplayName(e.target.value);
                                    if (errors.displayName) setErrors({ ...errors, displayName: '' });
                                }}
                                placeholder="e.g. Klara Fors"
                            />
                            {errors.displayName && <span className="auth-error-msg">{errors.displayName}</span>}
                        </div>

                        {/* Location Row (2 col) */}
                        <div className="edit-profile-full-width edit-profile-row-2col">
                            <div>
                                <label className="edit-profile-label">Country</label>
                                <ModernDropdown
                                    value={country}
                                    options={countryOptions}
                                    onChange={setCountry}
                                />
                            </div>
                            <div>
                                <label className="edit-profile-label">City</label>
                                <input
                                    type="text"
                                    className={`auth-input ${errors.city ? 'error' : ''}`}
                                    value={city}
                                    onChange={(e) => {
                                        setCity(e.target.value);
                                        if (errors.city) setErrors({ ...errors, city: '' });
                                    }}
                                    placeholder="e.g. Stockholm"
                                />
                                {errors.city && <span className="auth-error-msg">{errors.city}</span>}
                            </div>
                        </div>

                        {/* Mobile Number Row (2 col) */}
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
                                <label className="edit-profile-label">Mobile Number (Optional)</label>
                                <input
                                    type="tel"
                                    className="auth-input"
                                    placeholder="70 123 45 67"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. Footer (Sticky) */}
                <div className="modal-footer-actions">
                    <button className="edit-profile-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="edit-profile-btn-save" onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

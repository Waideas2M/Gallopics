import React, { useState, useEffect } from 'react';
import { X, Camera, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css'; // Keep for shared input styles
import './EditProfileModal.css'; // New layout styles

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
                <div className="edit-profile-header">
                    <h2 className="edit-profile-title">Edit Profile</h2>
                    <button className="edit-profile-close" onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>

                {/* 2. Body (Scrollable) */}
                <div className="edit-profile-body">

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

                        {/* Country (Left) */}
                        <div>
                            <label className="edit-profile-label">Country</label>
                            <select
                                className={`auth-select ${errors.country ? 'error' : ''}`}
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            >
                                <option value="Sweden">Sweden</option>
                                <option value="Norway">Norway</option>
                                <option value="Denmark">Denmark</option>
                                <option value="Finland">Finland</option>
                                <option value="United States">United States</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Germany">Germany</option>
                            </select>
                        </div>

                        {/* City (Right) */}
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

                        {/* Mobile Number (Full Width) */}
                        <div className="edit-profile-full-width">
                            <label className="edit-profile-label">Mobile Number (Optional)</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    type="text"
                                    className="auth-input"
                                    value={phoneCode}
                                    onChange={(e) => setPhoneCode(e.target.value)}
                                    style={{ width: '80px', textAlign: 'center', background: '#f9f9f9', color: '#111' }}
                                />
                                <input
                                    type="tel"
                                    className="auth-input"
                                    placeholder="70 123 45 67"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. Footer (Sticky) */}
                <div className="edit-profile-footer">
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

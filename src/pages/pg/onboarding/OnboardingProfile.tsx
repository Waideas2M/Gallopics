import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { User, Camera } from 'lucide-react';
import { useAuth, PROTOTYPE_USER } from '../../../context/AuthContext';
import '../../../components/AuthModal.css'; // Reuse form styles for consistency

export const OnboardingProfile: React.FC = () => {
    const navigate = useNavigate();
    const { updateProfile } = useAuth();

    // State
    const [avatarUrl, setAvatarUrl] = useState<string | null>(PROTOTYPE_USER.avatarUrl);
    const [displayName, setDisplayName] = useState(PROTOTYPE_USER.displayName); // Prefilled from PROTOTYPE_USER
    const [country, setCountry] = useState(PROTOTYPE_USER.country);
    const [city, setCity] = useState(PROTOTYPE_USER.city);
    const [phoneCode, setPhoneCode] = useState('+46');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Mock Avatar Upload
    const handleAvatarUpload = () => {
        // In real app, this would trigger file input
        // For prototype, just set a dummy image
        setAvatarUrl('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
    };

    const handleClearAvatar = () => {
        setAvatarUrl(null);
    };

    const handleContinue = () => {
        const newErrors: { [key: string]: string } = {};

        if (!displayName.trim()) newErrors.displayName = 'Display Name is required';
        if (!country.trim()) newErrors.country = 'Country is required';
        if (!city.trim()) newErrors.city = 'City is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Save to Global Store
        updateProfile({
            avatarUrl: avatarUrl || undefined, // undefined to ignore if null, or null is valid
            displayName,
            city,
            hasCompletedOnboarding: true
        });

        console.log('Saving Profile to Global Store');
        navigate('/pg/onboarding/ready');
    };

    const handleSkip = () => {
        // Save Defaults for Skipped Values to Global Store
        updateProfile({
            avatarUrl: avatarUrl || PROTOTYPE_USER.avatarUrl,
            displayName: displayName.trim() || PROTOTYPE_USER.displayName,
            city: city.trim() || PROTOTYPE_USER.city,
            hasCompletedOnboarding: true
        });

        console.log('Skipping Setup, saving defaults to Global Store');
        navigate('/pg/onboarding/ready');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa' }}>
            <Header />
            <div className="container" style={{ maxWidth: '600px', paddingTop: '60px', paddingBottom: '60px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Let's set up your profile</h1>
                <p style={{ color: '#666', marginBottom: '32px' }}>Add a photo and your location so buyers know who you are.</p>

                <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>

                    {/* 1. Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '20px',
                            color: '#999',
                            overflow: 'hidden',
                            position: 'relative',
                            border: '1px solid #e5e5e5'
                        }}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={32} />
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                            <button
                                onClick={handleAvatarUpload}
                                style={{ color: '#1B3AEC', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Camera size={16} />
                                {avatarUrl ? 'Change photo' : 'Upload photo'}
                            </button>

                            {avatarUrl && (
                                <button
                                    onClick={handleClearAvatar}
                                    style={{ color: '#ef4444', fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 2. Display Name */}
                    <div className="auth-input-group" style={{ marginBottom: '24px' }}>
                        <label className="auth-label" htmlFor="displayName">Display Name</label>
                        <input
                            id="displayName"
                            type="text"
                            className={`auth-input ${errors.displayName ? 'error' : ''}`}
                            value={displayName}
                            onChange={(e) => {
                                setDisplayName(e.target.value);
                                if (errors.displayName) setErrors({ ...errors, displayName: '' });
                            }}
                            placeholder={`e.g. ${PROTOTYPE_USER.displayName}`}
                        />
                        {errors.displayName && <span className="auth-error-msg">{errors.displayName}</span>}
                    </div>

                    {/* 3. Country */}
                    <div className="auth-input-group" style={{ marginBottom: '24px' }}>
                        <label className="auth-label" htmlFor="country">Country</label>
                        <select
                            id="country"
                            className={`auth-select ${errors.country ? 'error' : ''}`}
                            value={country}
                            onChange={(e) => {
                                setCountry(e.target.value);
                                if (errors.country) setErrors({ ...errors, country: '' });
                            }}
                        >
                            <option value="Sweden">Sweden</option>
                            <option value="Norway">Norway</option>
                            <option value="Denmark">Denmark</option>
                            <option value="Finland">Finland</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Germany">Germany</option>
                        </select>
                        {errors.country && <span className="auth-error-msg">{errors.country}</span>}
                    </div>

                    {/* 4. City */}
                    <div className="auth-input-group" style={{ marginBottom: '24px' }}>
                        <label className="auth-label" htmlFor="city">City</label>
                        <input
                            id="city"
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

                    {/* 5. Mobile Number */}
                    <div className="auth-input-group" style={{ marginBottom: '32px' }}>
                        <label className="auth-label" htmlFor="phone">Mobile Number (Optional)</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                className="auth-input"
                                value={phoneCode}
                                onChange={(e) => setPhoneCode(e.target.value)}
                                style={{ width: '80px', textAlign: 'center', background: '#f9f9f9', color: '#111' }}
                            />
                            <input
                                id="phone"
                                type="tel"
                                className="auth-input"
                                placeholder="70 123 45 67"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>

                    {/* CTAs */}
                    <button className="auth-btn-primary" onClick={handleContinue}>
                        Continue
                    </button>
                    <button
                        style={{ width: '100%', padding: '12px', marginTop: '12px', color: '#666', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                        onClick={handleSkip}
                    >
                        Skip for now
                    </button>

                </div>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera, Lock, Monitor, Link, Check } from 'lucide-react';
import { useAuth, PROTOTYPE_USER } from '../context/AuthContext';
import './AuthModal.css';

const PROTOTYPE_MODE = true;

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'signin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    initialTab = 'signin'
}) => {
    const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialTab);
    const [accountType, setAccountType] = useState<'photographer' | 'buyer'>('photographer');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [copied, setCopied] = useState(false);
    const isMobile = windowWidth < 768;

    // Window Resize Effect
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync state if initialTab changes (optional, but good if triggered from different buttons)
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div
                className="auth-modal-container"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
                    <X size={20} />
                </button>

                <div className="auth-modal-header">
                    <div className="auth-account-type-wrapper">
                        <button
                            className={`auth-type-btn ${accountType === 'photographer' ? 'active' : ''}`}
                            onClick={() => setAccountType('photographer')}
                        >
                            <Camera size={16} />
                            <span>I'm a photographer</span>
                        </button>
                        <button
                            className={`auth-type-btn ${accountType === 'buyer' ? 'active' : ''} disabled`}
                            onClick={() => { }}
                            disabled
                            title="Buyer accounts coming soon"
                        >
                            <Lock size={14} />
                            <span>I'm a buyer</span>
                        </button>
                    </div>

                    <div className="auth-tabs">
                        <button
                            className={`auth-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
                            onClick={() => setActiveTab('signin')}
                            role="tab"
                            aria-selected={activeTab === 'signin'}
                        >
                            Sign in
                        </button>
                        <button
                            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => setActiveTab('register')}
                            role="tab"
                            aria-selected={activeTab === 'register'}
                        >
                            Register
                        </button>
                    </div>
                </div>

                <div className="auth-modal-content">
                    {accountType === 'photographer' && isMobile ? (
                        <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '12px',
                                background: 'rgba(27, 58, 236, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: '#1B3AEC'
                            }}>
                                <Monitor size={28} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '10px', color: '#111' }}>
                                Use a desktop for photographer tools
                            </h2>
                            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '24px', fontSize: '0.9375rem' }}>
                                For the best experience, please open Gallopics on a desktop or laptop to upload and manage photos.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button className="auth-btn-primary" onClick={onClose} style={{ margin: 0 }}>
                                    Got it
                                </button>
                                <button
                                    className="auth-btn-oauth"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    style={{
                                        margin: 0,
                                        gap: '8px',
                                        color: copied ? '#10b981' : '#111',
                                        borderColor: copied ? '#10b981' : '#e5e5e5'
                                    }}
                                >
                                    {copied ? (
                                        <>
                                            <Check size={16} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Link size={16} />
                                            Copy link
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        activeTab === 'signin' ? <SignInForm /> : <RegisterForm />
                    )}
                </div>

                <div className="auth-modal-footer">
                    <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: '1.4', margin: 0 }}>
                        By continuing, you agree to our <a href="#" style={{ color: '#1B3AEC', textDecoration: 'underline' }}>Terms</a> and <a href="#" style={{ color: '#1B3AEC', textDecoration: 'underline' }}>Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

const SignInForm: React.FC = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { login } = useAuth();

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (PROTOTYPE_MODE) {
            console.log('Prototype Mode: Validation bypassed');
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                // In prototype mode, sign in to Profile Onboarding if "fresh", or Dashboard if "returning".
                // Since this is generic sign in, let's assume they might need to finish onboarding if not done.
                // For simplicity: Go to onboarding profile always to update details, or logic in future could check profile.
                // Request says: "Register success -> Onboarding", "Reaching You're ready -> Signed in".

                // Let's assume sign-in here sets a "User" and redirects to workspace for now:
                login({ ...PROTOTYPE_USER, hasCompletedOnboarding: true }); // Mock returning user
                navigate('/pg');
            }, 800);
            return;
        }

        if (!validate()) return;

        setIsLoading(true);
        // Mock API call
        setTimeout(() => {
            setIsLoading(false);
            login({ ...PROTOTYPE_USER, hasCompletedOnboarding: true });
            navigate('/pg');
        }, 1500);
    };

    return (
        <div className="auth-form-wrapper">
            <div className="auth-oauth-group">
                <button
                    className="auth-btn-oauth"
                    onClick={() => {
                        console.log('Google Auth');
                        login({ ...PROTOTYPE_USER, hasCompletedOnboarding: true });
                        navigate('/pg');
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>
                <button className="auth-btn-oauth">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.77.56 3.48 1.54-3.22 1.66-2.69 5.8 1.25 7.45-.63 1.75-1.61 3.16-3.32 4.04zM12.03 7.25c-.25-2.19 1.62-4.04 3.55-4.25.29 2.58-2.63 4.41-3.55 4.25z" />
                    </svg>
                    Continue with Apple
                </button>
            </div>

            <div className="auth-divider">or</div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-input-group">
                    <label className="auth-label" htmlFor="signin-email">Email</label>
                    <input
                        id="signin-email"
                        type="email"
                        className={`auth-input ${errors.email ? 'error' : ''}`}
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        disabled={isLoading}
                    />
                    {errors.email && <span className="auth-error-msg">{errors.email}</span>}
                </div>

                <div className="auth-input-group">
                    <label className="auth-label" htmlFor="signin-password">Password</label>
                    <input
                        id="signin-password"
                        type="password"
                        className={`auth-input ${errors.password ? 'error' : ''}`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        disabled={isLoading}
                    />
                    {errors.password && <span className="auth-error-msg">{errors.password}</span>}
                </div>

                <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>

                <a href="#" className="auth-helper-link">
                    Forgot password?
                </a>
            </form>
        </div>
    );
};

const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { login } = useAuth();

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (PROTOTYPE_MODE) {
            console.log('Prototype Mode: Validation bypassed');
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                // Register success -> Set signed in (incomplete onboarding) -> Go to Onboarding
                login({
                    displayName: formData.firstName ? `${formData.firstName} ${formData.lastName}` : PROTOTYPE_USER.displayName,
                    city: PROTOTYPE_USER.city,
                    avatarUrl: PROTOTYPE_USER.avatarUrl,
                    hasCompletedOnboarding: false
                });
                navigate('/pg/onboarding/profile');
            }, 800);
            return;
        }

        if (!validate()) return;

        setIsLoading(true);
        // Mock API call
        setTimeout(() => {
            setIsLoading(false);
            console.log('Register success with:', formData);
            login({
                displayName: `${formData.firstName} ${formData.lastName}`,
                city: PROTOTYPE_USER.city,
                avatarUrl: PROTOTYPE_USER.avatarUrl,
                hasCompletedOnboarding: false
            });
            navigate('/pg/onboarding/profile');
        }, 1500);
    };

    return (
        <div className="auth-form-wrapper">
            <div className="auth-oauth-group">
                <button
                    className="auth-btn-oauth"
                    onClick={() => {
                        console.log('Google Auth');
                        // Mock Google Auth Success -> Onboarding
                        login({ displayName: 'Google User', city: '', hasCompletedOnboarding: false });
                        navigate('/pg/onboarding/profile');
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>
                <button className="auth-btn-oauth">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.77.56 3.48 1.54-3.22 1.66-2.69 5.8 1.25 7.45-.63 1.75-1.61 3.16-3.32 4.04zM12.03 7.25c-.25-2.19 1.62-4.04 3.55-4.25.29 2.58-2.63 4.41-3.55 4.25z" />
                    </svg>
                    Continue with Apple
                </button>
            </div>



            <div className="auth-divider">or</div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="auth-input-group" style={{ flex: 1 }}>
                        <label className="auth-label" htmlFor="reg-fname">First Name</label>
                        <input
                            id="reg-fname"
                            type="text"
                            className={`auth-input ${errors.firstName ? 'error' : ''}`}
                            placeholder="Given Name"
                            value={formData.firstName}
                            onChange={(e) => {
                                setFormData({ ...formData, firstName: e.target.value });
                                if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                            }}
                            disabled={isLoading}
                        />
                        {errors.firstName && <span className="auth-error-msg">{errors.firstName}</span>}
                    </div>
                    <div className="auth-input-group" style={{ flex: 1 }}>
                        <label className="auth-label" htmlFor="reg-lname">Last Name</label>
                        <input
                            id="reg-lname"
                            type="text"
                            className={`auth-input ${errors.lastName ? 'error' : ''}`}
                            placeholder="Family Name"
                            value={formData.lastName}
                            onChange={(e) => {
                                setFormData({ ...formData, lastName: e.target.value });
                                if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                            }}
                            disabled={isLoading}
                        />
                        {errors.lastName && <span className="auth-error-msg">{errors.lastName}</span>}
                    </div>
                </div>

                <div className="auth-input-group">
                    <label className="auth-label" htmlFor="reg-email">Email</label>
                    <input
                        id="reg-email"
                        type="email"
                        className={`auth-input ${errors.email ? 'error' : ''}`}
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        disabled={isLoading}
                    />
                    {errors.email && <span className="auth-error-msg">{errors.email}</span>}
                </div>

                <div className="auth-input-group">
                    <label className="auth-label" htmlFor="reg-password">Password</label>
                    <input
                        id="reg-password"
                        type="password"
                        className={`auth-input ${errors.password ? 'error' : ''}`}
                        placeholder="Min 8 chars"
                        value={formData.password}
                        onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        disabled={isLoading}
                    />
                    {errors.password && <span className="auth-error-msg">{errors.password}</span>}
                </div>

                <div className="auth-input-group">
                    <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
                    <input
                        id="reg-confirm"
                        type="password"
                        className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                            setFormData({ ...formData, confirmPassword: e.target.value });
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                        }}
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && <span className="auth-error-msg">{errors.confirmPassword}</span>}
                </div>

                <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create account'}
                </button>


            </form>
        </div>
    );
};

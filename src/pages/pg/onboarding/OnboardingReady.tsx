import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { CheckCircle, CreditCard, ChevronRight } from 'lucide-react';
import '../../../components/AuthModal.css';

export const OnboardingReady: React.FC = () => {
    const navigate = useNavigate();

    const handleFinish = () => {
        // User is already signed in from previous steps
        navigate('/pg'); // Go to Workspace
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa' }}>
            <Header />
            <div className="container" style={{ maxWidth: '600px', paddingTop: '80px', paddingBottom: '60px', textAlign: 'center' }}>

                <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={32} />
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '16px', color: '#111' }}>You're ready to start</h1>
                <p style={{ color: '#666', marginBottom: '40px', fontSize: '1.1rem' }}>
                    You can now upload galleries, manage events, and customize your storefront.
                </p>

                {/* Non-blocking Payout Card */}
                <div style={{ textAlign: 'left', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '24px', marginBottom: '32px', display: 'flex', gap: '16px', position: 'relative' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexShrink: 0 }}>
                        <CreditCard size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Complete payout setup to start selling</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>You can upload photos now, but you'll need to add banking details before you can receive payments.</p>
                    </div>
                    <button
                        onClick={() => navigate('/pg/billing')}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        aria-label="Set up payouts"
                    />
                    <div style={{ display: 'flex', alignItems: 'center', color: '#1B3AEC' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Set up</span>
                        <ChevronRight size={16} />
                    </div>
                </div>

                <button
                    className="auth-btn-primary"
                    onClick={handleFinish}
                    style={{ maxWidth: '320px', margin: '0 auto' }}
                >
                    Go to Workspace
                </button>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { Check, Zap, CreditCard, Smartphone, SmartphoneNfc } from 'lucide-react';
import './CheckoutPanel.css';

interface CheckoutPanelProps {
    total: number;
    onPay?: (email: string, method: string) => void;
}

export const CheckoutPanel: React.FC<CheckoutPanelProps> = ({ total, onPay }) => {
    const [email, setEmail] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('swish');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'input' | 'verify' | 'verified'>('input');
    const [countdown, setCountdown] = useState(0);

    const [secretCode, setSecretCode] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [otpError, setOtpError] = useState<string | null>(null);

    // Check storage for verified email
    React.useEffect(() => {
        const saved = sessionStorage.getItem('gallopics_verified_email') || localStorage.getItem('gallopics_verified_email');
        if (saved) {
            setEmail(saved);
            setStep('verified');
        }
    }, []);

    const generateCode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setSecretCode(code);
        console.log('Gallopics Mock OTP:', code); // For demo purposes
        return code;
    };

    const handleSendCode = () => {
        if (!email) return;
        generateCode();
        setStep('verify');
        setCountdown(30);
        setAttempts(0);
        setOtpError(null);
    };

    const handleVerify = () => {
        if (attempts >= 5) {
            setOtpError('Too many failed attempts. Please resend code.');
            return;
        }

        if (otp === secretCode || otp === '123456') { // Allow 123456 as easy fallback
            setStep('verified');
            setOtpError(null);
            // Save to storage
            sessionStorage.setItem('gallopics_verified_email', email);
            localStorage.setItem('gallopics_verified_email', email);
        } else {
            setAttempts(prev => prev + 1);
            setOtpError('Incorrect code. Try again.');
        }
    };

    const handleChangeEmail = () => {
        setStep('input');
        setOtp('');
        setOtpError(null);
        setAttempts(0);
    };

    const handleClearVerified = () => {
        setStep('input');
        setEmail('');
        setOtp('');
        sessionStorage.removeItem('gallopics_verified_email');
        localStorage.removeItem('gallopics_verified_email');
    };

    const handleResend = () => {
        generateCode();
        setCountdown(30);
        setAttempts(0);
        setOtpError(null);
    };

    // Countdown effect
    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onPay) {
            onPay(email, paymentMethod);
        } else {
            alert(`Processing ${paymentMethod} payment for ${total} SEK\nReceipt sent to: ${email}`);
        }
    };

    const isVerified = step === 'verified';

    return (
        <div className="checkout-panel">
            <h3 className="checkout-title">Checkout</h3>

            <form onSubmit={handleSubmit} className="checkout-form">
                <div className="form-group">
                    <label htmlFor="email">Email verification</label>
                    <div className="email-otp-steps">
                        {step === 'input' && (
                            <div className="input-with-button">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="email-input"
                                />
                                <button
                                    type="button"
                                    className="btn-verify"
                                    onClick={handleSendCode}
                                    disabled={!email.includes('@')}
                                >
                                    Send code
                                </button>
                            </div>
                        )}

                        {step === 'verify' && (
                            <div className="verify-step">
                                <div className="input-with-button">
                                    <input
                                        type="text"
                                        placeholder="6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        className="email-input"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="btn-verify"
                                        onClick={handleVerify}
                                        disabled={otp.length !== 6}
                                    >
                                        Verify
                                    </button>
                                </div>
                                <div className="otp-actions">
                                    <button
                                        type="button"
                                        className="link-action"
                                        onClick={handleResend}
                                        disabled={countdown > 0}
                                    >
                                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                                    </button>
                                    <button type="button" className="link-action" onClick={handleChangeEmail}>
                                        Change email
                                    </button>
                                </div>
                                {otpError ? (
                                    <p className="input-helper error-text">{otpError}</p>
                                ) : (
                                    <p className="input-helper">
                                        Enter the code sent to {email}. Code expires in 10 minutes.
                                    </p>
                                )}
                            </div>
                        )}

                        {step === 'verified' && (
                            <div className="email-verified-container">
                                <div className="input-with-button">
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="email-input verified"
                                    />
                                    <div className="verified-badge">
                                        Verified <Check size={14} />
                                    </div>
                                </div>
                                <div className="otp-actions" style={{ justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        className="link-action"
                                        onClick={handleClearVerified}
                                    >
                                        Not you?
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`payment-methods ${!isVerified ? 'disabled-section' : ''}`} style={{ opacity: isVerified ? 1 : 0.5, pointerEvents: isVerified ? 'auto' : 'none' }}>
                    <label>Select payment method</label>

                    <div className="methods-grid">
                        <label className={`method-option ${paymentMethod === 'swish' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="swish"
                                checked={paymentMethod === 'swish'}
                                onChange={() => setPaymentMethod('swish')}
                            />
                            <div className="method-content">
                                <div className="method-icon swish-brand">
                                    <Smartphone size={20} />
                                </div>
                                <div className="method-info">
                                    <span className="method-name">Swish</span>
                                    <span className="method-tag">Fastest</span>
                                </div>
                                <div className="method-check">
                                    <Check size={16} />
                                </div>
                            </div>
                        </label>

                        <label className={`method-option ${paymentMethod === 'klarna' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="klarna"
                                checked={paymentMethod === 'klarna'}
                                onChange={() => setPaymentMethod('klarna')}
                            />
                            <div className="method-content">
                                <div className="method-icon klarna-brand">
                                    <span className="brand-text">K.</span>
                                </div>
                                <div className="method-info">
                                    <span className="method-name">Klarna</span>
                                    <span className="method-tag">Pay later</span>
                                </div>
                                <div className="method-check">
                                    <Check size={16} />
                                </div>
                            </div>
                        </label>

                        <label className={`method-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="card"
                                checked={paymentMethod === 'card'}
                                onChange={() => setPaymentMethod('card')}
                            />
                            <div className="method-content">
                                <div className="method-icon">
                                    <CreditCard size={20} />
                                </div>
                                <div className="method-info">
                                    <span className="method-name">Card</span>
                                    <span className="method-tag">Visa, MC</span>
                                </div>
                                <div className="method-check">
                                    <Check size={16} />
                                </div>
                            </div>
                        </label>

                        <label className={`method-option ${paymentMethod === 'digital' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="digital"
                                checked={paymentMethod === 'digital'}
                                onChange={() => setPaymentMethod('digital')}
                            />
                            <div className="method-content">
                                <div className="method-icon">
                                    <SmartphoneNfc size={20} />
                                </div>
                                <div className="method-info">
                                    <span className="method-name">Apple / Google</span>
                                    <span className="method-tag">One-tap</span>
                                </div>
                                <div className="method-check">
                                    <Check size={16} />
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <button type="submit" className="btn-pay-total">
                    Pay {total} SEK
                </button>

                <div className="checkout-trust-area">
                    <div className="checkout-trust-line">
                        <div className="trust-item trust-payment">
                            <Check size={14} className="trust-icon" />
                            <span>Secure payment</span>
                        </div>
                        <div className="trust-item trust-download">
                            <Zap size={14} className="trust-icon" />
                            <span>Instant download</span>
                        </div>
                    </div>
                    <div className="checkout-footnote">
                        We’ll send the download link to your verified email after payment (valid 24h). JPEG format.
                    </div>
                </div>
            </form>
        </div>
    );
};

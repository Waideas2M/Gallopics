import React, { useState, useEffect } from 'react';
import { X, Send, Mail, MessageSquare, Loader2, Tag } from 'lucide-react';
import './ContactSupportModal.css';
import './Modal.css';

interface ContactSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type UserRole = 'Photo buyer' | 'Photographer' | 'Event organiser';

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
    isOpen,
    onClose
}) => {
    const [role, setRole] = useState<UserRole>('Photo buyer');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+46');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<{ email?: string; subject?: string; message?: string }>({});

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setRole('Photo buyer');
            setEmail('');
            setCountryCode('+46');
            setPhone('');
            setSubject('');
            setMessage('');
            setStatus('idle');
            setErrors({});
        }
    }, [isOpen]);

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

    const validate = () => {
        const newErrors: { email?: string; subject?: string; message?: string } = {};
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!subject) {
            newErrors.subject = 'Subject is required';
        } else if (subject.length < 3) {
            newErrors.subject = 'Subject must be at least 3 characters';
        }

        if (!message) {
            newErrors.message = 'Message is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setStatus('sending');

        const composedPhone = phone ? `${countryCode}${phone.replace(/\s+/g, '')}` : '';

        const payload = { role, email, phone: composedPhone, subject, message };
        console.log('Sending contact support message:', payload);

        // Mock API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStatus('success');

            // Dispatch success toast event
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { type: 'success', message: 'Message sent successfully! We will get back to you soon.' }
            }));

            // Close after a short delay to let user see success state if we didn't use toast
            // But prompt says "show success toast and close the modal"
            setTimeout(() => {
                onClose();
            }, 500);

        } catch (error) {
            setStatus('error');
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { type: 'danger', message: 'Failed to send message. Please try again.' }
            }));
        }
    };

    if (!isOpen) return null;

    const roles: UserRole[] = ['Photo buyer', 'Photographer', 'Event organiser'];

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div
                className="auth-modal-container contact-support-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
                    <X size={20} />
                </button>

                <div className="modal-header-standard">
                    <h2 className="support-modal-title">Contact support</h2>
                </div>

                <div className="modal-body-standard">
                    <form id="contact-support-form" className="auth-form" onSubmit={handleSubmit}>
                        {/* Segmented Control for Role */}
                        <div className="auth-input-group">
                            <label className="auth-label">I'm contacting you as</label>
                            <div className="support-role-selector">
                                {roles.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        className={`role-btn ${role === r ? 'active' : ''}`}
                                        onClick={() => setRole(r)}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="support-email">Email</label>
                            <div className="input-with-icon">
                                <Mail size={16} className="support-input-icon" />
                                <input
                                    id="support-email"
                                    type="email"
                                    className={`auth-input ${errors.email ? 'error' : ''}`}
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                    disabled={status === 'sending'}
                                />
                            </div>
                            {errors.email && <span className="auth-error-msg">{errors.email}</span>}
                        </div>

                        {/* Phone */}
                        <div className="phone-control-wrapper">
                            <label className="auth-label" htmlFor="support-phone">Phone number (optional)</label>
                            <div className="phone-input-container">
                                <select
                                    className="country-code-select"
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    disabled={status === 'sending'}
                                >
                                    <option value="+46">+46</option>
                                    <option value="+47">+47</option>
                                    <option value="+45">+45</option>
                                    <option value="+358">+358</option>
                                    <option value="+1">+1</option>
                                    <option value="+44">+44</option>
                                    <option value="+49">+49</option>
                                </select>
                                <input
                                    id="support-phone"
                                    type="tel"
                                    className="phone-number-input"
                                    placeholder="07X XXX XX XX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={status === 'sending'}
                                />
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="support-subject">Subject</label>
                            <div className="input-with-icon">
                                <Tag size={16} className="support-input-icon" />
                                <input
                                    id="support-subject"
                                    type="text"
                                    className={`auth-input ${errors.subject ? 'error' : ''}`}
                                    placeholder="Subject"
                                    value={subject}
                                    onChange={(e) => {
                                        setSubject(e.target.value);
                                        if (errors.subject) setErrors({ ...errors, subject: undefined });
                                    }}
                                    disabled={status === 'sending'}
                                />
                            </div>
                            {errors.subject && <span className="auth-error-msg">{errors.subject}</span>}
                        </div>

                        {/* Message */}
                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="support-message">How can we help?</label>
                            <div className="input-with-icon align-top">
                                <MessageSquare size={16} className="support-input-icon" />
                                <textarea
                                    id="support-message"
                                    className={`auth-input support-textarea ${errors.message ? 'error' : ''}`}
                                    placeholder="Describe your issue..."
                                    value={message}
                                    onChange={(e) => {
                                        setMessage(e.target.value);
                                        if (errors.message) setErrors({ ...errors, message: undefined });
                                    }}
                                    disabled={status === 'sending'}
                                />
                            </div>
                            {errors.message && <span className="auth-error-msg">{errors.message}</span>}
                        </div>
                    </form>
                </div>

                <div className="modal-footer-actions" style={{ flexDirection: 'column', height: 'auto', gap: '16px' }}>
                    <div className="support-actions" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="button"
                            className="btn-support-secondary"
                            onClick={onClose}
                            disabled={status === 'sending'}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="contact-support-form"
                            className="auth-btn-primary support-submit"
                            disabled={status === 'sending'}
                            style={{ width: 'auto', padding: '0 24px' }}
                        >
                            {status === 'sending' ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    <span>Send message</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="support-footer-links" style={{ borderTop: 'none', padding: 0 }}>
                        <a href="#" className="support-link">FAQs</a>
                        <span className="support-dot">•</span>
                        <a href="#" className="support-link">Terms</a>
                        <span className="support-dot">•</span>
                        <a href="#" className="support-link">Privacy</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

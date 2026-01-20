import React, { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Billing.css';

export const PhotographerBilling: React.FC = () => {
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'SE' // Default to Sweden
    });

    const handleSave = () => {
        // Mock save
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ background: '#fff' }}>
            <div className="billing-container" style={{ padding: 0, maxWidth: '800px' }}>
                {/* 
                <button
                    onClick={() => navigate(-1)}
                    style={{ display: 'flex', alignItems: 'center', color: '#666', marginBottom: '24px', border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    <ChevronLeft size={16} style={{ marginRight: '4px' }} />
                    Back
                </button>
                */}

                <div className="billing-section" style={{ marginTop: 0 }}>
                    <div className="billing-section-header">
                        <h2 className="billing-title">Billing Address</h2>
                        <p className="billing-subtitle">This address is used for tax purposes and your invoices.</p>
                    </div>

                    <div className="billing-form-grid">
                        <div className="billing-input-group billing-form-full">
                            <label className="billing-label">Street Address</label>
                            <input
                                name="street"
                                className="billing-input"
                                placeholder="e.g. 123 Main St, Apt 4B"
                                value={formData.street}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="billing-input-group">
                            <label className="billing-label">City</label>
                            <input
                                name="city"
                                className="billing-input"
                                placeholder="New York"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="billing-input-group">
                            <label className="billing-label">State / Province</label>
                            <input
                                name="state"
                                className="billing-input"
                                placeholder="NY"
                                value={formData.state}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="billing-input-group">
                            <label className="billing-label">Zip / Postal Code</label>
                            <input
                                name="zip"
                                className="billing-input"
                                placeholder="10001"
                                value={formData.zip}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="billing-input-group">
                            <label className="billing-label">Country</label>
                            <select
                                name="country"
                                className="billing-select"
                                value={formData.country}
                                onChange={handleChange}
                            >
                                <option value="US">United States</option>
                                <option value="CA">Canada</option>
                                <option value="GB">United Kingdom</option>
                                <option value="AU">Australia</option>
                                <option value="DE">Germany</option>
                                <option value="FR">France</option>
                                <option value="SE">Sweden</option>
                            </select>
                        </div>

                        <div className="billing-form-full" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="billing-save-btn" onClick={handleSave}>
                                {saved ? (
                                    <>
                                        <Check size={16} style={{ marginRight: '8px' }} />
                                        Saved
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="billing-section">
                    <div className="billing-section-header">
                        <h2 className="billing-title">Payout Method</h2>
                        <p className="billing-subtitle">Connect your bank account or debit card to receive earnings.</p>
                    </div>
                    <div style={{ padding: '24px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center', border: '1px dashed #ccc' }}>
                        <p style={{ fontWeight: 500, color: '#333' }}>Stripe Connect Integration</p>
                        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>This module will be implemented next.</p>
                        <button className="billing-save-btn secondary" style={{ marginTop: '16px' }} disabled>
                            Connect Stripe
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

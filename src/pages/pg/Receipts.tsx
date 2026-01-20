import React from 'react';
import { FileText, Download } from 'lucide-react';

export const Receipts: React.FC = () => {
    // Mock data for receipts
    const mockReceipts = [
        { id: 'REC-001', date: '2026-01-15', amount: '€1,250.00', status: 'Paid', description: 'Payout for Dec 2025' },
        { id: 'REC-002', date: '2025-12-15', amount: '€850.00', status: 'Paid', description: 'Payout for Nov 2025' },
        { id: 'REC-003', date: '2025-11-15', amount: '€2,100.00', status: 'Paid', description: 'Payout for Oct 2025' },
    ];

    return (
        <div className="pg-receipts">
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0' }}>Receipts</h1>
                <p style={{ color: '#666', margin: 0 }}>Download and manage your payout receipts and invoices.</p>
            </header>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f9f9f9', borderBottom: '1px solid #eaeaea' }}>
                        <tr>
                            <th style={{ padding: '16px 20px', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>ID</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Date</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Description</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Amount</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Status</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600, fontSize: '0.85rem', color: '#666', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockReceipts.map(receipt => (
                            <tr key={receipt.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: 500 }}>{receipt.id}</td>
                                <td style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#666' }}>{receipt.date}</td>
                                <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>{receipt.description}</td>
                                <td style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: 600 }}>{receipt.amount}</td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: '#f0fdf4',
                                        color: '#166534'
                                    }}>
                                        {receipt.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#1B3AEC',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: 500
                                    }}>
                                        <Download size={16} />
                                        PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '24px' }}>
                <div style={{
                    flex: 1,
                    padding: '24px',
                    background: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '10px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <FileText size={20} color="#1B3AEC" />
                        </div>
                        <h4 style={{ margin: 0 }}>Payout Details</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 16px 0' }}>
                        Payouts are processed automatically on the 15th of every month for the previous month's sales.
                    </p>
                    <button style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}>
                        Update payout method
                    </button>
                </div>
            </div>
        </div>
    );
};

import type { Meta, StoryObj } from '@storybook/react';
import { Share2, Plus, ShoppingBag, Check } from 'lucide-react';

const meta: Meta = {
    title: 'Core/Button',
    parameters: {
        layout: 'padded',
    },
};

export default meta;

export const Variants: StoryObj = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button className="btn-primary">Primary Button</button>
                <button className="btn-primary"><ShoppingBag size={18} /> With Icon</button>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button className="btn-outline">Outline Button</button>
                <button className="btn-outline"> <Share2 size={18} /> With Icon</button>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Simulating btn-success-pill from PhotoDetail */}
                <button className="btn-success-pill" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0 24px', height: '48px', borderRadius: '99px',
                    backgroundColor: '#ecfdf5', borderColor: '#10b981', color: '#047857', border: '1px solid', fontWeight: 600
                }}>
                    <Check size={18} /> Success Pill
                </button>
            </div>
        </div>
    ),
};

export const IconButtons: StoryObj = {
    render: () => (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#ccc', padding: 20 }}>
            <div title="icon-btn-glass (Dark background context)">
                <button className="icon-btn-glass">
                    <Share2 size={18} />
                </button>
            </div>
            <div title="icon-btn-glass added">
                <button className="icon-btn-glass added">
                    <Check size={18} />
                </button>
            </div>
            <div title="icon-btn (Standard)">
                <button className="icon-btn">
                    <ShoppingBag size={20} />
                </button>
            </div>
        </div>
    ),
};

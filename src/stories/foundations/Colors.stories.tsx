import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
    title: 'Foundations/Colors',
    parameters: {
        layout: 'padded',
    },
};

export default meta;

export const Brand: StoryObj = {
    render: () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            <ColorSwatch name="--color-brand-primary" value="#1B3AEC" />
            <ColorSwatch name="--color-brand-primary-hover" value="#152dbb" />
            <ColorSwatch name="--color-brand-tint" value="rgba(27, 58, 236, 0.08)" />
            <ColorSwatch name="--color-brand-tint-strong" value="rgba(27, 58, 236, 0.12)" />
        </div>
    ),
};

export const Surface: StoryObj = {
    render: () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            <ColorSwatch name="--color-bg" value="#F9FAFB" />
            <ColorSwatch name="--color-surface" value="#ffffff" />
            <ColorSwatch name="--color-border" value="#e5e5e5" />
        </div>
    ),
};

export const Text: StoryObj = {
    render: () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            <ColorSwatch name="--color-text-primary" value="#111111" />
            <ColorSwatch name="--color-text-secondary" value="#666666" />
            <ColorSwatch name="--color-accent" value="#000000" />
        </div>
    ),
};

const ColorSwatch = ({ name, value }: { name: string; value: string }) => (
    <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ height: '100px', backgroundColor: `var(${name})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.8)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{value}</span>
        </div>
        <div style={{ padding: '12px' }}>
            <code style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>{name}</code>
        </div>
    </div>
);

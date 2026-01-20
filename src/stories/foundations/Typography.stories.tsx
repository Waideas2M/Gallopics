import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
    title: 'Foundations/Typography',
    parameters: {
        layout: 'padded',
    },
};

export default meta;

export const Headings: StoryObj = {
    render: () => (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-semibold)', margin: 0 }}>Heading 1 (2xl)</h1>
                <code>variable: --fs-2xl</code>
            </div>
            <div>
                <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 'var(--fw-semibold)', margin: 0 }}>Heading 2 (xl)</h2>
                <code>variable: --fs-xl</code>
            </div>
            <div>
                <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-medium)', margin: 0 }}>Heading 3 (lg)</h3>
                <code>variable: --fs-lg</code>
            </div>
            <div>
                <h4 style={{ fontSize: 'var(--fs-base)', fontWeight: 'var(--fw-medium)', margin: 0 }}>Heading 4 (base)</h4>
                <code>variable: --fs-base</code>
            </div>
        </div>
    ),
};

export const Body: StoryObj = {
    render: () => (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div>
                <p style={{ fontSize: 'var(--fs-base)', margin: 0 }}>Body text (base). The quick brown fox jumps over the lazy dog.</p>
                <code>variable: --fs-base</code>
            </div>
            <div>
                <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>Small text (sm). Used for secondary info.</p>
                <code>variable: --fs-sm</code>
            </div>
            <div>
                <p style={{ fontSize: 'var(--fs-xs)', margin: 0 }}>Extra small (xs). Used for captions/badges.</p>
                <code>variable: --fs-xs</code>
            </div>
        </div>
    ),
};

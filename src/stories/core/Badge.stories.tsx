import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
    title: 'Core/Badge',
    parameters: {
        layout: 'centered',
    },
};

export default meta;

export const StatusBadges: StoryObj = {
    render: () => (
        <div style={{ display: 'flex', gap: '16px' }}>
            <span className="pg-card-status-badge sold" style={{ position: 'static' }}>SOLD</span>
            <span className="pg-card-status-badge processing" style={{ position: 'static' }}>PROCESSING</span>
            <span className="pg-card-status-badge needsReview" style={{ position: 'static' }}>NEEDS REVIEW</span>
        </div>
    ),
};

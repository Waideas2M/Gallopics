import type { Meta, StoryObj } from '@storybook/react';
import { FolderEventCard } from '../../components/FolderEventCard';

const meta: Meta<typeof FolderEventCard> = {
    title: 'Composites/EventCard',
    component: FolderEventCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ width: 300 }}>
                <Story />
            </div>
        )
    ]
};

export default meta;
type Story = StoryObj<typeof FolderEventCard>;

const mockEvent = {
    id: 'e1',
    name: 'Falsterbo Horse Show',
    date: '2025-07-06',
    endDate: '2025-07-14',
    city: 'Falsterbo',
    coverImage: 'https://images.unsplash.com/photo-1534349762913-96c2255973c3?w=800&q=80',
    photoCount: 12500,
    photographerCount: 4,
    logo: 'https://images.unsplash.com/photo-1625575503022-794697e4113d?w=100&h=100&fit=crop',
    venue: 'Main Arena',
    discipline: 'Showjumping'
};

export const Default: Story = {
    args: {
        event: mockEvent,
        onClick: () => alert('Clicked event')
    },
};

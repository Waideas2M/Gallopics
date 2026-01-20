import type { Meta, StoryObj } from '@storybook/react';
import { PhotoCard } from '../../components/PhotoCard';
import { photos } from '../../data/mockData';

const meta: Meta<typeof PhotoCard> = {
    title: 'Composites/PhotoThumbnail',
    component: PhotoCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ width: '300px' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof PhotoCard>;

const mockPhoto = photos[0] || {
    id: 'p1',
    src: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80',
    width: 600,
    height: 400,
    rider: 'Alice Svensson',
    horse: 'Thunder',
    event: 'Stockholm Show',
    date: '2025-06-15',
    city: 'Stockholm',
    time: '14:30',
    eventId: 'e1',
    photographerId: 'pg1'
};

export const Default: Story = {
    args: {
        photo: mockPhoto,
        onClick: (p) => console.log('Clicked', p),
    },
};

export const Portrait: Story = {
    args: {
        photo: { ...mockPhoto, width: 400, height: 600 },
        onClick: (p) => console.log('Clicked', p),
    },
};

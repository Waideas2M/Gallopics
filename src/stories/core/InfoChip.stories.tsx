import type { Meta, StoryObj } from '@storybook/react';
import { InfoChip } from '../../components/InfoChip';

const meta: Meta<typeof InfoChip> = {
    title: 'Core/InfoChip',
    component: InfoChip,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InfoChip>;

export const Default: Story = {
    args: {
        label: 'Rider',
        name: 'Freja Nyström',
        fallbackIcon: 'user',
    },
};

export const WithAvatar: Story = {
    args: {
        label: 'Rider',
        name: 'Freja Nyström',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
};

export const Clickable: Story = {
    args: {
        label: 'Event',
        name: 'Falsterbo Horse Show',
        fallbackIcon: 'camera',
        onClick: () => alert('Clicked!'),
    },
};

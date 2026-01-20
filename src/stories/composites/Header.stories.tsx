import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '../../components/Header';

const meta: Meta<typeof Header> = {
    title: 'Composites/Header',
    component: Header,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};

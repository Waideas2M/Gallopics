import type { Preview } from '@storybook/react-vite'
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../src/context/CartContext';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // base layout
    layout: 'fullscreen',
    a11y: {
      test: 'todo'
    }
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
      <CartProvider>
      <div style= {{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', padding: '24px' }} >
  <Story />
  </div>
  </CartProvider>
  </BrowserRouter>
    ),
  ],
};

export default preview;
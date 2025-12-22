import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
    it('renders the title', () => {
        localStorage.clear();
        render(<App />);
        expect(screen.getByText(/Gjurmuesi i Simptomave/i)).toBeInTheDocument();
    });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SymptomForm from './SymptomForm';
import { describe, it, expect, vi } from 'vitest';

describe('SymptomForm', () => {
    it('renders input and select fields', () => {
        render(<SymptomForm onAddSymptom={() => { }} />);

        expect(screen.getByPlaceholderText(/Shkruaj simptomën/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Shto/i })).toBeInTheDocument();
    });

    it('updates input value on change', () => {
        render(<SymptomForm onAddSymptom={() => { }} />);

        const input = screen.getByPlaceholderText(/Shkruaj simptomën/i);
        fireEvent.change(input, { target: { value: 'Dhimbje koke' } });

        expect(input.value).toBe('Dhimbje koke');
    });

    it('calls onAddSymptom when submitted with valid data', () => {
        const handleAdd = vi.fn();
        render(<SymptomForm onAddSymptom={handleAdd} />);

        const input = screen.getByPlaceholderText(/Shkruaj simptomën/i);
        const button = screen.getByRole('button', { name: /Shto/i });

        fireEvent.change(input, { target: { value: 'Temperaturë' } });
        fireEvent.click(button);

        expect(handleAdd).toHaveBeenCalledTimes(1);
        expect(handleAdd).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Temperaturë',
            severity: 'low' // Default value
        }));
    });

    it('does not submit empty input', () => {
        const handleAdd = vi.fn();
        render(<SymptomForm onAddSymptom={handleAdd} />);

        const button = screen.getByRole('button', { name: /Shto/i });
        fireEvent.click(button);

        expect(handleAdd).not.toHaveBeenCalled();
    });
});

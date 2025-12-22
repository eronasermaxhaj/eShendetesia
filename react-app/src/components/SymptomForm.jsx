import React, { useState } from 'react';

function SymptomForm({ onAddSymptom }) {
    // Item 99: useState
    // Item 106: Controlled components
    const [symptom, setSymptom] = useState('');
    const [severity, setSeverity] = useState('low');

    const handleSubmit = (e) => {
        // Item 107: Prevent reload
        e.preventDefault();

        if (!symptom.trim()) return;

        // Item 95: Child to Parent communication via callback
        onAddSymptom({
            id: Date.now(),
            name: symptom,
            severity,
            date: new Date().toLocaleDateString('sq-AL')
        });

        // Reset State
        setSymptom('');
        setSeverity('low');
    };

    return (
        <form onSubmit={handleSubmit} className="form-row">
            <input
                type="text"
                placeholder="Shkruaj simptomën (psh. Dhimbje koke)"
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)} // Item 101: Event handler
                style={{ flex: 1 }}
            />

            <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
            >
                <option value="low">Lehtë (Low)</option>
                <option value="medium">Mesatare (Medium)</option>
                <option value="high">Rëndë (High)</option>
            </select>

            <button type="submit" className="btn-primary">Shto</button>
        </form>
    );
}

export default SymptomForm;

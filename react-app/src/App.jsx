import React, { useState, useEffect } from 'react';
import SymptomForm from './components/SymptomForm';
import SymptomList from './components/SymptomList';

function App() {
    // State to hold the list of reported symptoms
    const [symptoms, setSymptoms] = useState([]);

    // State to store the authenticated user context
    const [currentUser, setCurrentUser] = useState(null);

    /**
     * Effect Hook: Initialization
     * 1. Loads persisted local symptom data.
     * 2. Reads global authentication state from localStorage.
     */
    useEffect(() => {
        // Load Local Component State
        const saved = localStorage.getItem('my_symptoms');
        if (saved) {
            setSymptoms(JSON.parse(saved));
        }

        // Integration: Read Global Auth State from Main App
        const globalUser = localStorage.getItem('eShendetesia_currentUser');
        if (globalUser) {
            setCurrentUser(JSON.parse(globalUser));
        }
    }, []);

    /**
     * Effect Hook: Persistence
     * Automatically saves symptoms to localStorage whenever the state changes.
     */
    useEffect(() => {
        localStorage.setItem('my_symptoms', JSON.stringify(symptoms));
    }, [symptoms]);

    /**
     * Handler to add a new symptom to the list.
     * Uses functional state update to ensure reliability.
     * @param {Object} newSymptom 
     */
    const addSymptom = (newSymptom) => {
        setSymptoms((prev) => [newSymptom, ...prev]);
    };

    /**
     * Handler to remove a symptom by ID.
     * @param {string} id 
     */
    const deleteSymptom = (id) => {
        setSymptoms((prev) => prev.filter(s => s.id !== id));
    };

    return (
        <div className="container">
            {/* Header Section with personalized greeting */}
            {/* Header Section with personalized greeting */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>
                    🩺 Gjurmuesi
                    {currentUser && <div style={{ fontSize: '0.5em', color: '#718096', marginTop: '5px' }}>Pacienti: {currentUser.name}</div>}
                </h1>
                <a href="../patient-dashboard.html" style={{
                    textDecoration: 'none',
                    color: '#05468c',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '8px 16px',
                    backgroundColor: '#e2eef8',
                    borderRadius: '6px',
                    border: '1px solid #cbdcf0'
                }}>
                    ⬅ Kthehu në Ballinë
                </a>
            </div>

            {/* Input Component */}
            <SymptomForm onAddSymptom={addSymptom} />

            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            {/* List Display Component */}
            <SymptomList
                symptoms={symptoms}
                onDelete={deleteSymptom}
            />
        </div>
    );
}

export default App;

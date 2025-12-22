import React from 'react';

function SymptomList({ symptoms, onDelete }) { // Item 97: Receive props

    // Item 102: Conditional Rendering
    if (symptoms.length === 0) {
        return <p style={{ textAlign: 'center', color: '#718096' }}>Nuk ka simptoma të regjistruara sot.</p>;
    }

    return (
        <div>
            {/* Item 103: Array map with key */}
            {symptoms.map((symptom) => (
                <div key={symptom.id} className={`card severity-${symptom.severity}`}>
                    <div>
                        <strong>{symptom.name}</strong>
                        <span style={{ marginLeft: '10px', fontSize: '0.8em', color: '#718096' }}>
                            ({symptom.date})
                        </span>
                    </div>
                    <button
                        className="btn-delete"
                        onClick={() => onDelete(symptom.id)} // Item 101: Event Handler
                    >
                        Fshij
                    </button>
                </div>
            ))}
        </div>
    );
}

export default SymptomList;

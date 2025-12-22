
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = AuthService.getCurrentUser();
    const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];

    // Filter for current patient
    const myAppointments = appointments.filter(a => a.patientId === currentUser.id);

    // Separate Upcoming and History
    const now = new Date();
    const upcoming = myAppointments.filter(a => new Date(a.date) >= now && a.status !== 'completed' && a.status !== 'cancelled');
    const history = myAppointments.filter(a => new Date(a.date) < now || a.status === 'completed' || a.status === 'cancelled');

    // Render Upcoming
    const upcomingContainer = document.getElementById('upcoming-container');
    if (upcomingContainer) {
        if (upcoming.length === 0) {
            upcomingContainer.innerHTML = '<p class="no-data">Nuk keni termine të ardhshme.</p>';
        } else {
            let html = '';
            upcoming.forEach(app => {
                html += `
                <div class="appointment-card">
                    <div class="status-indicator ${app.status === 'confirmed' ? 'confirmed' : 'pending'}">
                        ${app.status === 'confirmed' ? 'I Konfirmuar' : 'Në Pritje'}
                    </div>
                    <div class="card-grid">
                        <div class="info-group">
                            <label>Procedura</label>
                            <p style="font-weight: 600; color: #2c5282;">
                                ${(() => {
                        const procMap = {
                            'ct': 'CT Scan',
                            'xray': 'X-Ray',
                            'mri': 'MRI',
                            'ultra': 'Ultratingull',
                            'blood': 'Analiza Laboratorike',
                            'ecg': 'EKG',
                            'mammogram': 'Mamografi',
                            'biopsy': 'Biopsi',
                            'vaccine': 'Vaksinim',
                            'checkup': 'Kontrollë'
                        };
                        // Normalize input
                        const key = (app.procedure || '').toLowerCase();
                        // Return mapped value or capitalized original
                        return procMap[key] || (app.procedure ? app.procedure.charAt(0).toUpperCase() + app.procedure.slice(1) : (app.department || 'Padijtur'));
                    })()}
                            </p>
                        </div>
                        <div class="info-group">
                            <label>Institucioni</label>
                            <p>QKUK - ${app.department || 'I pacaktuar'}</p>
                        </div>
                        <div class="info-group">
                            <label>Data dhe Ora</label>
                            <p>${new Date(app.date).toLocaleString('sq-AL', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                        <div class="info-group">
                            <label>Mjeku Përgjegjës</label>
                            <p>${app.doctorName || 'I pacaktuar'}</p>
                        </div>
                        <div class="card-actions">
                            <button class="btn-primary" onclick="rescheduleAppointment('${app.id}')" style="background-color: #3182ce; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
                                <i class="fas fa-edit"></i> Ndrysho
                            </button>
                            <button class="btn-danger" onclick="cancelAppointment('${app.id}')">
                                <i class="fas fa-trash"></i> Anulo
                            </button>
                        </div>
                    </div>
                </div>`;
            });
            upcomingContainer.innerHTML = html;
        }
    }

    // Render History
    const historyContainer = document.getElementById('history-container');
    if (historyContainer) {
        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="no-data">Nuk keni histori të vizitave.</p>';
        } else {
            let html = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Institucioni</th>
                        <th>Reparti</th>
                        <th>Statusi</th>
                        <th>Raporti</th>
                    </tr>
                </thead>
                <tbody>`;

            history.forEach(app => {
                html += `
                <tr>
                    <td>${new Date(app.date).toLocaleDateString('sq-AL')}</td>
                    <td>QKUK</td>
                    <td>${app.department || '-'}</td>
                    <td><span class="badge ${app.status}">${app.status.toUpperCase()}</span></td>
                    <td>${app.status === 'completed' ? '<a href="#" class="download-link"><i class="fas fa-file-pdf"></i> Shkarko</a>' : '-'}</td>
                </tr>`;
            });

            html += '</tbody></table>';
            historyContainer.innerHTML = html;
        }
    }
});

function cancelAppointment(id) {
    if (confirm('A jeni i sigurt që dëshironi të anuloni këtë termin?')) {
        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
        const updated = appointments.map(a => {
            if (a.id === id) a.status = 'cancelled';
            return a;
        });
        localStorage.setItem('eShendetesia_appointments', JSON.stringify(updated));
        alert('Termini u anulua.');
        location.reload();
    }
}

function rescheduleAppointment(id) {
    if (confirm('Për të ndryshuar terminin, ky termin aktual do të anulohet dhe ju do të ridrejtoheni për të caktuar një të ri. A dëshironi të vazhdoni?')) {
        // Cancel first
        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
        const updated = appointments.map(a => {
            if (a.id === id) a.status = 'cancelled';
            return a;
        });
        localStorage.setItem('eShendetesia_appointments', JSON.stringify(updated));

        // Redirect
        window.location.href = 'patient-appointment.html';
    }
}

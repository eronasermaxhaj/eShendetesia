
AuthService.requireLogin('doctor');

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
});

function renderTable() {
    const tbody = document.getElementById('archive-table-body');
    const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];

    // Filter Completed (archive)
    const archive = appointments.filter(a => a.status === 'completed');

    if (archive.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nuk ka të dhëna në arkivë.</td></tr>';
    } else {
        let html = '';
        archive.forEach(app => {
            const dateObj = new Date(app.date);
            html += `
            <tr>
                <td>${app.patientId}</td>
                <td><strong>${app.patientName}</strong></td>
                <td>${app.procedure || app.department}</td>
                <td><span class="prio-badge medium">E Përfunduar</span></td>
                <td>${dateObj.toLocaleDateString('sq-AL')}</td>
                <td class="action-cells">
                    <button class="edit-icon" onclick="viewDetails('${app.id}')" title="Shiko Detajet" style="color: #3182ce; background: none; border: none; cursor: pointer; font-size: 1.1rem; margin-right: 10px;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="delete-icon" onclick="deleteRecord('${app.id}')" title="Fshij nga Arkiva" style="color: #e53e3e; background: none; border: none; cursor: pointer; font-size: 1.1rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        });
        tbody.innerHTML = html;
    }
}

// Functions exposed to window for inline onclick
window.deleteRecord = function (id) {
    if (confirm('A jeni i sigurt që dëshironi të fshini këtë rekord nga arkiva? Ky veprim nuk mund të kthehet.')) {
        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
        const updated = appointments.filter(a => a.id !== id);
        localStorage.setItem('eShendetesia_appointments', JSON.stringify(updated));
        renderTable();
        alert('Rekordi u fshi me sukses.');
    }
};

window.viewDetails = function (id) {
    const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
    const app = appointments.find(a => a.id === id);
    if (app) {
        alert(`Detajet e Vizitës:\n\nPacienti: ${app.patientName}\nID: ${app.patientId}\nData: ${new Date(app.date).toLocaleString()}\nProcedura: ${app.procedure || 'N/A'}\nMjeku: ${app.doctorName}`);
    }
};

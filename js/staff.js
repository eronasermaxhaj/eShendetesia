/**
 * Staff Dashboard Service
 * ------------------------------------------------------------------------------
 * Handles the logic for the Medical Staff (Nurse/Receptionist) interface.
 * 
 * Key Responsibilities:
 * - Patient Check-in: Managing the flow of patients arriving at the facility.
 * - Patient Search: Finding patient records quickly.
 * - Appointment Management: Scheduling new appointments (Offline/Manual mode).
 * - Queue Management: Updating appointment statuses (Arrived, Completed, etc.).
 */

const StaffService = {
    /**
     * Initializes the Staff Dashboard.
     */
    init: function () {
        console.log("Staff Dashboard Initialized");
        this.renderDoctorDropdown();
    },

    /**
     * Populates the doctor selection dropdown dynamically from available users.
     * Ensures consistent naming (Dr. Prefix).
     */
    renderDoctorDropdown: function () {
        const doctorSelect = document.getElementById('reg-doctor');
        if (!doctorSelect) return;

        const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];
        const doctors = users.filter(u => u.role === 'doctor');

        doctors.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;

            // Normalize Doctor Name Display
            const name = doc.name.trim();
            const hasPrefix = /^dr[\.\s]/i.test(name);
            option.textContent = hasPrefix ? name : `Dr. ${name}`;

            doctorSelect.appendChild(option);
        });
    },

    /**
     * Handles view switching in the Single Page Application (SPA) structure.
     * @param {string} viewName - The ID suffix of the view to show.
     */
    switchView: function (viewName) {
        // Reset active state on sidebar links
        document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));

        // Highlight active link
        // Note: 'registration' view maps to the same visual block as 'search' for UI simplicity
        const navId = viewName === 'search' ? 'nav-search' : (viewName === 'registration' ? 'nav-registration' : `nav-${viewName}`);

        const activeLink = document.getElementById(navId) || document.getElementById(`nav-${viewName}`);
        if (activeLink) activeLink.classList.add('active');

        // Hide all views
        ['view-search', 'view-appointments', 'view-settings'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Show requested view
        if (viewName === 'search' || viewName === 'registration') {
            document.getElementById('view-search').style.display = 'block';
        } else if (viewName === 'appointments') {
            document.getElementById('view-appointments').style.display = 'block';
            this.renderAppointments();
        } else if (viewName === 'settings') {
            document.getElementById('view-settings').style.display = 'block';
        }
    },

    /**
     * Searches for patients by Name or ID.
     * Displays results including today's appointment status.
     */
    searchPatient: function () {
        const query = document.getElementById('search-input').value.trim().toLowerCase();
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '';

        if (!query) {
            alert('Ju lutem shkruani ID ose Emrin!');
            return;
        }

        const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];

        // Filter users
        const patients = users.filter(u =>
            u.role === 'patient' &&
            (u.id.includes(query) || u.name.toLowerCase().includes(query))
        );

        // Handle No Results
        if (patients.length === 0) {
            // Intelligent suggestion: If query looks like an ID, suggest registration
            if (/^\d+$/.test(query) && query.length > 5) {
                resultsContainer.innerHTML = '<div style="padding:15px; background:#fff5f5; border-left:4px solid #c53030; color:#c53030;">Pacienti nuk u gjet. Ju lutem regjistrojeni më poshtë.</div>';
                resultsContainer.style.display = 'block';
                // Pre-fill ID in registration form
                document.getElementById('reg-id').value = query;
            } else {
                alert('Nuk u gjet asnjë pacient me këtë kriter.');
            }
            return;
        }

        // --- Render Results ---
        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
        const today = new Date().toISOString().split('T')[0];

        let html = '<div style="background:white; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">';

        patients.forEach(p => {
            // Find active appointments for this patient today
            const apps = appointments.filter(a =>
                a.patientId === p.id &&
                (a.date.startsWith(today) || true) && // Note: 'true' is for demo purposes to show all dates
                a.status !== 'cancelled'
            );

            html += `
                <div style="padding: 15px; border-bottom: 1px solid #edf2f7; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${p.name}</strong> <span style="color:#718096; font-size:0.9em;">(ID: ${p.id})</span>
                        <div style="font-size: 0.85em; color: #4a5568; margin-top: 4px;">
                            ${apps.length > 0 ? `<span style="color: green;">${apps.length} Termine sot</span>` : '<span style="color: orange;">Ska termine sot</span>'}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; align-items: center;">
                        ${apps.map(app => {
                // Render Status Buttons/Badges
                if (app.status === 'confirmed' || app.status === 'scheduled') {
                    return `<button onclick="StaffService.doCheckIn('${app.id}')" style="background: #3182ce; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                                            <i class="fas fa-check"></i> Check-in (${new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                        </button>`;
                } else if (app.status === 'arrived') {
                    return `<span style="background: #e6fffa; color: #2c7a7b; padding: 4px 8px; border-radius: 4px; font-size: 0.9em; border: 1px solid #b2f5ea;">
                                            <i class="fas fa-user-check"></i> Arritur
                                        </span>`;
                } else if (app.status === 'completed') {
                    return `<span style="background: #f0fff4; color: #38a169; padding: 4px 8px; border-radius: 4px; font-size: 0.9em; border: 1px solid #c6f6d5;">
                                            <i class="fas fa-check-circle"></i> E Përfunduar
                                        </span>`;
                } else {
                    return `<span style="font-size:0.9em; color:#718096; padding: 4px 8px; background: #edf2f7; border-radius: 4px;">${app.status}</span>`;
                }
            }).join('')}
                        
                        ${apps.length === 0 ? `<button onclick="document.getElementById('reg-id').value='${p.id}'; document.querySelector('.manual-form').scrollIntoView({behavior:'smooth'});" style="background: #edf2f7; color: #4a5568; border: 1px solid #cbd5e0; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-plus"></i> Cakto
                        </button>` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
    },

    /**
     * Marks a patient as 'Arrived' for their appointment.
     * @param {string} appId - Appointment ID
     */
    doCheckIn: function (appId) {
        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
        const index = appointments.findIndex(a => a.id === appId);
        if (index > -1) {
            appointments[index].status = 'arrived';
            localStorage.setItem('eShendetesia_appointments', JSON.stringify(appointments));
            alert('Statusi u përditësua në: Arritur');
            this.searchPatient(); // Refresh results to show new status
        }
    },

    /**
     * Handles manual appointment registration (Offline Mode).
     * Validates availability and prevents double-booking.
     * @param {Event} e 
     */
    handleManualRegister: function (e) {
        e.preventDefault();

        const id = document.getElementById('reg-id').value;
        const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];
        const patient = users.find(u => u.id === id && u.role === 'patient');

        if (!patient) {
            alert('Pacienti me këtë ID nuk u gjet në sistem! Ju lutem regjistroni pacientin fillimisht.');
            return;
        }

        const name = patient.name;
        const procedure = document.getElementById('reg-procedure').value;
        const date = document.getElementById('reg-date').value;
        const time = document.getElementById('reg-time').value;
        const doctor = document.getElementById('reg-doctor').value;

        // Lookup doctor friendly name
        const doctorName = users.find(u => u.id === doctor && u.role === 'doctor')?.name || `Dr. (ID: ${doctor})`;

        // --- VALIDATION: Prevent Double Booking ---
        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
        const requestedDateTime = `${date}T${time}`;

        const isBusy = appointments.some(app => {
            return app.doctorId === doctor && app.date === requestedDateTime && app.status !== 'cancelled';
        });

        if (isBusy) {
            alert('Gabim: Ky mjek tashmë ka një termin të rezervuar në këtë orar!');
            return;
        }

        const appointment = {
            id: Date.now().toString(),
            patientId: id,
            patientName: name,
            date: requestedDateTime,
            hospital: 'QKUK',
            doctorId: doctor,
            doctorName: doctorName,
            status: 'confirmed',
            procedure: procedure
        };

        appointments.push(appointment);
        localStorage.setItem('eShendetesia_appointments', JSON.stringify(appointments));

        alert(`Termini u regjistrua me sukses për: ${name}`);
        e.target.reset();

        // Use try-catch or checks to refresh list safely
        if (typeof this.renderAppointments === 'function') {
            this.renderAppointments();
        }
    },

    /**
     * Updates staff profile settings.
     * @param {Event} e 
     */
    updateSettings: function (e) {
        e.preventDefault();
        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;
        const currentUser = AuthService.getCurrentUser();

        if (currentPass !== currentUser.password) {
            alert('Fjalëkalimi aktual është i pasaktë!');
            return;
        }
        if (newPass !== confirmPass) {
            alert('Fjalëkalimet e reja nuk përputhen!');
            return;
        }

        const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];
        const index = users.findIndex(u => u.id === currentUser.id);
        if (index > -1) {
            users[index].password = newPass;
            localStorage.setItem('eShendetesia_users', JSON.stringify(users));
            currentUser.password = newPass;
            localStorage.setItem('eShendetesia_currentUser', JSON.stringify(currentUser));
            alert('Fjalëkalimi u ndryshua!');
            e.target.reset();
            this.switchView('search');
        }
    },

    /**
     * Completes an appointment and updates any associated medical orders.
     * @param {string} appointmentId 
     */
    completeAppointment: function (appointmentId) {
        if (!confirm('A jeni i sigurtë që procedura është përfunduar?')) return;

        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
        const index = appointments.findIndex(a => a.id === appointmentId);

        if (index > -1) {
            // 1. Mark Appointment Completed
            appointments[index].status = 'completed';
            localStorage.setItem('eShendetesia_appointments', JSON.stringify(appointments));

            // 2. Mark Associated Order Completed (if linked)
            const orderId = appointments[index].orderId;
            if (orderId) {
                const orders = JSON.parse(localStorage.getItem('eShendetesia_orders')) || [];
                const orderIndex = orders.findIndex(o => o.id === orderId);
                if (orderIndex > -1) {
                    orders[orderIndex].status = 'completed';
                    localStorage.setItem('eShendetesia_orders', JSON.stringify(orders));
                }
            }

            alert('Procedura u përfundua me sukses!');
            if (typeof this.renderAppointments === 'function') {
                this.renderAppointments();
            }
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    StaffService.init();
});

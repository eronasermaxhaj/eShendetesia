/**
 * Doctor Dashboard Service
 * ------------------------------------------------------------------------------
 * Handles the business logic for the Doctor's Portal.
 * 
 * Key Functions:
 * - Patient Management: Searching, viewing history.
 * - Appointment Management: Viewing today's schedule, completing visits.
 * - Medical Orders: Creating new diagnostic requests/referrals.
 * - Profile Management: Updating doctor details.
 */

const DoctorService = {
    /**
     * Initializes the doctor dashboard.
     */
    init: function () {
        this.displayDoctorName();
        this.attachEventListeners();
    },

    /**
     * Displays the logged-in doctor's name in the header.
     * Automatically adds "Dr." prefix if missing.
     */
    displayDoctorName: function () {
        const user = AuthService.getCurrentUser();
        const doctorNameElement = document.getElementById('doctorNameDisplay');

        if (user && user.role === 'doctor' && doctorNameElement) {
            // Ensure name starts with "Dr." for consistency
            const name = user.name.trim();
            const hasPrefix = /^dr[\.\s]/i.test(name);
            const displayName = hasPrefix ? name : `Dr. ${name}`;
            doctorNameElement.innerHTML = `<i class="fas fa-user-md"></i> ${displayName}`;
        }
    },

    /**
     * Attaches all global event listeners for the dashboard.
     * Centralizes event handling for cleaner code.
     */
    attachEventListeners: function () {
        // Logout Handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthService.logout();
            });
        }

        // --- Navigation Handlers ---
        const navNewOrder = document.getElementById('nav-new-order');
        const navAppointments = document.getElementById('nav-appointments');
        const navSettings = document.getElementById('nav-settings');

        if (navNewOrder) {
            navNewOrder.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView('new-order');
            });
        }

        if (navAppointments) {
            navAppointments.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView('appointments');
            });
        }

        if (navSettings) {
            navSettings.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView('settings');
            });
        }

        // Settings Form Save Handler
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        // Patient Search Logic (Auto-fill on ID blur or Enter)
        const patientIdInput = document.getElementById('patientIdInput');
        if (patientIdInput) {
            patientIdInput.addEventListener('blur', this.handleSearch.bind(this));
            patientIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch(e);
                }
            });
        }

        // Medical Order Form Save Handler
        const form = document.getElementById('medicalOrderForm');
        if (form) {
            form.addEventListener('submit', this.handleSaveOrder.bind(this));
        }
    },

    /**
     * Switches the main content area between different views.
     * @param {string} viewName - 'new-order', 'appointments', or 'settings'.
     */
    switchView: function (viewName) {
        // Reset Sidebar Active State
        document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));

        // Hide all views first
        document.getElementById('view-new-order').style.display = 'none';
        document.getElementById('view-appointments').style.display = 'none';
        document.getElementById('view-settings').style.display = 'none';

        if (viewName === 'new-order') {
            document.getElementById('nav-new-order').classList.add('active');
            document.getElementById('view-new-order').style.display = 'block';
        } else if (viewName === 'appointments') {
            document.getElementById('nav-appointments').classList.add('active');
            document.getElementById('view-appointments').style.display = 'block';
            this.renderAppointments();
        } else if (viewName === 'settings') {
            document.getElementById('nav-settings').classList.add('active');
            document.getElementById('view-settings').style.display = 'block';
            this.loadSettings();
        }
    },

    /**
     * Pre-fills the settings form with current user data.
     */
    loadSettings: function () {
        const user = AuthService.getCurrentUser();
        if (user) {
            document.getElementById('setting-name').value = user.name;
            // Note: Using ID as the read-only email field for demonstration
            document.getElementById('setting-email').value = user.id;
        }
    },

    /**
     * Updates the doctor's profile information.
     */
    saveSettings: function () {
        const newName = document.getElementById('setting-name').value;
        const newPass = document.getElementById('setting-password').value;
        const confirmPass = document.getElementById('setting-confirm-password').value;

        if (newPass && newPass !== confirmPass) {
            alert('Fjalëkalimet nuk përputhen!');
            return;
        }

        const user = AuthService.getCurrentUser();
        const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex > -1) {
            users[userIndex].name = newName;
            if (newPass) users[userIndex].password = newPass;

            localStorage.setItem('eShendetesia_users', JSON.stringify(users));

            // Update active session
            user.name = newName;
            sessionStorage.setItem('eShendetesia_currentUser', JSON.stringify(user));

            this.displayDoctorName(); // Live update header
            alert('Të dhënat u përditësuan me sukses!');
        }
    },

    /**
     * Renders the list of confirmed appointments for the current doctor.
     * Filters for today's date and statuses that are relevant (active/confirmed).
     */
    renderAppointments: function () {
        const container = document.getElementById('appointments-container');
        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
        const currentUser = AuthService.getCurrentUser();

        // Filter: Confirmed appointments assigned to this doctor (or unassigned/general)
        const myAppointments = appointments
            .filter(a => a.status === 'confirmed' && (a.doctorId === currentUser.id || !a.doctorId))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (myAppointments.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #718096;">
                    <i class="fas fa-clipboard-check" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <p>Nuk keni asnjë termin të planifikuar për momentin.</p>
                </div>
            `;
            return;
        }

        // Build HTML Table
        let html = `
            <table class="management-table" style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <caption style="text-align: left; padding: 15px; color: #4a5568; font-weight: 600; caption-side: top;">
                    Terminet e planifikuara për sot
                </caption>
                <thead style="background: #f8fafc; text-align: left;">
                    <tr>
                        <th style="padding: 15px; color: #4a5568;">Pacienti</th>
                        <th style="padding: 15px; color: #4a5568;">Procedura</th>
                        <th style="padding: 15px; color: #4a5568;">Spitali</th>
                        <th style="padding: 15px; color: #4a5568;">Ora</th>
                        <th style="padding: 15px; color: #4a5568;">Veprimet</th>
                    </tr>
                </thead>
                <tbody>
        `;

        myAppointments.forEach(app => {
            const dateObj = new Date(app.date);
            const dateStr = dateObj.toLocaleDateString('sq-AL');
            const timeStr = dateObj.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });

            html += `
                <tr style="border-bottom: 1px solid #edf2f7;">
                    <td style="padding: 15px;">
                        <strong>${app.patientName}</strong><br>
                        <span style="font-size: 0.85rem; color: #718096;">ID: ${app.patientId}</span>
                    </td>
                    <td style="padding: 15px;">${app.procedure || 'Kontrollë'}</td>
                    <td style="padding: 15px;">${app.hospital}</td>
                    <td style="padding: 15px;">${dateStr} <br> <strong>${timeStr}</strong></td>
                    <td style="padding: 15px;">
                        <button onclick="DoctorService.completeAppointment('${app.id}')" style="background: #48bb78; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
                            <i class="fas fa-check"></i> Përfundo
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    },

    /**
     * Marks an appointment as completed and archives it.
     * @param {string} id - The appointment ID.
     */
    completeAppointment: function (id) {
        if (confirm('Konfirmoni përfundimin e vizitës?')) {
            const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
            const updated = appointments.map(a => {
                if (a.id === id) a.status = 'completed';
                return a;
            });
            localStorage.setItem('eShendetesia_appointments', JSON.stringify(updated));
            this.renderAppointments(); // Refresh view
            alert('Vizita u përfundua dhe u arkivua.');
        }
    },

    /**
     * Searches for a patient in the database by ID.
     * Auto-fills the name fields if found.
     * @param {Event} e 
     */
    handleSearch: function (e) {
        const id = e.target.value;
        if (!id || id.length !== 10) return;

        const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];
        const patient = users.find(u => u.id === id && u.role === 'patient');

        if (patient) {
            // Split full name into Name and Surname parts
            const nameParts = patient.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            document.getElementById('patientNameInput').value = firstName;
            document.getElementById('patientSurnameInput').value = lastName;

            // Visual feedback: Green border
            document.getElementById('patientIdInput').style.borderColor = '#2ecc71';
        } else {
            alert('Pacienti nuk u gjet në sistem!');
            document.getElementById('patientNameInput').value = '';
            document.getElementById('patientSurnameInput').value = '';
            // Visual feedback: Red border
            document.getElementById('patientIdInput').style.borderColor = '#e74c3c';
        }
    },

    /**
     * Saves a new medical order/referral to the system.
     * @param {Event} e 
     */
    handleSaveOrder: function (e) {
        e.preventDefault();

        const patientId = document.getElementById('patientIdInput').value;
        const patientName = document.getElementById('patientNameInput').value;
        const patientSurname = document.getElementById('patientSurnameInput').value;

        if (!patientId || !patientName || !patientSurname) {
            alert('Ju lutem plotësoni të dhënat e pacientit!');
            return;
        }

        const procedureSelect = document.getElementById('procedure-select');
        const priority = document.querySelector('input[name="priority"]:checked').value;

        const order = {
            id: Date.now().toString(),
            patientId: patientId,
            patientName: `${patientName} ${patientSurname}`,
            doctorId: AuthService.getCurrentUser().id,
            procedure: procedureSelect.value,
            priority: priority,
            diagnosis: document.querySelector('input[list="icd-codes"]').value,
            notes: document.querySelector('textarea').value,
            date: new Date().toISOString(),
            status: 'pending'
        };

        // Save to localStorage
        const orders = JSON.parse(localStorage.getItem('eShendetesia_orders')) || [];
        orders.push(order);
        localStorage.setItem('eShendetesia_orders', JSON.stringify(orders));

        alert('Urdhëresa u ruajt me sukses!');
        e.target.reset();
        document.getElementById('patientIdInput').style.borderColor = '#ddd'; // Reset style
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    DoctorService.init();
});
/**
 * Patient Dashboard Service
 * ------------------------------------------------------------------------------
 * Manages the logic for the Patient Portal, including:
 * - Loading and displaying medical reports.
 * - Fetching daily health tips via an Async API.
 * - Handling view navigation (Home/Settings).
 * - Updating user security settings.
 * 
 * Dependencies: AuthService (for user session management).
 */

const PatientService = {
    /**
     * Initializes the patient dashboard by loading data.
     */
    init: function () {
        this.loadMedicalReports();
        this.loadDailyTip();
    },

    /**
     * Loads the logged-in patient's medical orders/reports from storage.
     * Filters for the current user and sorts by date (newest first).
     */
    loadMedicalReports: function () {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'patient') return;

        const reportsContainer = document.getElementById('medical-reports-container');
        if (!reportsContainer) return;

        const orders = JSON.parse(localStorage.getItem('eShendetesia_orders')) || [];

        // Filter orders for this patient and sort descending by date
        const myOrders = orders
            .filter(order => order.patientId === currentUser.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (myOrders.length === 0) {
            reportsContainer.innerHTML = `
                <div class="no-reports">
                    <i class="fas fa-file-medical-alt" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 1rem;"></i>
                    <p>Nuk keni asnjë raport mjekësor të ri.</p>
                </div>
            `;
            return;
        }

        // Render card for each order
        let html = '';
        myOrders.forEach(order => {
            const date = new Date(order.date).toLocaleDateString('sq-AL', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            // Map internal procedure codes to human-readable labels
            const procedureNames = {
                'ct': 'CT Scan',
                'xray': 'X-Ray',
                'mri': 'MRI',
                'ultra': 'Ultratingull',
                'blood': 'Analiza Laboratorike',
                'ecg': 'EKG',
                'mammogram': 'Mamografi',
                'biopsy': 'Biopsi'
            };
            const procedureName = procedureNames[order.procedure] || order.procedure;

            // Determine UI status style
            let statusColor = 'orange';
            let statusText = 'Në Pritje';

            if (order.status === 'completed') {
                statusColor = 'green';
                statusText = 'E Përfunduar';
            } else if (order.status === 'scheduled') {
                statusColor = 'blue';
                statusText = 'E Caktuar';
            }

            // Find Doctor Name
            const allUsers = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];
            const doctorInfo = allUsers.find(u => u.id === order.doctorId && u.role === 'doctor');
            const doctorDisplayName = doctorInfo ? doctorInfo.name : (order.doctorName || 'Dr. Panjohur');

            // Define Action Button based on Status
            let footerAction = '';
            if (order.status === 'pending') {
                footerAction = `<a href="patient-appointment.html?orderId=${order.id}" class="btn-primary" style="text-decoration: none; display: inline-block; background-color: #3182ce; color: white; padding: 8px 16px; border-radius: 4px;">
                                 <i class="fas fa-calendar-check"></i> Cakto Termin
                               </a>`;
            } else if (order.status === 'scheduled') {
                footerAction = `<a href="my-appointment.html" class="btn-secondary" style="text-decoration: none; display: inline-block; background-color: #4299e1; color: white; padding: 8px 16px; border-radius: 4px;">
                                 <i class="fas fa-calendar-alt"></i> Shiko Terminin
                               </a>`;
            } else if (order.status === 'completed') {
                footerAction = `<button class="btn-download" onclick="alert('Shkarkimi i PDF nuk është implementuar ende.')">
                                 <i class="fas fa-download"></i> Shkarko PDF
                               </button>`;
            }

            // Construct Card HTML
            html += `
                <div class="report-card">
                    <div class="report-header">
                        <div class="report-icon">
                            <i class="fas fa-notes-medical"></i>
                        </div>
                        <div class="report-info">
                            <h4>${procedureName}</h4>
                            <span class="report-date"><i class="far fa-clock"></i> ${date}</span>
                        </div>
                        <div class="report-status">
                            <span class="badge ${order.status}" style="background-color: ${statusColor === 'blue' ? '#ebf8ff' : ''}; color: ${statusColor === 'blue' ? '#2b6cb0' : ''}">${statusText}</span>
                        </div>
                    </div>
                    
                    <div class="report-body">
                        <div class="detail-row">
                            <strong><i class="fas fa-diagnoses"></i> Diagnoza:</strong>
                            <span>${order.diagnosis || 'Ende e papërcaktuar'}</span>
                        </div>
                        <div class="detail-row">
                            <strong><i class="fas fa-user-md"></i> Mjeku:</strong>
                            <span>${doctorDisplayName}</span>
                        </div>
                        ${order.notes ? `<div class="report-notes"><p>"${order.notes}"</p></div>` : ''}
                    </div>

                    <div class="report-footer">
                        ${footerAction}
                    </div>
                </div>
            `;
        });

        reportsContainer.innerHTML = html;
    },

    /**
     * Fetches a daily health tip from a JSON file using the Fetch API.
     * Selects a random tip and displays it in the dashboard.
     */
    loadDailyTip: async function () {
        try {
            const response = await fetch('../../data/daily-tips.json');
            if (!response.ok) throw new Error('Failed to fetch tips');

            const tips = await response.json();

            // Randomly select one tip
            // Uses spread operator to copy array before sorting to avoid mutation
            const [randomTip] = [...tips].sort(() => 0.5 - Math.random());
            const { text } = randomTip; // Destructure tip text

            // Inject into DOM
            const tipContainer = document.getElementById('daily-tip-container');
            if (tipContainer) {
                tipContainer.innerHTML = `
                    <div style="background: #e6fffa; border-left: 4px solid #38b2ac; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                        <strong><i class="fas fa-lightbulb"></i> Këshilla e Ditës:</strong> ${text}
                    </div>
                `;
            }

        } catch (error) {
            console.error("Tip fetch error:", error);
        }
    },

    /**
     * Toggles between main dashboard sections.
     * @param {string} viewName - 'home' or 'settings'
     */
    switchView: function (viewName) {
        if (viewName === 'home') {
            document.getElementById('view-home').classList.remove('hidden');
            document.getElementById('view-settings').classList.add('hidden');
            this.loadMedicalReports(); // Refresh data
        } else if (viewName === 'settings') {
            document.getElementById('view-home').classList.add('hidden');
            document.getElementById('view-settings').classList.remove('hidden');
        }
    },

    /**
     * Handles the password change form submission.
     * @param {Event} e 
     */
    updateSettings: function (e) {
        e.preventDefault();
        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;
        const currentUser = AuthService.getCurrentUser();

        // Validation
        if (currentPass !== currentUser.password) {
            alert('Fjalëkalimi aktual është i pasaktë!');
            return;
        }

        if (newPass !== confirmPass) {
            alert('Fjalëkalimet e reja nuk përputhen!');
            return;
        }

        if (newPass.length < 5) {
            alert('Fjalëkalimi i ri duhet të jetë së paku 5 karaktere!');
            return;
        }

        // Persist Changes
        const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex > -1) {
            users[userIndex].password = newPass;
            localStorage.setItem('eShendetesia_users', JSON.stringify(users));

            // Update local session
            currentUser.password = newPass;
            localStorage.setItem('eShendetesia_currentUser', JSON.stringify(currentUser));

            alert('Fjalëkalimi u ndryshua me sukses!');
            e.target.reset();
            this.switchView('home');
        } else {
            alert('Gabim: Përdoruesi nuk u gjet!');
        }
    },

    /**
     * Helper to dismiss UI notifications after a delay.
     * @param {string} elementId 
     */
    dismissNotification: function (elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            setTimeout(() => {
                el.style.display = 'none';
            }, 3000);
        }
    }
};

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    PatientService.init();
});

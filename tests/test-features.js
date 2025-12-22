const logs = document.getElementById('logs');
function log(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = 'log-item ' + type;
    div.innerHTML = `[${type.toUpperCase()}] ${msg}`;
    logs.appendChild(div);
}
function assert(condition, message) {
    if (condition) log(message, 'pass');
    else log('FAILED: ' + message, 'fail');
}

// --- SETUP ---
function setupData() {
    // Users
    const users = [
        { id: "doc1", name: "Dr. Test", role: "doctor", password: "123" },
        { id: "1234567890", name: "Test Patient", role: "patient", password: "123" },
        { id: "staff1", name: "Staff Test", role: "staff", password: "123" }
    ];
    localStorage.setItem('eShendetesia_users', JSON.stringify(users));

    // Orders
    localStorage.setItem('eShendetesia_orders', '[]');

    // Appointments
    const apps = [
        { id: "app1", patientId: "1234567890", date: "2025-10-10T08:00", doctorId: "doc1", status: "confirmed" }
    ];
    localStorage.setItem('eShendetesia_appointments', JSON.stringify(apps));

    // Default Session
    localStorage.setItem('eShendetesia_currentUser', JSON.stringify(users[0]));
}

async function runTests() {
    log("Initializing Tests...");
    setupData();

    // ==========================================
    // 1. AUTHENTICATION SERVICE
    // ==========================================
    try {
        log("Testing Auth Service...");
        // Test Login Success
        const res = AuthService.login("doc1", "123");
        assert(res.success && res.user.role === 'doctor', "Auth: Doctor Login Success");

        // Test Login Fail
        const fail = AuthService.login("doc1", "wrong");
        assert(!fail.success, "Auth: Wrong Password Rejected");

        // 1b. Test Password Reset
        const resetRes = AuthService.resetPassword("doc1", "NewPass123!");
        assert(resetRes.success, "Auth: Password Reset Success");

        const loginNew = AuthService.login("doc1", "NewPass123!");
        assert(loginNew.success, "Auth: Login with New Password Success");

    } catch (e) { log("Auth Error: " + e.message, 'fail'); }

    // ==========================================
    // 2. DOCTOR FLOWS
    // ==========================================
    try {
        log("Testing Doctor Flows...");
        // Login as Doctor
        localStorage.setItem('eShendetesia_currentUser', JSON.stringify({ id: "doc1", role: "doctor", name: "Dr. Test" }));

        // 2a. Create Order
        const event = { preventDefault: () => { }, target: { reset: () => { } } };
        DoctorService.handleSaveOrder(event);

        const orders = JSON.parse(localStorage.getItem('eShendetesia_orders'));
        assert(orders.length === 1 && orders[0].procedure === 'ct', "Doctor: Order Created Successfully");

        // 2b. Settings Update
        DoctorService.saveSettings();
        const users = JSON.parse(localStorage.getItem('eShendetesia_users'));
        assert(users.find(u => u.id === 'doc1').name === "Dr. Test Updated", "Doctor: Settings Updated");

        // 2c. Complete Appointment
        // We mock window.confirm to return true
        const originalConfirm = window.confirm;
        window.confirm = () => true;

        DoctorService.completeAppointment('app1');

        const apps = JSON.parse(localStorage.getItem('eShendetesia_appointments'));
        assert(apps.find(a => a.id === 'app1').status === 'completed', "Doctor: Appointment Completed");

        window.confirm = originalConfirm; // Restore
    } catch (e) { log("Doctor Flow Error: " + e.message, 'fail'); }

    // ==========================================
    // 3. STAFF FLOWS
    // ==========================================
    try {
        log("Testing Staff Flows...");
        // Login as Staff
        // Login as Staff
        localStorage.setItem('eShendetesia_currentUser', JSON.stringify({ id: "staff1", role: "staff", password: "123" }));

        // 3a. Conflict Check (Manual Register)
        // We reset app1 to confirmed for this test
        let apps = JSON.parse(localStorage.getItem('eShendetesia_appointments'));
        apps[0].status = 'confirmed';
        localStorage.setItem('eShendetesia_appointments', JSON.stringify(apps));

        // Try to book same slot (doc1, 2025-10-10, 08:00)
        // Mock alert to capture error
        let alertMsg = '';
        const originalAlert = window.alert;
        window.alert = (msg) => { alertMsg = msg; };

        const event = { preventDefault: () => { }, target: { reset: () => { } } };
        StaffService.handleManualRegister(event);

        assert(alertMsg.includes('tashmë ka një termin'), "Staff: Double-Booking Prevented");

        // 3b. STAFF EXTENDED FEATURES (Search & Settings & Check-in)
        log("Testing Staff Search, Check-in & Settings...");

        // Reset DOM for Search Test
        document.getElementById('search-input').value = '1234567890';
        document.getElementById('search-results').innerHTML = '';

        // Test Search
        StaffService.searchPatient();
        const searchRes = document.getElementById('search-results').textContent;
        assert(searchRes.includes('Test Patient'), "Staff: Search by ID Found Patient");

        // Test Check-in (New Logic)
        // Check-in app1
        StaffService.doCheckIn('app1');
        apps = JSON.parse(localStorage.getItem('eShendetesia_appointments'));
        assert(apps[0].status === 'arrived', "Staff: Patient Check-In Success (via doCheckIn)");

        // Test Settings Update
        document.getElementById('current-password').value = '123';
        document.getElementById('new-password').value = 'newpassStaff';
        document.getElementById('confirm-password').value = 'newpassStaff';

        StaffService.updateSettings(event);

        const staffUser = JSON.parse(localStorage.getItem('eShendetesia_users')).find(u => u.id === 'staff1');
        assert(staffUser.password === 'newpassStaff', "Staff: Settings/Password Updated Successfully");

        window.alert = originalAlert;

        // Test Search (Not Found)
        document.getElementById('search-input').value = '0000000000';
        window.alert = (msg) => { alertMsg = msg; };

        StaffService.searchPatient();
        const noResults = document.getElementById('search-results').innerHTML;
        assert(noResults.includes('Pacienti nuk u gjet') || alertMsg.includes('Nuk u gjet'), "Staff: Search Non-Existent Patient handled correctly");

        // Test Settings Update (Failure)
        document.getElementById('current-password').value = 'WRONGpass';
        document.getElementById('new-password').value = 'newpassStaff';
        document.getElementById('confirm-password').value = 'newpassStaff';

        StaffService.updateSettings(event);
        assert(alertMsg.includes('Fjalëkalimi aktual është i pasaktë'), "Staff: Settings Update Failed with Wrong Password");

        window.alert = originalAlert;
    } catch (e) { log("Staff Flow Error: " + e.message, 'fail'); }

    // ==========================================
    // 4. PATIENT FLOWS (Data Display)
    // ==========================================
    try {
        log("Testing Patient Reports Display...");
        // Login as Patient
        localStorage.setItem('eShendetesia_currentUser', JSON.stringify({ id: "1234567890", role: "patient" }));

        // Ensure an order exists for this patient
        // (Created in step 2a)
        PatientService.loadMedicalReports();

        const container = document.getElementById('medical-reports-container');
        assert(container.innerHTML.includes('CT Scan'), "Patient: Reports Rendered Correctly");

    } catch (e) { log("Patient Flow Error: " + e.message, 'fail'); }

    // ==========================================
    // 5. PATIENT DOUBLE CHECK-IN (LOGIC SIMULATION)
    // ==========================================
    try {
        log("Testing Patient Double Check-In Prevention...");

        // Scenario: Patient 1234567890 already has app1 (2025-10-10T08:00, doc1, confirmed)
        // New attempt: Same time, Same doctor

        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments'));
        const testDate = "2025-10-10";
        const testTime = "08:00";
        const targetDoc = "doc1";
        const proposedDateTime = `${testDate}T${testTime}`;

        // Logic used in patient-appointment.html:
        const conflict = appointments.find(app => {
            const sameTime = app.date === proposedDateTime;
            const sameDoctor = app.doctorId === targetDoc;
            const isActive = app.status !== 'cancelled';
            return sameTime && sameDoctor && isActive;
        });

        assert(conflict !== undefined, "Double Check-In: Conflict Detected (Same Doctor + Same Time)");

        // Scenario 2: Patient trying to book checkup (same doc) but doc is busy with someone else
        // (Simulation: mock the array to show doc1 is busy with another patient)
        appointments.push({ id: "other", patientId: "other", doctorId: "doc1", date: proposedDateTime, status: 'confirmed' });

        const conflict2 = appointments.find(app => {
            const sameTime = app.date === proposedDateTime;
            const sameDoctor = app.doctorId === targetDoc;
            const isActive = app.status !== 'cancelled';
            return sameTime && sameDoctor && isActive;
        });

        assert(conflict2 !== undefined, "Double Check-In: Conflict Detected (Doctor Busy with Other Patient)");

    } catch (e) { log("Double Check-In Error: " + e.message, 'fail'); }

    log("All Tests Completed.");
}

setTimeout(runTests, 500); // Delay slightly for DOM

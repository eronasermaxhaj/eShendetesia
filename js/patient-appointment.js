
AuthService.requireLogin('patient');

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = AuthService.getCurrentUser();
    const orderSelect = document.createElement('select');
    orderSelect.id = 'service-select';
    orderSelect.innerHTML = '<option value="">Zgjidhni Shërbimin...</option>';

    // Fetch Orders
    const orders = JSON.parse(localStorage.getItem('eShendetesia_orders')) || [];
    const patientOrders = orders.filter(o => o.patientId === currentUser.id && o.status !== 'completed' && o.status !== 'scheduled');

    if (patientOrders.length > 0) {
        // Pre-fetch all users for doctor lookup
        const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];

        patientOrders.forEach(order => {
            const option = document.createElement('option');
            option.value = order.id; // Store Order ID
            option.dataset.procedure = order.procedure;

            // Format Procedure (uppercase if short acronym like CT, MRI)
            let displayProcedure = order.procedure;
            if (['ct', 'mri', 'ekg', 'xray'].includes(displayProcedure.toLowerCase())) {
                displayProcedure = displayProcedure.toUpperCase();
            } else {
                // Capitalize first letter
                displayProcedure = displayProcedure.charAt(0).toUpperCase() + displayProcedure.slice(1);
            }

            // Lookup Doctor Name
            const doctorInfo = users.find(u => u.id === order.doctorId && u.role === 'doctor');
            const doctorName = doctorInfo ? doctorInfo.name : `Dr. ${order.doctorId}`;

            option.textContent = `Udhëzim: ${displayProcedure} (${doctorName})`;
            orderSelect.appendChild(option);
        });
    }
    // Always allow General Checkup
    const checkupOption = document.createElement('option');
    checkupOption.value = 'checkup';
    checkupOption.dataset.procedure = 'Kontrollë e Përgjithshme';
    checkupOption.textContent = 'Kontrollë e Përgjithshme';
    orderSelect.appendChild(checkupOption);

    // Insert Dropdown in its own section
    const formCard = document.querySelector('.form-card');
    const hospitalSection = document.querySelector('.input-section'); // The first one (Hospital)

    // 1. Service Section
    const serviceSection = document.createElement('div');
    serviceSection.className = 'input-section';

    const serviceLabel = document.createElement('label');
    serviceLabel.textContent = "Shërbimi / Procedura";
    serviceSection.appendChild(serviceLabel);

    orderSelect.style.width = "100%"; // Ensure full width
    orderSelect.style.padding = "10px";
    orderSelect.style.border = "2px solid #e1e8ed";
    orderSelect.style.borderRadius = "8px";
    serviceSection.appendChild(orderSelect);

    // Insert Service Section BEFORE Hospital Section
    formCard.insertBefore(serviceSection, hospitalSection);

    // 2. Doctor Section
    const doctorSection = document.createElement('div');
    doctorSection.className = 'input-section';
    doctorSection.id = 'doctor-select-container'; // Keep ID for potential toggling if needed, but we'll show it.

    const doctorLabel = document.createElement('label');
    doctorLabel.textContent = "Zgjidhni Mjekun";
    doctorSection.appendChild(doctorLabel);

    const doctorSelect = document.createElement('select');
    doctorSelect.id = 'doctor-select';
    doctorSelect.style.width = "100%";
    doctorSelect.style.padding = "10px";
    doctorSelect.style.border = "2px solid #e1e8ed";
    doctorSelect.style.borderRadius = "8px";
    doctorSelect.innerHTML = '<option value="">Zgjidhni Mjekun...</option>';

    doctorSection.appendChild(doctorSelect);

    // Insert Doctor Section AFTER Hospital Section (or before? usually Hospital -> Doctor)
    // Let's put it AFTER Hospital for logical flow: Service -> Hospital -> Doctor -> Date
    hospitalSection.insertAdjacentElement('afterend', doctorSection);

    // Populate Doctors Dropdown
    const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];
    const doctors = users.filter(u => u.role === 'doctor');

    if (doctors.length === 0) {
        const option = document.createElement('option');
        option.textContent = "Nuk ka mjekë të regjistruar!";
        doctorSelect.appendChild(option);
        doctorSelect.disabled = true;
    } else {
        doctors.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            // Ensure consistency with "Dr." prefix
            const name = doc.name.trim();
            const hasPrefix = /^dr[\.\s]/i.test(name);
            option.textContent = hasPrefix ? name : `Dr. ${name}`;
            doctorSelect.appendChild(option);
        });
    }

    // Show/Hide Doctor Select based on Service
    orderSelect.addEventListener('change', () => {
        const serviceId = orderSelect.value;
        const doctorContainer = document.getElementById('doctor-select-container');

        if (serviceId === 'checkup') {
            doctorContainer.style.display = 'block';
        } else {
            // Technical Procedure (Staff)
            doctorContainer.style.display = 'none';
        }
        checkAvailability();
    });



    // Date Logic
    const dateInput = document.getElementById('date-picker');
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 2);
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];

    // UI Elements
    const hospitalSelect = document.getElementById('hospital-select');
    const timeSlots = document.querySelectorAll('.slot');
    const btnConfirm = document.querySelector('.btn-confirm');

    let selectedTime = null;

    // Check for URL Params (Referral Flow) - MOVED HERE
    const urlParams = new URLSearchParams(window.location.search);
    const preSelectedOrderId = urlParams.get('orderId');
    if (preSelectedOrderId) {
        if (orderSelect.querySelector(`option[value="${preSelectedOrderId}"]`)) {
            orderSelect.value = preSelectedOrderId;
            // Hide doctor select as it's a specific order/technical procedure
            document.getElementById('doctor-select-container').style.display = 'none';
            // Now safe to call because dateInput and others are defined
            checkAvailability();
        }
    }



    // Update Summary
    function updateSummary() {
        document.getElementById('res-hospital').textContent = hospitalSelect.value || 'Pa zgjedhur';
        document.getElementById('res-date').textContent = dateInput.value || '-- / -- / ----';
        document.getElementById('res-time').textContent = selectedTime || '-- : --';
    }

    hospitalSelect.addEventListener('change', updateSummary);
    dateInput.addEventListener('change', updateSummary);

    // Verify Availability
    function checkAvailability() {
        const selectedDate = dateInput.value;
        const serviceId = orderSelect.value;
        const selectedDoctorForCheckup = document.getElementById('doctor-select').value;

        // Reset all slots first
        selectedTime = null;
        updateSummary();

        timeSlots.forEach(slot => {
            slot.classList.remove('disabled');
            slot.disabled = false;
            slot.style.background = '#e2e8f0';
            slot.style.color = '#2d3748';
            slot.style.cursor = 'pointer';
            slot.title = "";
        });

        if (!selectedDate || !serviceId) return;

        // Determine Target for Availability Check
        let targetDoctorId = null;
        let targetProcedureType = null;

        if (serviceId === 'checkup') {
            targetDoctorId = document.getElementById('doctor-select').value;
            if (!targetDoctorId) return;
        } else {
            // For technical procedures, we check Resource Availability (e.g. Only 1 ECG machine)
            // We verify if 'dataset.procedure' is free at this time.
            const selectedOption = orderSelect.options[orderSelect.selectedIndex];
            if (selectedOption) {
                targetProcedureType = selectedOption.dataset.procedure; // e.g., "CT", "EKG"
            }
        }

        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];

        // Find busy slots
        appointments.forEach(app => {
            let isBusy = false;

            if (serviceId === 'checkup') {
                // Checkup: Busy if Doctor is busy
                isBusy = (app.doctorId === targetDoctorId && app.date.startsWith(selectedDate) && app.status !== 'cancelled');
            } else {
                // Technical: Busy if Resource (Procedure) is busy
                // note: app.procedure might be slightly different string, ideally we normalize. 
                // But simplified: assuming simulated "1 machine per type".
                // We check if an appointment exists at this date/time for the SAME procedure.
                isBusy = (app.procedure === targetProcedureType && app.date.startsWith(selectedDate) && app.status !== 'cancelled');
            }

            if (isBusy) {
                // Extract time strictly (e.g. "08:00")
                let busyTime = '';
                if (app.date.includes('T')) {
                    busyTime = app.date.split('T')[1].substring(0, 5);
                } else {
                    try { busyTime = new Date(app.date).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' }); } catch (e) { }
                }

                // Disable the matching slot
                timeSlots.forEach(slot => {
                    if (slot.textContent.trim().padStart(5, '0') === busyTime.padStart(5, '0')) {
                        slot.classList.add('disabled');
                        slot.disabled = true;
                        slot.style.backgroundColor = '#feb2b2';
                        slot.style.color = '#742a2a';
                        slot.style.cursor = 'not-allowed';
                        slot.title = serviceId === 'checkup' ? "Mjeku është i zënë" : "Pajisja/Salla është e zënë";
                    }
                });
            }
        });
    }

    dateInput.addEventListener('change', () => {
        updateSummary();
        checkAvailability();
    });

    orderSelect.addEventListener('change', checkAvailability);
    document.getElementById('doctor-select').addEventListener('change', checkAvailability);

    // Time Slot Selection
    timeSlots.forEach(slot => {
        slot.addEventListener('click', (e) => {
            if (e.target.disabled || e.target.classList.contains('disabled')) return;

            // Interact with clicked element
            const clickedSlot = e.target;

            // Reset others
            timeSlots.forEach(s => {
                if (!s.classList.contains('disabled')) {
                    s.style.background = '#e2e8f0';
                    s.style.color = '#2d3748';
                }
            });

            // Highlight selection
            clickedSlot.style.background = '#0044cc';
            clickedSlot.style.color = 'white';
            selectedTime = clickedSlot.textContent.trim();
            updateSummary();
        });
    });

    // Confirm Appointment
    btnConfirm.addEventListener('click', (e) => {
        e.preventDefault();

        // Prevent double clicks
        if (btnConfirm.disabled) return;
        btnConfirm.disabled = true;
        btnConfirm.textContent = 'Duke procesuar...';

        const hospital = hospitalSelect.value;
        const date = dateInput.value;
        const serviceId = orderSelect.value;

        if (!hospital || !date || !selectedTime || !serviceId) {
            alert('Ju lutem plotësoni të gjitha fushat!');
            btnConfirm.disabled = false;
            btnConfirm.textContent = 'Konfirmo Terminin';
            return;
        }



        // ---------------------------------------------------------
        // 1. FINAL CONFLICT CHECK (Backend Simulation)
        // ---------------------------------------------------------

        // Defining users here as previous block removed it
        const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];

        const appointments = JSON.parse(localStorage.getItem('eShendetesia_appointments')) || [];
        const procedureName = orderSelect.options[orderSelect.selectedIndex].dataset.procedure;

        // ---------------------------------------------------------
        // 1. FINAL CONFLICT CHECK
        // ---------------------------------------------------------

        let isConflict = false;
        const proposedDateTime = `${date}T${selectedTime}`;

        if (serviceId === 'checkup') {
            // Doctor Collision Check
            const docId = document.getElementById('doctor-select').value;
            if (!docId) {
                alert('Zgjidhni mjekun!');
                btnConfirm.disabled = false;
                btnConfirm.textContent = 'Konfirmo Terminin';
                return;
            }

            isConflict = appointments.some(app =>
                app.date === proposedDateTime &&
                app.doctorId === docId &&
                app.status !== 'cancelled'
            );
        } else {
            // Resource Collision Check (e.g. "CT" vs "CT")
            isConflict = appointments.some(app =>
                app.date === proposedDateTime &&
                app.procedure === procedureName && // Same Procedure Type
                app.status !== 'cancelled'
            );
        }

        if (isConflict) {
            alert('Ky termin është i zënë! Ju lutem zgjidhni një orar tjetër.');
            btnConfirm.disabled = false;
            btnConfirm.textContent = 'Konfirmo Terminin';
            checkAvailability();
            return;
        }

        // 2. Prepare Data
        let assignedDoctorId = null;
        let assignedDoctorName = '';
        let assignedDept = 'Ambulanca Specialistike';

        if (serviceId === 'checkup') {
            assignedDoctorId = document.getElementById('doctor-select').value;
            const doc = users.find(u => u.id === assignedDoctorId);
            assignedDoctorName = doc ? doc.name : '-';
            assignedDept = doc?.department || assignedDept;
        } else {
            // Technical: Assign to Random Staff
            const staffMembers = users.filter(u => u.role === 'staff');
            if (staffMembers.length > 0) {
                const randomStaff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
                assignedDoctorId = randomStaff.id;
                assignedDoctorName = randomStaff.name; // e.g. "Agnesa Kelmendi" from auth.js
                // Keep 'Stafi' prefix if preferred, or just name
            } else {
                assignedDoctorId = 'staff_pool';
                assignedDoctorName = 'Stafi Mjekësor';
            }
        }



        // 3. Save
        const appointment = {
            id: Date.now().toString(),
            patientId: currentUser.id,
            patientName: currentUser.name,
            date: proposedDateTime,
            hospital: hospital,
            department: assignedDept,
            doctorId: assignedDoctorId,
            doctorName: assignedDoctorName,
            status: 'confirmed',
            procedure: procedureName,
            orderId: serviceId !== 'checkup' ? serviceId : null
        };

        appointments.push(appointment);
        localStorage.setItem('eShendetesia_appointments', JSON.stringify(appointments));

        // Mark Order Scheduled
        if (serviceId !== 'checkup') {
            // Re-fetch orders to ensure we have the latest list (though 'orders' from top scope might be stale if we rely on it, better to re-read or use consistent naming)
            // The top scope had 'orders'. Let's check if we can reuse it, but safer to read from LS again to avoid stale closures? 
            // Actually, we are in the same page load. 'orders' at top is fine? 
            // Wait, looking at the code, 'orders' was defined at top. 
            // But let's just re-fetch to be safe and clear.
            const currentOrders = JSON.parse(localStorage.getItem('eShendetesia_orders')) || [];
            const orderIndex = currentOrders.findIndex(o => o.id === serviceId);
            if (orderIndex > -1) {
                currentOrders[orderIndex].status = 'scheduled';
                localStorage.setItem('eShendetesia_orders', JSON.stringify(currentOrders));
            }
        }

        alert('Termini u konfirmua me sukses!');
        window.location.href = 'my-appointment.html';
    });
});

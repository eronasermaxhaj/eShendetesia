// DOM Elements
const togglePassword = document.querySelector('#togglePassword');
const passwordInput = document.querySelector('#password');
const loginForm = document.querySelector('form');
const usernameInput = document.querySelector('#username');
const forgotPasswordLink = document.querySelector('.form-footer a');

/**
 * Toggle password visibility
 */
togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password'
        ? 'text'
        : 'password';

    passwordInput.setAttribute('type', type);

    // Switch icon appearance
    this.classList.toggle('fa-eye-slash');
});

/**
 * Handle Login Form Submission
 */
loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Stop default reload

    const personalId = usernameInput.value;
    const password = passwordInput.value;

    // Attempt login using AuthService (defined in auth.js)
    const result = AuthService.login(personalId, password);

    if (result.success) {
        // Determine redirect path based on role
        let redirectPath = '#';

        switch (result.user.role) {
            case 'patient':
                redirectPath = '../patient/patient-dashboard.html';
                break;
            case 'doctor':
                redirectPath = '../doctor/doctor-dashboard.html';
                break;
            case 'staff':
                redirectPath = '../medical-staff/staff-dashboard.html';
                break;
            default:
                alert("Roli i panjohur! Kontaktoni administratorin.");
                return;
        }

        // Redirect
        window.location.href = redirectPath;
    } else {
        // Show error
        alert("Gabim në kyçje: " + result.message);
    }
});

// Forgot Password Link event listener removed to allow navigation to forgot-password.html

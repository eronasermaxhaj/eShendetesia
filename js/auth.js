/**
 * Authentication Service Module
 * ------------------------------------------------------------------------------
 * This module handles all authentication-related operations for the eShendetesia
 * platform, including user login, registration, password management, and session
 * persistence.
 * 
 * It simulates a backend database using the browser's `localStorage` to persist
 * user accounts and active sessions. This ensures that data remains available
 * across page reloads.
 * 
 * Key Features:
 * - User Role Management (Patient, Doctor, Staff)
 * - Session Management (Login/Logout/Current User)
 * - Page Protection (Redirects unauthorized users)
 * - Input Validation (Regex for IDs and Passwords)
 */

const AuthService = {
    /**
     * Initializes the local storage "database" with default users if empty.
     * This ensures the application has data to work with immediately upon first load.
     */
    init: function () {
        if (!localStorage.getItem('eShendetesia_users')) {
            const initialUsers = [
                {
                    id: "1231231234",
                    password: "patient123",
                    role: "patient",
                    name: "Filan Fisteku",
                    email: "filan@example.com"
                },
                {
                    id: "2223334445",
                    password: "doctor123",
                    role: "doctor",
                    name: "Dr. Arben Gashi",
                    specialization: "Kardiologji",
                    email: "arben.gashi@spitali.ks"
                },
                {
                    id: "5556667778",
                    password: "staff123",
                    role: "staff",
                    name: "Agnesa Kelmendi",
                    position: "Infermiere Kryesore",
                    email: "agnesa.kelmendi@spitali.ks"
                }
            ];
            localStorage.setItem('eShendetesia_users', JSON.stringify(initialUsers));
            console.log("System DB Initialized: Default users created.");
        }
    },

    /**
     * Resets a user's password after validating their identity.
     * 
     * @param {string} id - The Personal ID of the user.
     * @param {string} newPassword - The new password to set.
     * @returns {Object} result - Contains success status and optional error message.
     */
    resetPassword: function (id, newPassword) {
        const users = JSON.parse(localStorage.getItem('eShendetesia_users') || '[]');
        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return { success: false, message: "Ky Numër Personal (ID) nuk u gjet në sistem." };
        }

        // Validate the new password against security rules
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return { success: false, message: "Fjalëkalimi i ri nuk plotëson kriteret e sigurisë." };
        }

        users[userIndex].password = newPassword;
        localStorage.setItem('eShendetesia_users', JSON.stringify(users));

        return { success: true };
    },

    /**
     * Authenticates a user based on credentials.
     * 
     * @param {string} personalId - The user's ID.
     * @param {string} password - The user's password.
     * @returns {Object} result - Contains success status, user object, or error message.
     */
    login: function (personalId, password) {
        const users = JSON.parse(localStorage.getItem('eShendetesia_users') || '[]');

        const user = users.find(u => u.id === personalId);

        if (!user) {
            return { success: false, message: "Numri Personal (ID) nuk u gjet." };
        }

        if (user.password !== password) {
            return { success: false, message: "Fjalëkalimi është i gabuar." };
        }

        // Create a safe session object without the password
        const { password: _, ...userSafeWith } = user;
        localStorage.setItem('eShendetesia_currentUser', JSON.stringify(userSafeWith));

        return { success: true, user: userSafeWith };
    },

    /**
     * Validates registration inputs against defined security policies.
     * 
     * Policy:
     * - ID: Strictly 10 digits.
     * - Password: Min 8 chars, 1 number, 1 special char (!@#$%^&*).
     * 
     * @param {string} id 
     * @param {string} password 
     * @returns {Object} result - { valid: boolean, message?: string }
     */
    validateRegistration: function (id, password) {
        // ID Validation
        const idRegex = /^\d{10}$/;
        if (!idRegex.test(id)) {
            return { valid: false, message: "Numri Personal duhet të ketë saktësisht 10 shifra." };
        }

        // Password Security Validation
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            return { valid: false, message: "Fjalëkalimi duhet të ketë të paktën 8 karaktere, një numër dhe një simbol (!@#$%^&*)." };
        }

        return { valid: true };
    },

    /**
     * Registers a new user into the system.
     * 
     * @param {Object} userData - Object containing id, password, name, surname, role.
     * @returns {Object} result - Success status.
     */
    register: function (userData) {
        // Step 1: Validate inputs
        const validation = this.validateRegistration(userData.id, userData.password);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        const users = JSON.parse(localStorage.getItem('eShendetesia_users') || '[]');

        // Step 2: Check for duplicates
        if (users.find(u => u.id === userData.id)) {
            return { success: false, message: "Ky numër personal (ID) ekziston paraprakisht." };
        }

        // Step 3: Create User Object
        const newUser = {
            id: userData.id,
            password: userData.password,
            role: userData.role || 'patient', // Default to patient if unspecified
            name: `${userData.name} ${userData.surname}`,
            email: `${userData.name.toLowerCase()}.${userData.surname.toLowerCase()}@example.com`
        };

        // Step 4: Persist
        users.push(newUser);
        localStorage.setItem('eShendetesia_users', JSON.stringify(users));

        return { success: true };
    },

    /**
     * Enforces page access control.
     * Redirects the user to the login page if they are not authenticated or
     * do not possess the required role.
     * 
     * @param {string} [requiredRole] - The role required to access the page (e.g., 'doctor').
     */
    requireLogin: function (requiredRole) {
        const currentUser = this.getCurrentUser();

        if (!currentUser) {
            alert("Qasje e paautorizuar! Ju lutem kyçuni.");
            this.redirectToLogin();
            return;
        }

        if (requiredRole && currentUser.role !== requiredRole) {
            alert("Nuk keni privilegje për të hapur këtë faqe.");
            this.redirectToLogin();
        }
    },

    /**
     * Helper method to redirect to the correct login path based on current depth.
     */
    redirectToLogin: function () {
        const path = window.location.pathname.toLowerCase();

        // Handle nested paths logic to find root
        if (path.includes('/tips/')) {
            window.location.href = '../../auth/login.html';
        } else if (path.includes('/patient/') || path.includes('/doctor/') || path.includes('/medical-staff/')) {
            window.location.href = '../auth/login.html';
        } else if (path.includes('/html/')) {
            window.location.href = 'auth/login.html';
        } else {
            window.location.href = 'html/auth/login.html';
        }
    },

    /**
     * Retrieves the currently active user session.
     * @returns {Object|null} The user object or null if not logged in.
     */
    getCurrentUser: function () {
        return JSON.parse(localStorage.getItem('eShendetesia_currentUser'));
    },

    /**
     * Terminates the user session and redirects to the login page.
     */
    logout: function () {
        localStorage.removeItem('eShendetesia_currentUser');
        this.redirectToLogin();
    },

    /**
     * Automatically protects routes based on the directory structure.
     * For example, ensures that only 'doctors' can access files in the '/doctor/' folder.
     */
    autoProtect: function () {
        const path = window.location.pathname;

        if (path.includes('/doctor/')) {
            this.requireLogin('doctor');
        } else if (path.includes('/patient/')) {
            this.requireLogin('patient');
        } else if (path.includes('/medical-staff/')) {
            this.requireLogin('staff');
        }
    }
};

// Initialize the service and run protection checks immediately
AuthService.init();
AuthService.autoProtect();

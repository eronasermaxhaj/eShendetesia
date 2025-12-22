document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');
    const idInput = document.getElementById('resetId');
    const newPassSection = document.getElementById('newPasswordSection');
    const submitBtn = document.getElementById('submitBtn');

    let isVerified = false;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!isVerified) {
            // STEP 1: Verify ID
            const id = idInput.value;
            const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];
            const user = users.find(u => u.id === id);

            if (user) {
                // User found
                alert(`Identifikimi i suksesshëm për: ${user.name}`);

                // Switch UI to password reset mode
                isVerified = true;
                idInput.disabled = true;
                newPassSection.style.display = 'block';
                submitBtn.textContent = 'Ruaj Fjalëkalimin e Ri';
            } else {
                alert("Ky Numër Personal (ID) nuk u gjet në sistem.");
            }

        } else {
            // STEP 2: Save New Password
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;

            if (newPass !== confirmPass) {
                alert("Fjalëkalimet nuk përputhen!");
                return;
            }

            // Validate strict password rules
            // Reuse logic from AuthService or regex directly
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(newPass)) {
                alert("Fjalëkalimi i ri duhet të ketë: \n- Min 8 karaktere\n- 1 Numër\n- 1 Simbol (!@#$%^&*)");
                return;
            }

            // Update User in LocalStorage
            const id = idInput.value;
            const users = JSON.parse(localStorage.getItem('eShendetesia_users')) || [];
            const userIndex = users.findIndex(u => u.id === id);

            if (userIndex > -1) {
                users[userIndex].password = newPass;
                localStorage.setItem('eShendetesia_users', JSON.stringify(users));

                alert("Fjalëkalimi u ndryshua me sukses! Ju lutem kyçuni tani.");
                window.location.href = 'login.html';
            }
        }
    });
});

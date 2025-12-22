/**
 * Registration Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const data = {
                name: document.getElementById('name').value,
                surname: document.getElementById('surname').value,
                id: document.getElementById('personalId').value,
                password: document.getElementById('password').value,
                role: document.querySelector('input[name="role"]:checked').value
            };

            const result = AuthService.register(data);

            if (result.success) {
                alert("Llogaria u krijua me sukses! Tani mund të kyçeni.");
                window.location.href = 'login.html';
            } else {
                alert("Gabim: " + result.message);
            }
        });
    }
});

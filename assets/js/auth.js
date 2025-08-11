document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    // Manejadores para los botones (simulados por ahora)
    loginBtn.addEventListener('click', () => {
        console.log('Redirigiendo a login...');
        // window.location.href = 'login.html'; // Descomentar cuando exista
        alert('Funcionalidad de login en desarrollo');
    });

    registerBtn.addEventListener('click', () => {
        console.log('Redirigiendo a registro...');
        // window.location.href = 'register.html'; // Descomentar cuando exista
        alert('Funcionalidad de registro en desarrollo');
    });
});
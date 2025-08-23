document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api'; // URL de tu backend

    // --- Elementos comunes para la UI de autenticación ---
    const authButtonsContainer = document.querySelector('.auth-buttons');
    const navLinksContainer = document.querySelector('.nav-links'); // Contenedor de los enlaces de navegación
    const categoriasLink = document.getElementById('navCategoriasLink'); // Referencia al enlace de categorías
    const adminProductosLink = document.getElementById('navAdminProductosLink'); // ✨ Referencia al enlace de Administrar Productos ✨

    /**
     * Muestra un mensaje en la interfaz de usuario.
     * @param {HTMLElement} element - El elemento HTML donde se mostrará el mensaje.
     * @param {string} message - El texto del mensaje.
     * @param {string} type - 'success' o 'error' para aplicar estilos.
     */
    function displayMessage(element, message, type) {
        if (element) {
            element.textContent = message;
            element.className = `auth-message ${type}`;
            element.style.display = 'block';
        }
    }

    /**
     * Guarda la información del usuario en localStorage, incluyendo el rolId.
     * @param {Object} userData - Objeto con id, nombre, email y rolId del usuario.
     */
    function saveUserSession(userData) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userName', userData.nombre);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userRolId', userData.rolId); // Guardar el rolId
        console.log('Sesión de usuario guardada:', userData);
    }

    /**
     * Elimina la información del usuario de localStorage.
     */
    function clearUserSession() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRolId'); // Eliminar el rolId
        console.log('Sesión de usuario cerrada.');
    }

    /**
     * Obtiene el estado de autenticación del usuario.
     * @returns {boolean} True si el usuario está logueado, false de lo contrario.
     */
    function getAuthStatus() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    /**
     * Obtiene el ID del rol del usuario logueado.
     * @returns {number|null} El ID del rol o null si no está logueado o no tiene rol.
     */
    function getUserRolId() {
        const rolId = localStorage.getItem('userRolId');
        return rolId ? parseInt(rolId) : null;
    }

    /**
     * Actualiza los botones del encabezado y la visibilidad de los enlaces de navegación
     * según el estado de autenticación y el rol del usuario.
     */
    function updateHeaderAuthUI() {
        if (!authButtonsContainer) return; // Asegura que el contenedor de botones exista

        authButtonsContainer.innerHTML = ''; // Limpia los botones existentes
        
        const isLoggedIn = getAuthStatus();
        const userRolId = getUserRolId();
        const isAdmin = isLoggedIn && userRolId === 1; // Rol 1 para administrador

        // Control de visibilidad para el enlace de Categorías
        if (categoriasLink) {
            categoriasLink.style.display = isAdmin ? '' : 'none'; // Mostrar si es admin, ocultar en caso contrario
        }

        // ✨ Control de visibilidad para el enlace de Administrar Productos ✨
        if (adminProductosLink) {
            adminProductosLink.style.display = isAdmin ? '' : 'none'; // Mostrar si es admin, ocultar en caso contrario
        }

        if (isLoggedIn) {
            const userName = localStorage.getItem('userName') || 'Usuario';
            
            const welcomeSpan = document.createElement('span');
            welcomeSpan.className = 'nav-welcome-text';
            welcomeSpan.textContent = `Hola, ${userName}`;
            authButtonsContainer.appendChild(welcomeSpan);

            const logoutButton = document.createElement('button');
            logoutButton.className = 'btn btn-outline';
            logoutButton.textContent = 'Cerrar Sesión';
            logoutButton.addEventListener('click', handleLogout);
            authButtonsContainer.appendChild(logoutButton);
        } else {
            const loginButton = document.createElement('a'); // Usar <a> para enlaces
            loginButton.href = 'login.html';
            loginButton.className = 'btn btn-outline';
            loginButton.textContent = 'Iniciar Sesión';
            authButtonsContainer.appendChild(loginButton);

            const registerButton = document.createElement('a'); // Usar <a> para enlaces
            registerButton.href = 'register.html';
            registerButton.className = 'btn btn-primary';
            registerButton.textContent = 'Registrarse';
            authButtonsContainer.appendChild(registerButton);
        }
    }

    /**
     * Maneja el envío del formulario de registro.
     * @param {Event} event - El evento de envío del formulario.
     */
    async function handleRegister(event) {
        event.preventDefault(); // Previene la recarga de la página
        const form = event.target;
        const registerMessage = document.getElementById('registerMessage');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        registerMessage.style.display = 'none'; // Oculta mensajes anteriores

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                displayMessage(registerMessage, 'Registro exitoso. ¡Ahora puedes iniciar sesión!', 'success');
                form.reset(); // Limpiar el formulario
                setTimeout(() => window.location.href = 'login.html', 2000);
            } else {
                displayMessage(registerMessage, result.error || 'Error al registrarse', 'error');
            }
        } catch (error) {
            console.error('Error durante el registro:', error);
            displayMessage(registerMessage, 'Error de conexión o del servidor', 'error');
        }
    }

    /**
     * Maneja el envío del formulario de login.
     * @param {Event} event - El evento de envío del formulario.
     */
    async function handleLogin(event) {
        event.preventDefault(); // Previene la recarga de la página
        const form = event.target;
        const loginMessage = document.getElementById('loginMessage');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        loginMessage.style.display = 'none'; // Oculta mensajes anteriores

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                displayMessage(loginMessage, 'Inicio de sesión exitoso. Redirigiendo...', 'success');
                saveUserSession(result.client); // Guarda la sesión del usuario, incluyendo rolId
                updateHeaderAuthUI(); // Actualiza el encabezado
                setTimeout(() => window.location.href = 'index.html', 1500); // Redirige al home
            } else {
                displayMessage(loginMessage, result.error || 'Credenciales inválidas', 'error');
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            displayMessage(loginMessage, 'Error de conexión o del servidor', 'error');
        }
    }

    /**
     * Maneja el cierre de sesión del usuario.
     */
    function handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) { 
            clearUserSession();
            updateHeaderAuthUI();
            window.location.href = 'index.html'; 
        }
    }
    
    // --- Inicialización ---
    updateHeaderAuthUI(); // Actualiza el encabezado al cargar cualquier página que incluya auth.js

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});
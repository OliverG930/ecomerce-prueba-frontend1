document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE_URL = 'http://localhost:5000/api';

    // Formularios y elementos
    const addProductForm = document.getElementById('addProductForm');
    const editProductForm = document.getElementById('editProductForm');
    const productsTableBody = document.getElementById('productsTableBody');
    const paginationContainer = document.getElementById('pagination');
    const addMessage = document.getElementById('addMessage');
    const editMessage = document.getElementById('editMessage');
    const deleteMessage = document.getElementById('deleteMessage');
    const categoriasSelect = document.getElementById('categoria_id');
    const editCategoriasSelect = document.getElementById('editCategoria_id');

    // Modales y confirmación
    const editProductModal = document.getElementById('editProductModal');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const deleteProductName = document.getElementById('deleteProductName');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    let currentProductIdToDelete = null;

    let currentPage = 1;
    const pageSize = 10;
    let availableCategories = [];

    // --------------------- Funciones auxiliares ---------------------
    function getAuthStatus() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    function getUserRolId() {
        const rolId = localStorage.getItem('userRolId');
        return rolId ? parseInt(rolId) : null;
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 }).format(price);
    }

    function displayMessage(element, message, type) {
        element.textContent = message;
        element.className = `auth-message ${type}`;
        element.style.display = 'block';
        setTimeout(() => element.style.display = 'none', 5000);
    }

    function hideMessage(element) {
        element.style.display = 'none';
    }

    // --------------------- Cargar categorías ---------------------
    async function fetchCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/categorias/`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP al cargar categorías: ${response.status} - ${errorText}`);
            }
            const result = await response.json();
            availableCategories = result.data || [];
            populateCategorySelects(availableCategories);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            displayMessage(addMessage, 'Error al cargar categorías: ' + error.message, 'error');
            displayMessage(editMessage, 'Error al cargar categorías: ' + error.message, 'error');
        }
    }

    function populateCategorySelects(categories, selectedCategoryId = null) {
        categoriasSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
        editCategoriasSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.nombre;
            categoriasSelect.appendChild(option);

            const editOption = option.cloneNode(true);
            if (selectedCategoryId && cat.id === selectedCategoryId) {
                editOption.selected = true;
            }
            editCategoriasSelect.appendChild(editOption);
        });
    }

    // --------------------- Cargar productos ---------------------
    async function loadProducts(page = 1) {
        productsTableBody.innerHTML = `<tr><td colspan="6" class="loading">Cargando productos...</td></tr>`;
        hideMessage(addMessage); hideMessage(editMessage); hideMessage(deleteMessage);

        try {
            const response = await fetch(`${API_BASE_URL}/productos/all?page=${page}&pageSize=${pageSize}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP al cargar productos: ${response.status} - ${errorText}`);
            }
            const apiResponse = await response.json();
            const products = apiResponse.data || [];
            const pagination = apiResponse.pagination || {};

            renderProductsTable(products);
            renderPagination(pagination);
            currentPage = page;
        } catch (error) {
            console.error('Error al cargar productos:', error);
            productsTableBody.innerHTML = `<tr><td colspan="6" class="error-message">Error al cargar productos: ${error.message}</td></tr>`;
            paginationContainer.innerHTML = '';
        }
    }

    function renderProductsTable(products) {
        if (!products.length) {
            productsTableBody.innerHTML = `<tr><td colspan="6" class="no-products">No hay productos disponibles.</td></tr>`;
            return;
        }
        productsTableBody.innerHTML = products.map(product => {
            const categoryName = availableCategories.find(c => c.id === product.categoria_id)?.nombre || 'N/A';
            return `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.nombre}</td>
                    <td>${categoryName}</td>
                    <td>${formatPrice(product.precio)}</td>
                    <td>${product.stock}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm edit-btn" data-id="${product.id}">Editar</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${product.id}" data-name="${product.nombre}">Eliminar</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Listeners para Editar/Eliminar
        productsTableBody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', e => openEditModal(e.target.dataset.id));
        });
        productsTableBody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', e => openDeleteConfirmModal(e.target.dataset.id, e.target.dataset.name));
        });
    }

    function renderPagination(pagination) {
        paginationContainer.innerHTML = '';
        if (!pagination || pagination.totalPages <= 1) return;

        if (pagination.hasPreviousPage) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '« Anterior';
            prevBtn.className = 'btn page-btn';
            prevBtn.addEventListener('click', () => loadProducts(currentPage - 1));
            paginationContainer.appendChild(prevBtn);
        }

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(pagination.totalPages, currentPage + 2);
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = `btn page-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.addEventListener('click', () => loadProducts(i));
            paginationContainer.appendChild(pageBtn);
        }

        if (pagination.hasNextPage) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Siguiente »';
            nextBtn.className = 'btn page-btn';
            nextBtn.addEventListener('click', () => loadProducts(currentPage + 1));
            paginationContainer.appendChild(nextBtn);
        }
    }

    // --------------------- Añadir Producto ---------------------
    addProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideMessage(addMessage);
        const formData = Object.fromEntries(new FormData(addProductForm).entries());
        formData.precio = parseFloat(formData.precio);
        formData.stock = parseInt(formData.stock);
        formData.categoria_id = parseInt(formData.categoria_id);

        try {
            const res = await fetch(`${API_BASE_URL}/productos/agr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error(await res.text());
            await res.json();
            displayMessage(addMessage, 'Producto añadido exitosamente!', 'success');
            addProductForm.reset();
            loadProducts(currentPage);
        } catch (err) {
            console.error(err);
            displayMessage(addMessage, 'Error al añadir producto: ' + err.message, 'error');
        }
    });

    // --------------------- Editar Producto ---------------------
    async function openEditModal(productId) {
        hideMessage(editMessage);
        try {
            const res = await fetch(`${API_BASE_URL}/productos/${productId}`);
            if (!res.ok) throw new Error(await res.text());
            const product = (await res.json()).data;

            if (!product) throw new Error('Producto no encontrado');
            document.getElementById('editProductId').value = product.id;
            document.getElementById('editNombre').value = product.nombre;
            document.getElementById('editDescripcion').value = product.descripcion || '';
            document.getElementById('editPrecio').value = product.precio;
            document.getElementById('editStock').value = product.stock;
            populateCategorySelects(availableCategories, product.categoria_id);

            editProductModal.style.display = 'block';
        } catch (err) {
            console.error(err);
            displayMessage(editMessage, 'Error al cargar producto para editar: ' + err.message, 'error');
        }
    }

    editProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideMessage(editMessage);
        const productId = document.getElementById('editProductId').value;
        const formData = Object.fromEntries(new FormData(editProductForm).entries());
        formData.precio = parseFloat(formData.precio);
        formData.stock = parseInt(formData.stock);
        formData.categoria_id = parseInt(formData.categoria_id);

        try {
            const res = await fetch(`${API_BASE_URL}/productos/upt/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error(await res.text());
            await res.json();
            displayMessage(editMessage, 'Producto actualizado exitosamente!', 'success');
            editProductModal.style.display = 'none';
            loadProducts(currentPage);
        } catch (err) {
            console.error(err);
            displayMessage(editMessage, 'Error al actualizar producto: ' + err.message, 'error');
        }
    });

    // --------------------- Eliminar Producto ---------------------
    function openDeleteConfirmModal(productId, productName) {
        hideMessage(deleteMessage);
        currentProductIdToDelete = productId;
        deleteProductName.textContent = productName;
        deleteConfirmModal.style.display = 'block';
    }

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!currentProductIdToDelete) return;
        try {
            const res = await fetch(`${API_BASE_URL}/productos/del/${currentProductIdToDelete}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(await res.text());
            await res.json();
            displayMessage(deleteMessage, 'Producto eliminado exitosamente!', 'success');
            deleteConfirmModal.style.display = 'none';
            loadProducts(currentPage);
        } catch (err) {
            console.error(err);
            displayMessage(deleteMessage, 'Error al eliminar producto: ' + err.message, 'error');
        } finally {
            currentProductIdToDelete = null;
        }
    });

    // --------------------- Cerrar modales ---------------------
    document.querySelectorAll('.close-button, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const modalId = e.target.dataset.modal || e.target.closest('.modal').id;
            document.getElementById(modalId).style.display = 'none';
        });
    });

    window.addEventListener('click', event => {
        if (event.target === editProductModal) editProductModal.style.display = 'none';
        if (event.target === deleteConfirmModal) deleteConfirmModal.style.display = 'none';
    });

    // --------------------- Inicialización ---------------------
    async function initializeAdminPage() {
        const isLoggedIn = getAuthStatus();
        const userRolId = getUserRolId();
        const isAdmin = isLoggedIn && userRolId === 1;
        const adminLink = document.getElementById('navAdminProductosLink');
        if (adminLink) adminLink.style.display = isAdmin ? '' : 'none';

        if (!isAdmin) {
            document.body.innerHTML = `<main class="container admin-page">
                <h2 class="section-title" style="margin-top:5rem;color:#ef4444;">Acceso Denegado</h2>
                <p class="error-message">Necesitas ser administrador para acceder a esta página. <a href="index.html">Ir al inicio</a></p>
            </main>`;
            return;
        }

        await fetchCategories();
        await loadProducts();
    }

    initializeAdminPage();
});


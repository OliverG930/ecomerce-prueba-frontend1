/*
document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('productsContainer');
    const paginationContainer = document.getElementById('pagination');
    let currentPage = 1;
    const pageSize = 10;
    
    // Inicia la carga de productos al cargar la página
    await loadProducts(currentPage);

    async function loadProducts(page) {
        // Muestra un estado de carga antes de la petición
        productsContainer.innerHTML = '<div class="loading">Cargando productos...</div>';
        
        try {
            const response = await fetch(`http://localhost:5000/api/productos/all?page=${page}&pageSize=${pageSize}`);

            if (!response.ok) {
                throw new Error(`Error HTTP! estado: ${response.status}`);
            }

            const apiResponse = await response.json(); // Cambiado de 'result' a 'apiResponse' para claridad
            
            // ✨ CORRECCIÓN 1: Accede al array de productos desde 'apiResponse.data'
            const productsData = apiResponse.data || []; 
            
            // Renderiza los productos obtenidos
            renderProducts(productsData);
            
            // Tu console.log ahora mostrará solo el array de productos
            console.log('Datos de productos para renderizar:', productsData);
            
            // ✨ CORRECCIÓN 2: Accede a la paginación desde 'apiResponse.pagination'
            // También verificamos que totalItems sea mayor que 0 para renderizar la paginación
            if (apiResponse.pagination && apiResponse.pagination.totalItems > 0) {
                renderPagination(apiResponse.pagination);
            } else {
                // Si no hay paginación o el total es 0, limpia el contenedor
                paginationContainer.innerHTML = '';
            }

        } catch (error) {
            console.error('Error al cargar productos:', error);
            productsContainer.innerHTML = `
                <div class="error">
                    <p>Error al cargar productos</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    function renderProducts(products) {
        if (!products.length) {
            productsContainer.innerHTML = '<p class="no-products">No hay productos disponibles en este momento.</p>';
            return;
        }

        productsContainer.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image"><span>Imagen de ${product.nombre}</span></div>
                <div class="product-info">
                    <h4 class="product-title">${product.nombre}</h4>
                    <p class="product-description">${product.descripcion || 'Sin descripción'}</p>
                    <p class="product-price">${formatPrice(product.precio)} PYG</p>
                    <p class="product-stock">Disponibles: ${product.stock}</p>
                    <button class="btn btn-primary" data-product-id="${product.id}">Agregar al carrito</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.btn-primary').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                addToCart(productId);
            });
        });
    }

    function renderPagination(pagination) {
        paginationContainer.innerHTML = '';
        if (!pagination || pagination.totalPages <= 1) return;
        
        if (pagination.hasPreviousPage) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '« Anterior';
            prevBtn.className = 'pagination-btn';
            prevBtn.addEventListener('click', () => {
                currentPage--;
                loadProducts(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(prevBtn);
        }
        
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(pagination.totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                loadProducts(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageBtn);
        }
        
        if (pagination.hasNextPage) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Siguiente »';
            nextBtn.className = 'pagination-btn';
            nextBtn.className = 'pagination-btn';
            nextBtn.addEventListener('click', () => {
                currentPage++;
                loadProducts(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(nextBtn);
        }
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('es-PY').format(price);
    }
});

function addToCart(productId) {
    console.log('Agregando producto:', productId);
    alert(`Producto ${productId} agregado al carrito`);
}
*/
document.addEventListener('DOMContentLoaded', async () => {
    // Referencias a los contenedores del DOM
    const productsContainer = document.getElementById('productsContainer');
    const paginationContainer = document.getElementById('pagination');
    
    // URL base de tu API (¡Asegúrate de que sea la correcta!)
    const API_BASE_URL = 'http://localhost:5000/api';

    // Variables de estado para la paginación
    let currentPage = 1;
    const pageSize = 10;
    
    // Inicia la carga de productos al cargar la página
    await loadProducts(currentPage);

    /**
     * Carga los productos desde la API para la página y tamaño especificados.
     * Muestra un estado de carga, maneja la respuesta y los errores.
     * @param {number} page - El número de página a cargar.
     */
    async function loadProducts(page) {
        // Muestra un estado de carga antes de la petición
        productsContainer.innerHTML = '<div class="loading">Cargando productos...</div>';
        
        try {
            console.log(`Realizando fetch a: ${API_BASE_URL}/productos/all?page=${page}&pageSize=${pageSize}`);
            const response = await fetch(`${API_BASE_URL}/productos/all?page=${page}&pageSize=${pageSize}`);

            if (!response.ok) {
                // Si la respuesta no es OK, lanza un error para que el 'catch' lo maneje
                const errorText = await response.text();
                throw new Error(`Error HTTP! estado: ${response.status}. Detalle: ${errorText}`);
            }

            const apiResponse = await response.json();
            console.log('Respuesta completa de la API (apiResponse):', apiResponse);
            
            // Accede al array de productos desde 'apiResponse.data'
            const productsData = apiResponse.data || []; 
            
            // Renderiza los productos obtenidos
            renderProducts(productsData);
            
            // Si el backend envía información de paginación y hay ítems, renderiza la paginación
            // Nota: totalItems debe ser > 0 para que la paginación se muestre
            if (apiResponse.pagination && apiResponse.pagination.totalItems > 0) {
                renderPagination(apiResponse.pagination);
            } else {
                // Si no hay paginación o el total es 0, limpia el contenedor
                paginationContainer.innerHTML = '';
            }

        } catch (error) {
            // Muestra un mensaje de error legible al usuario
            console.error('Error al cargar productos:', error);
            productsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar productos</p>
                    <small>${error.message}</small>
                </div>
            `;
            paginationContainer.innerHTML = ''; // Limpia la paginación en caso de error
        }
    }

    /**
     * Renderiza las tarjetas de productos en el contenedor principal.
     * Cada tarjeta es un enlace a la página de detalle del producto.
     * @param {Array<Object>} products - Array de objetos de productos a renderizar.
     */
    function renderProducts(products) {
        if (!products.length) {
            productsContainer.innerHTML = '<p class="no-products">No hay productos disponibles en este momento.</p>';
            return;
        }

        // Genera el HTML para todos los productos en una sola cadena
        productsContainer.innerHTML = products.map(product => `
            <!-- Envuelve toda la tarjeta en un enlace -->
            <a href="producto-detalle.html?id=${product.id}" class="product-card-link">
                <div class="product-card">
                    <div class="product-image">
                        <!-- Placeholder de imagen. Puedes reemplazar con product.imageUrl si tu API lo provee -->
                        <img src="https://placehold.co/200x150/d1d5db/000000?text=${encodeURIComponent(product.nombre.substring(0, 10))}" alt="${product.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/200x150/d1d5db/000000?text=No+Image';">
                    </div>
                    <div class="product-info">
                        <h4 class="product-title">${product.nombre}</h4>
                        <p class="product-description">${product.descripcion ? product.descripcion.substring(0, 50) + '...' : 'Sin descripción'}</p>
                        <p class="product-price">${formatPrice(product.precio)} PYG</p>
                        <p class="product-stock">Disponibles: ${product.stock}</p>
                    </div>
                </div>
            </a>
        `).join('');
    }

    /**
     * Renderiza los botones de paginación.
     * @param {Object} pagination - Objeto con la información de paginación (totalItems, totalPages, etc.).
     */
    function renderPagination(pagination) {
        paginationContainer.innerHTML = '';
        // Solo renderiza la paginación si hay más de una página
        if (!pagination || pagination.totalPages <= 1) return;
        
        // Botón "Anterior"
        if (pagination.hasPreviousPage) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '« Anterior';
            prevBtn.className = 'btn page-btn'; // Clases de tus estilos
            prevBtn.addEventListener('click', () => {
                currentPage--;
                loadProducts(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(prevBtn);
        }
        
        // Botones de número de página
        // Muestra un rango de páginas alrededor de la página actual
        const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(pagination.totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = `btn page-btn ${i === currentPage ? 'active' : ''}`; // Clases de tus estilos
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                loadProducts(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageBtn);
        }
        
        // Botón "Siguiente"
        if (pagination.hasNextPage) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Siguiente »';
            nextBtn.className = 'btn page-btn'; // Clases de tus estilos
            nextBtn.addEventListener('click', () => {
                currentPage++;
                loadProducts(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(nextBtn);
        }
    }

    /**
     * Formatea un número como precio en PYG.
     * @param {number} price - El precio a formatear.
     * @returns {string} El precio formateado.
     */
    function formatPrice(price) {
        return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 }).format(price);
    }
});



document.addEventListener('DOMContentLoaded', async () => {
    const productDetailContainer = document.getElementById('productDetailContainer');

    /**
     * Obtiene el valor de un parámetro de la URL.
     * @param {string} name - El nombre del parámetro.
     * @returns {string} El valor del parámetro o una cadena vacía si no se encuentra.
     */
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Función para obtener el estado de autenticación (debería ser la misma que en auth.js)
    function getAuthStatus() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    const productId = getUrlParameter('id');

    if (productId) {
        await loadProductDetail(productId);
    } else {
        productDetailContainer.innerHTML = '<p class="error-message">ID de producto no especificado.</p>';
    }

    /**
     * Carga el detalle de un producto específico desde la API.
     * @param {string} id - El ID del producto a cargar.
     */
    async function loadProductDetail(id) {
        productDetailContainer.innerHTML = '<div class="loading">Cargando detalle del producto...</div>';
        try {
            const response = await fetch(`http://localhost:5000/api/productos/By/${id}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP! estado: ${response.status}. Detalle: ${errorText}`);
            }

            const apiResponse = await response.json();
            const product = apiResponse.data ? apiResponse.data : apiResponse;

            if (product) {
                renderProductDetail(product);
            } else {
                productDetailContainer.innerHTML = '<p class="no-products">Producto no encontrado.</p>';
            }

        } catch (error) {
            console.error('Error al cargar el detalle del producto:', error);
            productDetailContainer.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar el detalle del producto</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    /**
     * Renderiza la información detallada de un producto.
     * Oculta las opciones de compra si el usuario no está autenticado.
     * @param {Object} product - Objeto con la información del producto.
     */
    function renderProductDetail(product) {
        productDetailContainer.innerHTML = `
            <div class="product-detail-header">
                <h2 class="product-title-detail">${product.nombre}</h2>
            </div>
            <div class="product-detail-content-wrapper">
                <div class="product-image-detail">
                    <img src="https://placehold.co/400x300/d1d5db/000000?text=${encodeURIComponent(product.nombre.substring(0, 15))}" alt="${product.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/400x300/d1d5db/000000?text=No+Image';">
                </div>
                <div class="product-info-detail">
                    <p class="product-description-detail">${product.descripcion || 'Sin descripción detallada.'}</p>
                    <p class="product-price-detail">Precio: ${formatPrice(product.precio)} PYG</p>
                    <p class="product-stock-detail">Disponibles: ${product.stock}</p>
                    <p class="product-category-detail">Categoría: ${product.categoria_nombre || 'N/A'}</p>
                    
                    <div class="product-actions-detail" id="productActions">
                        <!-- Las opciones de compra se renderizarán aquí si el usuario está logueado -->
                    </div>
                </div>
            </div>
        `;

        const productActionsDiv = document.getElementById('productActions');
        if (getAuthStatus()) {
            productActionsDiv.innerHTML = `
                <input type="number" id="quantityInput" value="1" min="1" max="${product.stock}" class="quantity-input">
                <button class="btn btn-primary add-to-cart-btn">Agregar al carrito</button>
            `;

            // Añadir evento al botón "Agregar al carrito"
            const addToCartBtn = productActionsDiv.querySelector('.add-to-cart-btn');
            const quantityInput = productActionsDiv.querySelector('#quantityInput');

            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => {
                    const quantity = parseInt(quantityInput.value);
                    if (isNaN(quantity) || quantity < 1) {
                        alert('Por favor, ingresa una cantidad válida.');
                        return;
                    }
                    if (quantity > product.stock) {
                        alert(`No puedes agregar más de ${product.stock} productos de los disponibles.`);
                        return;
                    }
                    addToCart(product.id, quantity);
                });
            }
        } else {
            productActionsDiv.innerHTML = '<p class="auth-required-message">Inicia sesión para comprar este producto.</p>';
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

/**
 * Función global para agregar productos al carrito.
 * @param {number} productId - El ID del producto.
 * @param {number} quantity - La cantidad de producto a agregar.
 */
function addToCart(productId, quantity = 1) {
    console.log(`Agregando ${quantity} unidades del producto ${productId} al carrito`);
    alert(`Se agregaron ${quantity} unidades del producto ${productId} al carrito.`);
    // Aquí puedes añadir la lógica real para agregar al carrito:
    // - Guardar en localStorage
    // - Enviar a una API de carrito
}

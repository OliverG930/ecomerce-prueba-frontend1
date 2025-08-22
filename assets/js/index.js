document.addEventListener('DOMContentLoaded', async () => {
    const featuredProductsContainer = document.getElementById('featuredProductsContainer');
    const API_BASE_URL = 'http://localhost:5000/api'; // Asegúrate de que esta URL sea correcta

    // Función auxiliar para formatear precios (mantener aquí si no se comparte globalmente con productos.js)
    function formatPrice(price) {
        return new Intl.NumberFormat('es-PY').format(price);
    }

    /**
     * Carga y renderiza los productos destacados desde la API.
     */
    async function loadFeaturedProducts() {
        console.log('Inicio: loadFeaturedProducts');
        featuredProductsContainer.innerHTML = '<div class="loading">Cargando productos destacados...</div>';
        
        try {
            console.log(`Realizando fetch a: ${API_BASE_URL}/productos/all?page=1&pageSize=4`);
            const response = await fetch(`${API_BASE_URL}/productos/all?page=1&pageSize=4`); 
            
            if (!response.ok) {
                const errorText = await response.text(); // Intenta leer el cuerpo del error
                throw new Error(`Error HTTP! estado: ${response.status}. Detalle: ${errorText}`);
            }

            const apiResponse = await response.json();
            console.log('Respuesta completa de la API (apiResponse):', apiResponse);

            // Accede a la propiedad 'data' del objeto de respuesta, que debería ser el array de productos
            const productsData = apiResponse.data || [];
            console.log('Datos de productos extraídos (productsData):', productsData);

            if (productsData.length > 0) {
                console.log(`Se encontraron ${productsData.length} productos destacados. Renderizando...`);
                renderFeaturedProducts(productsData);
            } else {
                console.log('No se encontraron productos destacados. Mostrando mensaje de no productos.');
                featuredProductsContainer.innerHTML = '<p class="no-products">No hay productos destacados disponibles en este momento.</p>';
            }

        } catch (error) {
            console.error('Error al cargar productos destacados (catch):', error);
            featuredProductsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar productos destacados</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
        console.log('Fin: loadFeaturedProducts');
    }

    /**
     * Renderiza un array de productos en el contenedor de destacados.
     * @param {Array<Object>} products - Array de objetos de productos a renderizar.
     */
    function renderFeaturedProducts(products) {
        if (!featuredProductsContainer) {
            console.error('Error: featuredProductsContainer no fue encontrado en el DOM.');
            return;
        }

        console.log('Iniciando renderFeaturedProducts con productos:', products);
        const productsHtml = products.map(product => {
            // Verifica que el ID del producto sea válido antes de generar el enlace
            if (!product || !product.id) {
                console.warn('Producto inválido encontrado (falta ID):', product);
                return ''; // Retorna una cadena vacía para saltar este producto
            }

            // Usa un placeholder de imagen más robusto
            const imageUrl = product.imagen 
                ? product.imagen 
                : `https://placehold.co/200x150/d1d5db/000000?text=${encodeURIComponent(product.nombre.substring(0, 10))}`;

            return `
                <a href="producto-detalle.html?id=${product.id}" class="product-card-link">
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${imageUrl}" alt="${product.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/200x150/d1d5db/000000?text=No+Image';">
                        </div>
                        <div class="product-info">
                            <h4 class="product-title">${product.nombre}</h4>
                            <p class="product-description">${product.descripcion ? product.descripcion.substring(0, 50) + '...' : 'Sin descripción'}</p>
                            <p class="product-price">${formatPrice(product.precio)} PYG</p>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
        
        featuredProductsContainer.innerHTML = productsHtml;
        console.log('featuredProductsContainer actualizado con HTML de productos.');
    }

    // Cargar productos destacados al inicio
    loadFeaturedProducts();
});

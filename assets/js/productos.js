document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('productsContainer');
    const paginationContainer = document.getElementById('pagination');
    let currentPage = 1;
    const pageSize = 8;

    await loadProducts(currentPage);

    async function loadProducts(page) {
        try {
            const response = await fetch(`http://localhost:5000/api/productos/all?page=${page}&pageSize=${pageSize}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP! estado: ${response.status}`);
            }

            const result = await response.json();
            
            // Usamos directamente lo que viene del backend
            const productsData = result.data || [];
            renderProducts(productsData);
            
            if (result.pagination && result.pagination.totalItems > 0) {
                renderPagination(result.pagination);
            } else {
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
                <div class="product-image">
                    <span>Imagen de ${product.nombre}</span>
                </div>
                <div class="product-info">
                    <h4 class="product-title">${product.nombre}</h4>
                    <p class="product-description">${product.descripcion || 'Sin descripción'}</p>
                    <p class="product-price">${formatPrice(product.precio)} PYG</p>
                    <p class="product-stock">Disponibles: ${product.stock}</p>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">Agregar al carrito</button>
                </div>
            </div>
        `).join('');
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

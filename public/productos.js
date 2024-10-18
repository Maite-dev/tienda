document.addEventListener('DOMContentLoaded', () => {
    const productList = document.querySelector('.product-list');

    // Cargar productos desde el servidor
    fetch('/productos') // Asegúrate de que esta ruta sea correcta
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                productList.innerHTML = '<tr><td colspan="3">No hay productos disponibles.</td></tr>';
                return;
            }
            data.forEach(producto => {
                const productRow = document.createElement('tr');
                productRow.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>$${producto.precio}</td>
                    <td>${producto.stock}</td>
                `;
                productList.appendChild(productRow);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            productList.innerHTML = `<tr><td colspan="3">${error.message}</td></tr>`;
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const productList = document.querySelector('.product-list');

    // Cargar productos al inicio
    fetch('/productos') // Esta URL debe apuntar a tu servidor que maneja PostgreSQL
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                productList.innerHTML = '<p>No hay productos disponibles.</p>';
                return;
            }
            data.forEach(producto => {
                const productItem = document.createElement('div');
                productItem.className = 'product-item'; // Agregar clase para estilo
                productItem.innerText = `${producto.nombre} - Precio: $${producto.precio} - Stock: ${producto.stock}`;
                productList.appendChild(productItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            productList.innerHTML = `<p>${error.message}</p>`;
        });

    // Manejar la adición de un nuevo producto
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const precio = document.getElementById('precio').value;
            const stock = document.getElementById('stock').value;

            // Usar la URL del servidor local para enviar datos a PostgreSQL
            fetch('http://localhost:3000/productos', { // Apunta a tu servidor backend local
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{ nombre, precio, stock }]) // Enviar como array de productos
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al agregar el producto');
                }
                return response.json();
            })
            .then(data => {
                alert('Producto agregado exitosamente'); // Muestra el mensaje de éxito
                addProductForm.reset(); // Limpiar el formulario
                location.reload(); // Recargar la página para mostrar el nuevo producto
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al agregar el producto: ' + error.message);
            });
        });
    }

    // Manejar la carga de CSV
    const csvUploadForm = document.getElementById('csv-upload-form');
    if (csvUploadForm) {
        csvUploadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(csvUploadForm);
            fetch('/cargar-csv', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el archivo CSV');
                }
                return response.text();
            })
            .then(data => {
                alert(data);
                location.reload(); // Recargar la página después de cargar el CSV
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al cargar el archivo CSV: ' + error.message);
            });
        });
    }
});

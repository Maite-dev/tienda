document.getElementById('add-product-form').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const stock = document.getElementById('stock').value;
  
    const producto = { nombre, precio, stock };
  
    fetch('/api/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([producto]) // Enviar el producto como array
    })
    .then(response => response.text())
    .then(data => {
      alert('Producto agregado exitosamente');
    })
    .catch(error => {
      console.error('Error al agregar producto:', error);
    });
  });

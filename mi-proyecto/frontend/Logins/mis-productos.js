/**
 * mis-productos.js - Gestión de Ventas Propias
 * Solo muestra los productos del usuario logueado.
 */

 async function cargarMisVentas() {
    const contenedor = document.getElementById('lista-mis-productos');
    const mensajeVacio = document.getElementById('mensaje-vacio');
    const miId = localStorage.getItem('user_id');

    // --- 1. CERROJO DE SEGURIDAD ---
    if (!miId) {
        alert("Debes iniciar sesión para ver tus ventas.");
        window.location.href = "Login.html";
        return;
    }

    try {
        // --- 2. PETICIÓN AL SERVIDOR ---
        const respuesta = await fetch('http://localhost:5000/productos');
        const todosLosProductos = await respuesta.json();

        // --- 3. FILTRADO (Pepe vs Pepa) ---
        const misProductos = todosLosProductos.filter(p => String(p.vendedor_id) === String(miId));

        if (misProductos.length === 0) {
            mensajeVacio.classList.remove('d-none');
            contenedor.innerHTML = "";
            return;
        }

        // --- 4. DIBUJAR TARJETAS ---
        mensajeVacio.classList.add('d-none');
        contenedor.innerHTML = "";
        
        misProductos.forEach(p => {
            contenedor.innerHTML += `
                <div class="col">
                    <div class="card h-100 shadow-sm border-0">
                        <!-- Imagen subida desde el dispositivo -->
                        <img src="${p.imagen}" class="card-img-top" alt="${p.nombre}" 
                             style="height: 200px; object-fit: cover;" 
                             onerror="this.src='https://via.placeholder.com'">
                        
                        <div class="card-body">
                            <h5 class="fw-bold">${p.nombre} <span class="badge bg-success float-end">${p.precio}€</span></h5>
                            <p class="text-muted small mb-3">${p.descripcion || ''}</p>
                            
                            <div class="d-grid mt-2">
                                <button onclick="eliminarVenta(${p.id})" class="btn btn-outline-danger btn-sm">
                                    Eliminar Anuncio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error("Error cargando tus ventas:", error);
    }
}

/**
 * Función para borrar el producto de la DB
 */
async function eliminarVenta(id) {
    if (!confirm("¿Seguro que quieres borrar este mueble de la base de datos?")) return;

    try {
        const respuesta = await fetch(`http://localhost:5000/productos/${id}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            alert("Producto eliminado correctamente");
            cargarMisVentas(); // Recargamos la lista
        } else {
            alert("No se pudo eliminar el producto");
        }
    } catch (error) {
        alert("Error de conexión al intentar borrar");
    }
}

// Único arranque: llamamos a la función con el bloqueo
document.addEventListener('DOMContentLoaded', cargarMisVentas);
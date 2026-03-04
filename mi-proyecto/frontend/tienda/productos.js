/**
 * productos.js - Motor dinámico de Tienda y Detalles
 * Incluye bloqueo de seguridad para compras sin sesión.
 */

 async function cargarDatosTienda() {
    const contenedorTienda = document.getElementById('contenedor-productos');
    const contenedorDetalle = document.getElementById('detalle-producto');

    try {
        // Pedimos los muebles al servidor Flask
        const respuesta = await fetch('http://localhost:5000/productos');
        const productos = await respuesta.json();

        // --- 1. LÓGICA PARA LA TIENDA (Tienda.html) ---
        if (contenedorTienda) {
            contenedorTienda.innerHTML = ""; 
            
            productos.forEach(p => {
                contenedorTienda.innerHTML += `
                    <div class="col">
                        <div class="card h-100 border-0 shadow-sm">
                            <img src="${p.imagen}" class="card-img-top" alt="${p.nombre}" style="height:250px; object-fit:cover;">
                            <div class="card-body d-flex flex-column text-center">
                                <h5 class="card-title fw-bold">${p.nombre}</h5>
                                <p class="card-text text-muted small flex-grow-1">${p.descripcion}</p>
                                <p class="h4 fw-bold mb-3 text-success">${p.precio}€</p>
                                
                                <!-- BOTÓN DETALLES -->
                                <a href="detalles.html?id=${p.id}" class="btn btn-dark w-100 mb-2">Ver Detalles</a>
                                
                                <!-- BOTÓN COMPRAR CON BLOQUEO -->
                                <button onclick="realizarCompra('${p.nombre}', '${p.vendedor}')" class="btn btn-outline-success w-100 btn-sm">Comprar ahora</button>
                            </div>
                            <div class="card-footer bg-transparent border-0 text-center pb-3">
                                <small class="text-muted">Vendido por: <span class="fw-bold text-dark">${p.vendedor}</span></small>
                            </div>
                        </div>
                    </div>`;
            });
        }

        // --- 2. LÓGICA PARA DETALLES (detalles.html) ---
        if (contenedorDetalle) {
            const params = new URLSearchParams(window.location.search);
            const idUrl = params.get('id');
            const p = productos.find(item => item.id == idUrl);

            if (p) {
                contenedorDetalle.innerHTML = `
                    <div class="col-md-6">
                        <img src="${p.imagen}" class="img-fluid rounded shadow-lg" style="max-height:500px; width:100%; object-fit:cover;">
                    </div>
                    <div class="col-md-6">
                        <small class="text-uppercase text-muted fw-bold">Vendido por: ${p.vendedor}</small>
                        <h1 class="fw-bold display-5 mt-2">${p.nombre}</h1>
                        <h2 class="text-success my-4 fw-bold">${p.precio}€</h2>
                        <hr>
                        <h5 class="fw-bold">Descripción completa:</h5>
                        <p class="text-muted lead">${p.detalles || p.descripcion}</p>
                        <div class="d-grid gap-2 mt-5">
                            <button onclick="realizarCompra('${p.nombre}', '${p.vendedor}')" class="btn btn-dark btn-lg py-3 fw-bold">Comprar ahora</button>
                            <a href="Tienda.html" class="btn btn-outline-secondary">← Volver a la Tienda</a>
                        </div>
                    </div>`;
            } else {
                contenedorDetalle.innerHTML = "<h3>Mueble no encontrado en la base de datos.</h3>";
            }
        }
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

/**
 * --- CERROJO DE SEGURIDAD ---
 * No permite comprar si no hay una sesión activa en localStorage
 */
function realizarCompra(producto, vendedor) {
    const userId = localStorage.getItem('user_id');

    if (!userId) {
        alert("¡Alto! Debes iniciar sesión para poder comprar muebles.");
        window.location.href = "../logins/Login.html";
        return;
    }

    alert(`¡Solicitud enviada!\n\nHas pedido comprar: ${producto}.\nEl vendedor (${vendedor}) recibirá un aviso con tus datos.`);
}

// Arrancamos la carga cuando el HTML esté listo
document.addEventListener('DOMContentLoaded', cargarDatosTienda);
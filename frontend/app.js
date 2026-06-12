// --- ELEMENTOS DE MÓDULO DE CONSULTA ---
const codigoInput = document.getElementById('codigoInput');
const btnBuscar = document.getElementById('btnBuscar');
const resultCard = document.getElementById('resultCard');
const errorTxt = document.getElementById('errorTxt');

// --- ELEMENTOS DE MÓDULO DE REGISTRO ---
const btnRegistrar = document.getElementById('btnRegistrar');
const regSuccessTxt = document.getElementById('regSuccessTxt');
const regErrorTxt = document.getElementById('regErrorTxt');
// ==========================================
// CONTROLADOR DE PESTAÑAS (MODULAR UX)
// ==========================================
function switchTab(tabId) {
    // 1. Quitar el estado activo de todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // 2. Ocultar todos los contenidos de módulos
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active-content'));
    
    // 3. Activar el botón que presionó el usuario
    const clickedBtn = Array.from(document.querySelectorAll('.tab-navigation button')).find(btn => btn.getAttribute('onclick').includes(tabId));
    if (clickedBtn) clickedBtn.classList.add('active');
    
    // 4. Mostrar el módulo correspondiente con su animación elegante
    document.getElementById(tabId).classList.add('active-content');

    // Limpiar alertas previas al cambiar de módulo
    errorTxt.style.display = 'none';
    resultCard.style.display = 'none';
    regSuccessTxt.style.display = 'none';
    regErrorTxt.style.display = 'none';
    movSuccessTxt.style.display = 'none';
    movErrorTxt.style.display = 'none';
}

// ... AQUÍ DEBAJO SIGUE TODO TU CÓDIGO ANTERIOR RECIENTE DE:
// buscarActivo(), registrarActivo() y registrarTraslado()...
// ==========================================
// 1. FUNCIÓN: BUSCAR ACTIVO (GET)
// ==========================================
async function buscarActivo() {
    const codigo = codigoInput.value.trim();
    if (!codigo) return;

    resultCard.style.display = 'none';
    errorTxt.style.display = 'none';

    try {
        const response = await fetch(`http://127.0.0.1:8000/activos/${codigo}`);
        
        if (!response.ok) throw new Error();

        const activo = await response.json();

        document.getElementById('resNombre').innerText = activo.nombre;
        document.getElementById('resMarca').innerText = activo.marca;
        document.getElementById('resModelo').innerText = activo.modelo;
        document.getElementById('resUbicacion').innerText = activo.ubicacion_actual;
        document.getElementById('resEstado').innerText = activo.estado || 'Operativo';

        resultCard.style.display = 'block';

    } catch (error) {
        errorTxt.style.display = 'block';
    }
}

// ==========================================
// 2. FUNCIÓN: REGISTRAR ACTIVO (POST)
// ==========================================
async function registrarActivo() {
    // Capturamos los datos del formulario
    const codigo_barras = document.getElementById('regCodigo').value.trim();
    const nombre = document.getElementById('regNombre').value.trim();
    const marca = document.getElementById('regMarca').value.trim();
    const modelo = document.getElementById('regModelo').value.trim();
    const ubicacion_actual = document.getElementById('regUbicacion').value.trim();

    // Validación simple de campos vacíos
    if (!codigo_barras || !nombre || !marca || !modelo || !ubicacion_actual) {
        alert("Por favor, llena todos los campos obligatorios.");
        return;
    }

    regSuccessTxt.style.display = 'none';
    regErrorTxt.style.display = 'none';

    // Creamos el objeto JSON tal como lo pide tu modelo Pydantic del backend
    const nuevoActivo = {
        codigo_barras,
        nombre,
        marca,
        modelo,
        ubicacion_actual,
        estado: "Operativo"
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/activos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoActivo)
        });

        if (!response.ok) throw new Error();

        // Si todo sale bien, mostramos éxito y limpiamos el formulario
        regSuccessTxt.style.display = 'block';
        document.getElementById('formRegistro').reset();

    } catch (error) {
        regErrorTxt.style.display = 'block';
    }
}

// --- EVENTOS DEL SISTEMA ---
btnBuscar.addEventListener('click', buscarActivo);
codigoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarActivo(); });

btnRegistrar.addEventListener('click', registrarActivo);

// --- ELEMENTOS DE MÓDULO DE TRASLADOS ---
const btnTrasladar = document.getElementById('btnTrasladar');
const movSuccessTxt = document.getElementById('movSuccessTxt');
const movErrorTxt = document.getElementById('movErrorTxt');
cargarHistorialTraslados();

// ==========================================
// 3. FUNCIÓN: REGISTRAR MOVIMIENTO/TRASLADO (POST)
// ==========================================
async function registrarTraslado() {



// ==========================================
// 4. FUNCIÓN: TRAER EL HISTORIAL DESDE TU API REAL
// ==========================================
async function cargarHistorialTraslados() {
    const tablaBody = document.getElementById('tablaHistorialBody');
    if (!tablaBody) return; // Evita errores si no encuentra la tabla
    
    try {
        const response = await fetch('http://127.0.0.1:8000/historial');
        if (!response.ok) throw new Error();
        
        const data = await response.json();
        const movimientos = data.registros; 
        
        if (!movimientos || movimientos.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #86868b; padding: 20px;">No hay traslados registrados en el sistema.</td></tr>`;
            return;
        }
        
        tablaBody.innerHTML = '';
        
        [...movimientos].reverse().forEach(mov => {
            let fechaFormateada = mov.fecha_movimiento;
            if (fechaFormateada) {
                fechaFormateada = new Date(fechaFormateada).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
            } else {
                fechaFormateada = "Reciente";
            }

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td style="font-weight: 600; color: #0071e3;">${mov.codigo_barras}</td>
                <td>${mov.nueva_ubicacion}</td>
                <td style="color: #86868b;">${fechaFormateada}</td>
                <td style="text-align: center;"><span style="background: #f5f5f7; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">ID: ${mov.id_usuario}</span></td>
            `;
            tablaBody.appendChild(fila);
        });
        
    } catch (error) {
        console.error("Error cargando historial:", error);
        tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ff3b30; padding: 20px;">Error al conectar con el servidor de historial.</td></tr>`;
    }
}




    const codigo_barras = document.getElementById('movCodigo').value.trim();
    const nueva_ubicacion = document.getElementById('movUbicacion').value.trim();
    const id_usuario = document.getElementById('movUsuario').value.trim();

    if (!codigo_barras || !nueva_ubicacion || !id_usuario) {
        alert("Por favor, rellena todos los campos para el traslado.");
        return;
    }

    movSuccessTxt.style.display = 'none';
    movErrorTxt.style.display = 'none';

    // Construimos el JSON con la estructura exacta que espera tu 'MovimientoInput' del backend
    const nuevoMovimiento = {
        codigo_barras: codigo_barras,
        id_usuario: parseInt(id_usuario),
        nueva_ubicacion: nueva_ubicacion,
        observaciones: "Traslado rutinario desde interfaz de control"
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/movimientos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoMovimiento)
        });

        if (!response.ok) throw new Error();

        // Éxito: Mostramos mensaje y limpiamos campos
        movSuccessTxt.style.display = 'block';
        document.getElementById('formMovimiento').reset();
        
        // Opcional: Si el activo modificado estaba abierto en la consulta de la izquierda, la refresca solo
        if (codigoInput.value.trim() === codigo_barras) {
            buscarActivo();
        }

    } catch (error) {
        movErrorTxt.style.display = 'block';
    }
}

// Escuchar el botón de traslado
btnTrasladar.addEventListener('click', registrarTraslado);


// ==========================================
// 4. FUNCIÓN: TRAER EL HISTORIAL DESDE TU API REAL
// ==========================================
async function cargarHistorialTraslados() {
    const tablaBody = document.getElementById('tablaHistorialBody');
    
    try {
        // 1. Apuntamos a tu endpoint real de historial
        const response = await fetch('http://127.0.0.1:8000/historial');
        
        if (!response.ok) throw new Error();
        
        const data = await response.json();
        
        // 2. Extraemos el arreglo 'registros' que viene en tu JSON del backend
        const movimientos = data.registros; 
        
        // Si no hay traslados guardados todavía en la BD
        if (!movimientos || movimientos.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #86868b; padding: 20px;">No hay traslados registrados en el sistema.</td></tr>`;
            return;
        }
        
        // Limpiamos la tabla antes de rellenarla
        tablaBody.innerHTML = '';
        
        // 3. Los recorremos en reversa para mostrar los más nuevos arriba en el historial
        // Hacemos una copia con el operador spread [...] para no alterar el array original
        [...movimientos].reverse().forEach(mov => {
            // Formateamos la fecha si tu backend la provee
            let fechaFormateada = mov.fecha_movimiento;
            if (fechaFormateada) {
                fechaFormateada = new Date(fechaFormateada).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
            } else {
                fechaFormateada = "Reciente";
            }

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td style="font-weight: 600; color: #0071e3;">${mov.codigo_barras}</td>
                <td>${mov.nueva_ubicacion}</td>
                <td style="color: #86868b;">${fechaFormateada}</td>
                <td style="text-align: center;"><span style="background: #f5f5f7; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">ID: ${mov.id_usuario}</span></td>
            `;
            tablaBody.appendChild(fila);
        });
        
    } catch (error) {
        console.error("Error cargando historial:", error);
        tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ff3b30; padding: 20px;">Error al conectar con el servidor de historial.</td></tr>`;
    }
}

// ==========================================
// MODIFICACIÓN DE LA FUNCIÓN DE TRASLADO EXISTENTE
// ==========================================
// Vamos a hacer que cuando registres un traslado con éxito, la tabla se actualice sola de inmediato.
// Busca dentro de tu función registrarTraslado() actual y, justo debajo de donde dice:
// movSuccessTxt.style.display = 'block';
// AGREGA ESTA LÍNEA DE CÓDIGO:
// cargarHistorialTraslados(); 


// ==========================================
// DISPARADORES AUTOMÁTICOS
// ==========================================
// Modificamos el switchTab para que cargue el historial de forma automática al pisar la pestaña de traslados
const originalSwitchTab = switchTab;
switchTab = function(tabId) {
    originalSwitchTab(tabId);
    if (tabId === 'modulo-traslado') {
        cargarHistorialTraslados();
    }
};

// Cargar por primera vez al abrir la app por si acaso
document.addEventListener("DOMContentLoaded", () => {
    // Si tu backend ya está arriba, va mapeando los datos en segundo plano
    cargarHistorialTraslados();
});
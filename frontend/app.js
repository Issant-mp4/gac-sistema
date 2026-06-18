// --- ELEMENTOS DE MÓDULO DE CONSULTA ---
const codigoInput = document.getElementById('codigoInput');
const btnBuscar = document.getElementById('btnBuscar');
const resultCard = document.getElementById('resultCard');
const errorTxt = document.getElementById('errorTxt');

// --- ELEMENTOS DE MÓDULO DE REGISTRO ---
const btnRegistrar = document.getElementById('btnRegistrar');
const regSuccessTxt = document.getElementById('regSuccessTxt');
const regErrorTxt = document.getElementById('regErrorTxt');

// --- ELEMENTOS DE MÓDULO DE TRASLADOS ---
const btnTrasladar = document.getElementById('btnTrasladar');
const movSuccessTxt = document.getElementById('movSuccessTxt');
const movErrorTxt = document.getElementById('movErrorTxt');

// ==========================================
// CONTROLADOR DE PESTAÑAS (MODULAR UX)
// ==========================================
// ==========================================
// CONTROLADOR DE PESTAÑAS Y SEGURIDAD (UX)
// ==========================================
let adminDesbloqueado = false; // Variable que recuerda si ya ingresamos la clave

function switchTab(tabId) {
    // INTERCEPTOR DE SEGURIDAD: Si intentan entrar a registro y no están desbloqueados
    if (tabId === 'modulo-registro' && !adminDesbloqueado) {
        abrirModalSeguridad();
        return; // Detenemos el cambio de pestaña
    }

    // Código original de cambio de pestaña
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active-content'));
    
    const clickedBtn = Array.from(document.querySelectorAll('.tab-navigation button')).find(btn => btn.getAttribute('onclick').includes(tabId));
    if (clickedBtn) clickedBtn.classList.add('active');
    
    document.getElementById(tabId).classList.add('active-content');

    errorTxt.style.display = 'none';
    resultCard.style.display = 'none';
    regSuccessTxt.style.display = 'none';
    regErrorTxt.style.display = 'none';
    movSuccessTxt.style.display = 'none';
    movErrorTxt.style.display = 'none';

    if (tabId === 'modulo-traslado') {
        cargarHistorialTraslados();
    }
}

// --- FUNCIONES DEL MODAL DE SEGURIDAD ---
const modalAdmin = document.getElementById('adminModal');
const pinInput = document.getElementById('adminPinInput');
const pinError = document.getElementById('pinErrorTxt');

function abrirModalSeguridad() {
    modalAdmin.classList.add('active-modal');
    pinInput.value = '';
    pinError.style.display = 'none';
    setTimeout(() => pinInput.focus(), 100); // Autoselecciona el campo para teclear rápido
}

function cerrarModalSeguridad() {
    modalAdmin.classList.remove('active-modal');
    // Si cancela, nos aseguramos de que visualmente el botón "Consultar" vuelva a estar marcado
    document.querySelector("button[onclick=\"switchTab('modulo-consulta')\"]").click();
}

function verificarAccesoAdmin() {
    const pinIngresado = pinInput.value.trim();
    // Aquí defines tu clave de administrador (ejemplo: 2026)
    const PIN_CORRECTO = "2026"; 

    if (pinIngresado === PIN_CORRECTO) {
        // Clave correcta: Desbloqueamos, cerramos modal y permitimos el paso
        adminDesbloqueado = true;
        modalAdmin.classList.remove('active-modal');
        switchTab('modulo-registro');
    } else {
        // Clave incorrecta: Mostramos error
        pinError.style.display = 'block';
        pinInput.value = '';
        pinInput.focus();
    }
}

// Permitir que la tecla "Enter" funcione en el modal
pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verificarAccesoAdmin();
});

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
    const codigo_barras = document.getElementById('regCodigo').value.trim();
    const nombre = document.getElementById('regNombre').value.trim();
    const marca = document.getElementById('regMarca').value.trim();
    const modelo = document.getElementById('regModelo').value.trim();
    const ubicacion_actual = document.getElementById('regUbicacion').value.trim();

    if (!codigo_barras || !nombre || !marca || !modelo || !ubicacion_actual) {
        alert("Por favor, llena todos los campos obligatorios.");
        return;
    }

    regSuccessTxt.style.display = 'none';
    regErrorTxt.style.display = 'none';

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoActivo)
        });

        if (!response.ok) throw new Error();

        regSuccessTxt.style.display = 'block';
        document.getElementById('formRegistro').reset();
    } catch (error) {
        regErrorTxt.style.display = 'block';
    }
}

// ==========================================
// 3. FUNCIÓN: REGISTRAR MOVIMIENTO/TRASLADO (POST)
// ==========================================
async function registrarTraslado() {
    const codigo_barras = document.getElementById('movCodigo').value.trim();
    const nueva_ubicacion = document.getElementById('movUbicacion').value.trim();
    const id_usuario = document.getElementById('movUsuario').value.trim();

    if (!codigo_barras || !nueva_ubicacion || !id_usuario) {
        alert("Por favor, rellena todos los campos para el traslado.");
        return;
    }

    movSuccessTxt.style.display = 'none';
    movErrorTxt.style.display = 'none';

    const nuevoMovimiento = {
        codigo_barras: codigo_barras,
        id_usuario: parseInt(id_usuario),
        nueva_ubicacion: nueva_ubicacion,
        observaciones: "Traslado rutinario desde interfaz de control"
    };

    try {
        
        const response = await fetch('http://127.0.0.1:8000/movimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoMovimiento)
        });

        if (!response.ok) throw new Error();


        movSuccessTxt.style.display = 'block';
        document.getElementById('formMovimiento').reset();
        
        // Actualizar la tabla de historial en tiempo real
        cargarHistorialTraslados();
        if (codigoInput.value.trim() === codigo_barras) {
    buscarActivo();
}

    } catch (error) {
        movErrorTxt.style.display = 'block';
    }
}

// ==========================================
// 4. FUNCIÓN: TRAER EL HISTORIAL (GET)
// ==========================================
async function cargarHistorialTraslados() {
    const tablaBody = document.getElementById('tablaHistorialBody');
    if (!tablaBody) return;
    
    try {
        const response = await fetch('http://127.0.0.1:8000/historial');
if (!response.ok) throw new Error();

const data = await response.json(); 
const movimientos = data.registros; // <- ¡Aquí rescatamos la lista real!
        
        if (!movimientos || movimientos.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #86868b; padding: 20px;">No hay traslados registrados en el sistema.</td></tr>`;
            return;
        }
        
        tablaBody.innerHTML = '';
        
        [...movimientos].reverse().forEach(mov => {
            let fechaRaw = mov.fecha_movimiento;
            let fechaFormateada = "Reciente";
            
            if (fechaRaw) {
                fechaFormateada = new Date(fechaRaw + 'Z').toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
            }

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td style="font-weight: 600; color: #0071e3; padding: 10px 0;">${mov.codigo_barras || '—'}</td>
                <td style="padding: 10px 0;">${mov.nueva_ubicacion || '—'}</td>
                <td style="color: #86868b; padding: 10px 0;">${fechaFormateada}</td>
                <td style="text-align: center; padding: 10px 0;"><span style="background: #f5f5f7; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">ID: ${mov.id_usuario || '—'}</span></td>
            `;
            tablaBody.appendChild(fila);
        });
        
    } catch (error) {
        tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ff3b30; padding: 20px;">Error al conectar con el servidor de historial.</td></tr>`;
    }
}

// --- EVENTOS DEL SISTEMA ---
btnBuscar.addEventListener('click', buscarActivo);
codigoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarActivo(); });

btnRegistrar.addEventListener('click', registrarActivo);
btnTrasladar.addEventListener('click', registrarTraslado);

// Cargar por primera vez al abrir la app
document.addEventListener("DOMContentLoaded", () => {
    cargarHistorialTraslados();
});
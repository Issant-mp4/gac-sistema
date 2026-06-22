// --- ELEMENTOS DE LA INTERFAZ ---
const codigoInput = document.getElementById('codigoInput');
const btnBuscar = document.getElementById('btnBuscar');
const resultCard = document.getElementById('resultCard');
const errorTxt = document.getElementById('errorTxt');

const btnRegistrar = document.getElementById('btnRegistrar');
const regSuccessTxt = document.getElementById('regSuccessTxt');
const regErrorTxt = document.getElementById('regErrorTxt');

const btnTrasladar = document.getElementById('btnTrasladar');
const movSuccessTxt = document.getElementById('movSuccessTxt');
const movErrorTxt = document.getElementById('movErrorTxt');

const codigoInput2 = document.getElementById('codigoInput2');
const btnInventario = document.getElementById('btnInventario');
const movResult = document.getElementById('movResult');
const movErrorinv = document.getElementById('movErrorTxt');

// --- EVENTOS DE INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    btnBuscar.addEventListener('click', buscarActivo);
    btnRegistrar.addEventListener('click', registrarActivo);
    btnTrasladar.addEventListener('click', registrarTraslado);
    btnInventario.addEventListener('click', buscarInventario);
    codigoInput.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') {
            e.preventDefault(); 
            buscarActivo(); 
        }
    });

    cargarHistorialTraslados();
});

// ==========================================
// CONTROLADOR DE PESTAÑAS Y SEGURIDAD
// ==========================================
let adminDesbloqueado = false; 

function switchTab(tabId) {
    if (tabId === 'modulo-registro' && !adminDesbloqueado) {
        abrirModalSeguridad();
        return; 
    }

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

const modalAdmin = document.getElementById('adminModal');
const pinInput = document.getElementById('adminPinInput');
const pinError = document.getElementById('pinErrorTxt');

function abrirModalSeguridad() {
    modalAdmin.classList.add('active-modal');
    pinInput.value = '';
    pinError.style.display = 'none';
    setTimeout(() => pinInput.focus(), 100); 
}

function cerrarModalSeguridad() {
    modalAdmin.classList.remove('active-modal');
    document.querySelector("button[onclick=\"switchTab('modulo-consulta')\"]").click();
}

function verificarAccesoAdmin() {
    const pinIngresado = pinInput.value.trim();
    if (pinIngresado === "2026") {
        adminDesbloqueado = true;
        modalAdmin.classList.remove('active-modal');
        switchTab('modulo-registro');
    } else {
        pinError.style.display = 'block';
        pinInput.value = '';
        pinInput.focus();
    }
}

pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verificarAccesoAdmin();
});

// ==========================================
// 1. FUNCIÓN: BUSCAR ACTIVO
// ==========================================
async function buscarActivo() {
    const codigo = document.getElementById('codigoInput').value.trim();
    if (!codigo) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/activos/${codigo}`);
        if (!response.ok) throw new Error();

        const activo = await response.json();

        // Llenado de todos los datos
        document.getElementById('resNombre').innerText = activo.nombre;
        document.getElementById('resCodActivo').innerText = activo.codigo_activo;
        document.getElementById('resSerie').innerText = activo.serie || activo.placa;
        document.getElementById('resUbiOri').innerText = activo.ubicacion_origen;
        document.getElementById('resUbiDes').innerText = activo.ubicacion_destino;
        document.getElementById('resRespOri').innerText = activo.responsable_origen;
        document.getElementById('resRespDes').innerText = activo.responsable_destino;
        document.getElementById('resCCOri').innerText = activo.centro_costos_origen;
        document.getElementById('resCCDes').innerText = activo.centro_costos_destino;
        document.getElementById('resPorcentaje').innerText = activo.porcentaje + '%';
        document.getElementById('resSecuencia').innerText = activo.secuencia;
        
        const enlace = document.getElementById('resEnlace');
        enlace.href = activo.enlace;
        enlace.innerText = activo.enlace ? "Abrir Documento" : "No disponible";

        document.getElementById('resultCard').style.display = 'block';
    } catch (error) {
        document.getElementById('errorTxt').style.display = 'block';
    }
}

async function registrarActivo() {
    // 1. Capturar los valores
    const codigo_activo = document.getElementById('regCodigoActivo').value.trim();
    const placa = document.getElementById('regPlaca').value.trim();
    const nombre = document.getElementById('regNombre').value.trim();
    const serie = document.getElementById('regSerie').value.trim();
    const ubicacion_origen = document.getElementById('regUbiOrigen').value.trim();
    const ubicacion_destino = document.getElementById('regUbiDestino').value.trim();
    const responsable_origen = document.getElementById('regRespOrigen').value.trim();
    const responsable_destino = document.getElementById('regRespDestino').value.trim();
    const centro_costos_origen = document.getElementById('regCCOrigen').value.trim();
    const centro_costos_destino = document.getElementById('regCCDestino').value.trim();
    const porcentaje = document.getElementById('regPorcentaje').value.trim();
    const secuencia = document.getElementById('regSecuencia').value.trim();
    const enlace = document.getElementById('regEnlace').value.trim();
    const archivo_plano = document.getElementById('regArchivoPlano').value.trim();

    // 2. CORRECCIÓN: Validar usando las variables correctas
    if (!placa || !nombre || !codigo_activo) {
        alert("Por favor, llena los campos obligatorios (*)");
        return;
    }

    // 3. Crear el objeto exactamente igual a la clase de Python
    const nuevoActivo = {
        codigo_activo,
        placa,
        nombre,
        serie,
        ubicacion_origen,
        ubicacion_destino,
        responsable_origen,
        responsable_destino,
        centro_costos_origen: parseInt(centro_costos_origen) || 0,
        centro_costos_destino: parseInt(centro_costos_destino) || 0,
        porcentaje: parseFloat(porcentaje) || 0.0,
        secuencia,
        enlace,
        archivo_plano
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/activos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoActivo)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Error al registrar");
        }

        document.getElementById('regSuccessTxt').style.display = 'block';
        document.getElementById('formRegistro').reset();
        setTimeout(() => document.getElementById('regSuccessTxt').style.display = 'none', 3000);
    } catch (error) {
        alert(error.message);
    }
}

// ==========================================
// 3. FUNCIÓN: REGISTRAR TRASLADO
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
        codigo_barras,
        id_usuario: parseInt(id_usuario),
        nueva_ubicacion,
        observaciones: "Traslado rutinario"
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
        cargarHistorialTraslados();
        
        if (codigoInput.value.trim() === codigo_barras) {
            buscarActivo();
        }
    } catch (error) {
        movErrorTxt.style.display = 'block';
    }
}

// ==========================================
// 4. FUNCIÓN: TRAER EL HISTORIAL
// ==========================================
async function cargarHistorialTraslados() {
    const tablaBody = document.getElementById('tablaHistorialBody');
    if (!tablaBody) return;
    
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
                <td style="text-align: center; padding: 10px 0;"><span style="background: #f5f5f7; color: #1d1d1f; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">ID: ${mov.id_usuario || '—'}</span></td>
            `;
            tablaBody.appendChild(fila);
        });
        
    } catch (error) {
        tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ff3b30; padding: 20px;">Error al conectar con el servidor de historial.</td></tr>`;
    }
}

// ==========================================
// 5. IMPORTACIÓN CSV MASIVA
// ==========================================
const btnImportarCsv = document.getElementById('btnImportarCsv');
if(btnImportarCsv){
    btnImportarCsv.addEventListener('click', async () => {
        const fileInput = document.getElementById('csvFile');
        const successTxt = document.getElementById('csvSuccessTxt');
        const errorTxt = document.getElementById('csvErrorTxt');
        
        successTxt.style.display = 'none';
        errorTxt.style.display = 'none';
        
        if (fileInput.files.length === 0) {
            errorTxt.innerText = 'Por favor, selecciona primero un archivo .csv';
            errorTxt.style.display = 'block';
            return;
        }
        
        const archivo = fileInput.files[0];
        const formData = new FormData();
        formData.append('archivo', archivo); 
        
        const textoOriginal = btnImportarCsv.innerText;
        btnImportarCsv.innerText = 'Sincronizando...';
        btnImportarCsv.disabled = true;
        
        try {
            const respuesta = await fetch('http://127.0.0.1:8000/api/inventario/importar', {
                method: 'POST',
                body: formData
            });
            const resultado = await respuesta.json();
            
            if (respuesta.ok) {
                successTxt.innerText = resultado.mensaje || '¡Procesado correctamente!';
                successTxt.style.display = 'block';
                fileInput.value = ''; 
            } else {
                errorTxt.innerText = `Error: ${resultado.detail}`;
                errorTxt.style.display = 'block';
            }
        } catch (error) {
            errorTxt.innerText = 'Error de conexión con FastAPI.';
            errorTxt.style.display = 'block';
        } finally {
            btnImportarCsv.innerText = textoOriginal;
            btnImportarCsv.disabled = false;
        }
    });
     // ==========================================
    // 5. BOTON DE INVENTARIO DE ACTIVOS 
   // ==========================================
     async function buscarInventario() {
    const codigo = document.getElementById('codigoInput2').value.trim();
    if (!codigo) return;

    try {
        const response = await fetch(`http://127.0.0.1:8000/activos/${codigo}`);
        if (!response.ok) throw new Error();

        const activo = await response.json();

        // Llenado de todos los datos
        document.getElementById('resNombre').innerText = activo.nombre;
        document.getElementById('resCodActivo').innerText = activo.codigo_activo;
        document.getElementById('resSerie').innerText = activo.serie || activo.placa;
        document.getElementById('resUbiOri').innerText = activo.ubicacion_origen;
        document.getElementById('resUbiDes').innerText = activo.ubicacion_destino;
        document.getElementById('resRespOri').innerText = activo.responsable_origen;
        document.getElementById('resRespDes').innerText = activo.responsable_destino;
        document.getElementById('resCCOri').innerText = activo.centro_costos_origen;
        document.getElementById('resCCDes').innerText = activo.centro_costos_destino;
        document.getElementById('resPorcentaje').innerText = activo.porcentaje + '%';
        document.getElementById('resSecuencia').innerText = activo.secuencia;
        
        const enlace = document.getElementById('resEnlace');
        enlace.href = activo.enlace;
        enlace.innerText = activo.enlace ? "Abrir Documento" : "No disponible";

        document.getElementById('resultCard').style.display = 'block';
    } catch (error) {
        document.getElementById('errorTxt').style.display = 'block';
    }
}

}
    
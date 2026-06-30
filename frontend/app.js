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

let datosInventario = []; 

// --- EVENTOS DE INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    btnBuscar.addEventListener('click', buscarActivo);
    btnRegistrar.addEventListener('click', registrarActivo);
    btnTrasladar.addEventListener('click', registrarTraslado);
    
    codigoInput.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') {
            e.preventDefault(); 
            buscarActivo(); 
        }
    });

    cargarHistorialTraslados();
    cargarInventarioCompleto();

    // INICIAR FECHA DEL ACTA DE ENTRADA
    const hoy = new Date();
    document.getElementById('uiDia').value = String(hoy.getDate()).padStart(2, '0');
    document.getElementById('uiMes').value = String(hoy.getMonth() + 1).padStart(2, '0');
    document.getElementById('uiAnio').value = hoy.getFullYear();
    agregarFilaUI(); 
});

// --- CONTROLADOR DE PESTAÑAS Y SEGURIDAD ---
let adminDesbloqueado = false; 
const modalAdmin = document.getElementById('adminModal');
const pinInput = document.getElementById('adminPinInput');
const pinError = document.getElementById('pinErrorTxt');

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

    if (tabId === 'modulo-traslado') cargarHistorialTraslados();
}

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
    if (pinInput.value.trim() === "2026") {
        adminDesbloqueado = true;
        modalAdmin.classList.remove('active-modal');
        switchTab('modulo-registro');
    } else {
        pinError.style.display = 'block';
        pinInput.value = '';
        pinInput.focus();
    }
}
pinInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') verificarAccesoAdmin(); });

// --- FUNCIONES API ---
async function buscarActivo() {
    const codigo = document.getElementById('codigoInput').value.trim();
    if (!codigo) return;
    try {
        const response = await fetch(`http://127.0.0.1:8000/activos/${codigo}`);
        if (!response.ok) throw new Error();
        const activo = await response.json();
        
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
    const placa = document.getElementById('regPlaca').value.trim();
    const nombre = document.getElementById('regNombre').value.trim();
    const codigo_activo = document.getElementById('regCodigoActivo').value.trim();

    if (!placa || !nombre || !codigo_activo) {
        alert("Por favor, llena los campos obligatorios (*)");
        return;
    }

    const nuevoActivo = {
        codigo_activo: codigo_activo,
        placa: placa,
        nombre: nombre,
        serie: document.getElementById('regSerie').value.trim(),
        ubicacion_origen: document.getElementById('regUbiOrigen').value.trim(),
        ubicacion_destino: document.getElementById('regUbiDestino').value.trim(),
        responsable_origen: document.getElementById('regRespOrigen').value.trim(),
        responsable_destino: document.getElementById('regRespDestino').value.trim(),
        centro_costos_origen: parseInt(document.getElementById('regCCOrigen').value.trim()) || 0,
        centro_costos_destino: parseInt(document.getElementById('regCCDestino').value.trim()) || 0,
        porcentaje: parseFloat(document.getElementById('regPorcentaje').value.trim()) || 0.0,
        secuencia: document.getElementById('regSecuencia').value.trim(),
        enlace: document.getElementById('regEnlace').value.trim(),
        archivo_plano: document.getElementById('regArchivoPlano').value.trim()
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

async function registrarTraslado() {
    const codigo_barras = document.getElementById('movCodigo').value.trim();
    const nueva_ubicacion = document.getElementById('movUbicacion').value.trim();
    const id_usuario = document.getElementById('movUsuario').value.trim();

    if (!codigo_barras || !nueva_ubicacion || !id_usuario) {
        alert("Por favor, rellena todos los campos para el traslado.");
        return;
    }

    const nuevoMovimiento = { codigo_barras, id_usuario: parseInt(id_usuario), nueva_ubicacion, observaciones: "Traslado rutinario" };

    try {
        const response = await fetch('http://127.0.0.1:8000/movimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoMovimiento)
        });
        if (!response.ok) throw new Error();

        document.getElementById('movSuccessTxt').style.display = 'block';
        document.getElementById('formMovimiento').reset();
        cargarHistorialTraslados();
    } catch (error) {
        document.getElementById('movErrorTxt').style.display = 'block';
    }
}

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
            let fechaFormateada = fechaRaw ? new Date(fechaRaw + 'Z').toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : "Reciente";

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
        tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ff3b30; padding: 20px;">Error de servidor.</td></tr>`;
    }
}

// --- BUSCADOR DEL INVENTARIO (EXCEL) ---
async function cargarInventarioCompleto() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/inventario-completo');
        datosInventario = await response.json();
        renderizarTabla(datosInventario);
    } catch (error) {
        console.error("Error al cargar inventario:", error);
    }
}

function renderizarTabla(datos) {
    const tabla = document.getElementById("tabla-inventario");
    if (!datos || datos.length === 0) {
        tabla.innerHTML = "<tr><td colspan='24'>No hay datos disponibles</td></tr>";
        return;
    }

    const cabeceras = Object.keys(datos[0]);
    let thead = "<thead><tr>" + cabeceras.map(col => `<th>${col}</th>`).join("") + "</tr></thead>";
    let tbody = "<tbody>" + datos.map(fila => {
        return "<tr>" + cabeceras.map(col => `<td>${fila[col]}</td>`).join("") + "</tr>";
    }).join("") + "</tbody>";
    
    tabla.innerHTML = thead + tbody;
}

document.getElementById('busquedaInventario')?.addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase();
    const filtrados = datosInventario.filter(fila => {
        return Object.values(fila).some(valor => String(valor).toLowerCase().includes(termino));
    });
    renderizarTabla(filtrados);
});

// --- LÓGICA DEL ACTA Y LECTOR ZEBRA ---
function agregarFilaUI(placa = '', desc = '', marca = '', modelo = '', serie = '', cant = '1') {
    const tbody = document.getElementById('uiTablaBody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="number" class="t-cant" value="${cant}" min="1"></td>
        <td><input type="text" class="t-desc" value="${desc}" placeholder="Descripción..."></td>
        <td><input type="text" class="t-placa req-row" value="${placa}" placeholder="Código..." style="font-weight:bold; color:#66b3ff;"></td>
        <td><input type="text" class="t-marca" value="${marca}" placeholder="Marca..."></td>
        <td><input type="text" class="t-modelo" value="${modelo}" placeholder="Modelo..."></td>
        <td><input type="text" class="t-serie" value="${serie}" placeholder="S/N..."></td>
        <td style="text-align: center;"><button type="button" class="btn-del" onclick="this.closest('tr').remove()">X</button></td>
    `;
    tbody.appendChild(tr);
}

const zebraInput = document.getElementById('zebraInput');
if(zebraInput) {
    zebraInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            const rawScan = zebraInput.value.trim();
            if (!rawScan) return;

            const parts = rawScan.split(/[,|\t]/);
            if(parts.length > 1) {
                agregarFilaUI(parts[0]||'', parts[1]||'', parts[2]||'', parts[3]||'', parts[4]||'');
            } else {
                agregarFilaUI(rawScan, '', '', '', '');
            }
            zebraInput.value = '';
            zebraInput.style.backgroundColor = '#d4edda';
            setTimeout(() => zebraInput.style.backgroundColor = '#f0fff4', 300);
        }
    });
}

document.addEventListener('input', (e) => {
    if(e.target.classList.contains('error-border') && e.target.value.trim() !== '') {
        e.target.classList.remove('error-border');
    }
});

async function exportarActaCompleta(btnElement) {
    let esValido = true;
    document.querySelectorAll('.req').forEach(input => {
        if(!input.value.trim()) { 
            input.classList.add('error-border'); 
            esValido = false; 
        } else { 
            input.classList.remove('error-border'); 
        }
    });

    const filasUi = document.querySelectorAll('#uiTablaBody tr');
    if(filasUi.length === 0 || !esValido) {
        alert("Completa los campos obligatorios y agrega al menos un activo.");
        return;
    }

    const items = [];
    filasUi.forEach(tr => {
        items.push({
            cant: parseInt(tr.querySelector('.t-cant')?.value) || 1,
            desc: tr.querySelector('.t-desc')?.value.trim() || '---',
            placa: tr.querySelector('.t-placa')?.value.trim() || '---',
            marca: tr.querySelector('.t-marca')?.value.trim() || '---',
            modelo: tr.querySelector('.t-modelo')?.value.trim() || 'NA',
            serie: tr.querySelector('.t-serie')?.value.trim() || 'NA'
        });
    });

    const getVal = id => document.getElementById(id)?.value.trim() || "";
    const getRadioVal = name => document.querySelector(`input[name="${name}"]:checked`)?.value || "";

    const payload = {
        dia: getVal('uiDia'), mes: getVal('uiMes'), anio: getVal('uiAnio'),
        concepto: getRadioVal('concepto') || 'Compra', numero: getVal('uiNumero') || 'N/A',
        tipo: getRadioVal('tipo') || 'Equipos De Oficina y varios', proveedor: getVal('uiProveedor'),
        factura: getVal('uiFactura'), resp_nombre: getVal('uiRespNombre'),
        resp_doc: getVal('uiRespDoc'), resp_cargo: getVal('uiRespCargo'), items: items
    };

    const btnOriginalText = btnElement.innerText;
    btnElement.innerText = "⏳ Generando documento...";
    btnElement.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/actas/generar_pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Error en el servidor al generar el documento.");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Acta_Ingreso_${payload.resp_nombre.replace(/\s+/g, '_') || 'General'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert("Ocurrió un error: " + error.message);
    } finally {
        btnElement.innerText = btnOriginalText;
        btnElement.disabled = false;
    }
}
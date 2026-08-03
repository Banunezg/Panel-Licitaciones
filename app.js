// 1. Importar Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 2. Configuración de credenciales
const supabaseUrl = 'https://qboawjjuzgijgtyjzqiw.supabase.co';
const supabaseKey = 'sb_publishable_HAuwDGL-5bWi5E2GHUBUKA_euUS1ig7';
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Referencias a los elementos del HTML (DOM)
const formOferta = document.getElementById('formOferta');
const cuerpoTablaOfertas = document.getElementById('cuerpoTablaOfertas');
let botonGuardar = formOferta.querySelector('button[type="submit"]');

// Variable "memoria" para saber si estamos editando o creando
let idOfertaEnEdicion = null; 

// 4. Función para LEER las ofertas de Supabase
async function cargarOfertas() {
    cuerpoTablaOfertas.innerHTML = "<tr><td colspan='8'>Cargando datos...</td></tr>";

    const { data, error } = await supabase
        .from('ofertas')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error("Error al cargar las ofertas:", error);
        cuerpoTablaOfertas.innerHTML = "<tr><td colspan='8'>Error al cargar los datos.</td></tr>";
        return;
    }

    cuerpoTablaOfertas.innerHTML = "";
    
    // Dibujar las ofertas y agregar botones de acción
    data.forEach(oferta => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${oferta.portal}</td>
            <td>${oferta.title}</td>
            <td>${oferta.worker}</td>
            <td>$${oferta.amount}</td>
            <td>${oferta.status}</td>
            <td>${oferta.participationDate}</td>
            <td>${oferta.endDate}</td>
            <td>
                <button class="btn-editar" data-id="${oferta.id}">✏️ Editar</button>
                <button class="btn-eliminar" data-id="${oferta.id}">🗑️ Eliminar</button>
            </td>
        `;
        cuerpoTablaOfertas.appendChild(fila);
    });

    // Activar los botones de Editar y Eliminar que acabamos de crear
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => prepararEdicion(e.target.dataset.id, data));
    });
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => eliminarOferta(e.target.dataset.id));
    });
}

// 5. Función para GUARDAR o ACTUALIZAR
async function guardarOferta(event) {
    event.preventDefault(); 

    // Obtener los valores de los inputs
    const datosOferta = {
        portal: document.getElementById('portal').value,
        title: document.getElementById('title').value,
        worker: document.getElementById('worker').value,
        amount: Number(document.getElementById('amount').value),
        status: document.getElementById('status').value,
        participationDate: document.getElementById('participationDate').value,
        endDate: document.getElementById('endDate').value
    };

    let errorSupabase = null;

    if (idOfertaEnEdicion) {
        // SI HAY UN ID GUARDADO -> ACTUALIZAR
        const { error } = await supabase.from('ofertas').update(datosOferta).eq('id', Number(idOfertaEnEdicion));
        errorSupabase = error;
    } else {
        // SI NO HAY ID -> CREAR NUEVA
        const { error } = await supabase.from('ofertas').insert([datosOferta]);
        errorSupabase = error;
    }

    // AQUI ESTÁ LA MAGIA: SI HAY UN ERROR, LO MOSTRAMOS EN UNA ALERTA
    if (errorSupabase) {
        alert("ERROR DE SUPABASE:\nMotivo: " + errorSupabase.message + "\nDetalles: " + (errorSupabase.details || "N/A"));
        console.error("Error completo:", errorSupabase);
        return; // Detenemos la función aquí para no borrar los datos que escribiste
    }

    // Si todo salió bien:
    alert(idOfertaEnEdicion ? "¡Licitación actualizada!" : "¡Licitación creada exitosamente!");

    // Limpiar todo después de guardar
    formOferta.reset(); 
    idOfertaEnEdicion = null; 
    botonGuardar.textContent = "Guardar Licitación"; // Devolver el botón a la normalidad
    cargarOfertas(); 
}

// 6. Función para PREPARAR LA EDICIÓN (Sube los datos al formulario)
function prepararEdicion(id, todosLosDatos) {
    const oferta = todosLosDatos.find(o => o.id == id);
    if (!oferta) return;

    // Llenar el formulario con los datos viejos
    document.getElementById('portal').value = oferta.portal;
    document.getElementById('title').value = oferta.title;
    document.getElementById('worker').value = oferta.worker;
    document.getElementById('amount').value = oferta.amount;
    document.getElementById('status').value = oferta.status;
    document.getElementById('participationDate').value = oferta.participationDate;
    document.getElementById('endDate').value = oferta.endDate;

    // Guardar el ID en memoria y cambiar el texto del botón
    idOfertaEnEdicion = oferta.id;
    botonGuardar.textContent = "Actualizar Cambios";
    
    // Subir la pantalla hacia el formulario
    window.scrollTo(0, 0); 
}

// 7. Función para ELIMINAR
async function eliminarOferta(id) {
    if (confirm("¿Estás completamente seguro de eliminar esta licitación?")) {
        const { error } = await supabase.from('ofertas').delete().eq('id', Number(id));
        
        if (error) {
            alert("Error al eliminar:\n" + error.message);
        } else {
            cargarOfertas(); // Recargar tabla
        }
    }
}

// 8. Asignar evento al formulario y arrancar
formOferta.addEventListener('submit', guardarOferta);
cargarOfertas();

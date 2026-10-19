/* Controlador principal de la aplicacion de tareas */

const gestorTareas = new TaskManager();

const formulario = document.getElementById("formulario de tarea");
const campoNombre = document.getElementById("nombre de tarea");
const campoDescripcion = document.getElementById("descripcion de tarea");
const campoAsignado = document.getElementById("usuario asignado");
const campoFecha = document.getElementById("fecha de entrega");
const campoEstado = document.getElementById("estado de tarea");
const botonCancelar = document.getElementById("boton de cancelar tarea");

/* Evento de envio del formulario */
formulario.addEventListener("submit", function(evento) {
  evento.preventDefault();

  const esValido = validateTaskForm();
  if (!esValido) {
    return;
  }

  const nuevaTarea = {
    nombre: campoNombre.value.trim(),
    descripcion: campoDescripcion.value.trim(),
    asignadoA: campoAsignado.value.trim(),
    fechaDeEntrega: campoFecha.value.trim(),
    estado: campoEstado.value.trim()
  };

  const tareaGuardada = gestorTareas.addTask(nuevaTarea);
  const elementoTarjeta = crearTarjetaTarea(tareaGuardada);

  /* Conectar boton eliminar de la tarjeta */
  const botonEliminar = elementoTarjeta.querySelector(".boton.eliminar");
  botonEliminar.addEventListener("click", function() {
    gestorTareas.deleteTask(tareaGuardada.id);
    elementoTarjeta.remove();
  });

  agregarTarjetaAlDom(elementoTarjeta);
  formulario.reset();
});

/* Boton para limpiar formulario */
botonCancelar.addEventListener("click", function() {
  formulario.reset();
});

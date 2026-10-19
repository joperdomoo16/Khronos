/* Validacion de los campos del formulario de tareas */

function validateTaskForm() {
  const campoNombre = document.getElementById("nombre de tarea");
  const campoDescripcion = document.getElementById("descripcion de tarea");
  const campoAsignado = document.getElementById("usuario asignado");
  const campoFecha = document.getElementById("fecha de entrega");
  const campoEstado = document.getElementById("estado de tarea");

  const valorNombre = campoNombre.value.trim();
  const valorDescripcion = campoDescripcion.value.trim();
  const valorAsignado = campoAsignado.value.trim();
  const valorFecha = campoFecha.value.trim();
  const valorEstado = campoEstado.value.trim();

  if (valorNombre.length <= 8) {
    alert("El nombre debe tener al menos 9 caracteres y no estar en blanco.");
    campoNombre.focus();
    return false;
  }

  if (valorDescripcion.length <= 15) {
    alert("La descripcion debe tener al menos 16 caracteres y no estar en blanco.");
    campoDescripcion.focus();
    return false;
  }

  if (valorAsignado.length <= 8) {
    alert("La persona asignada debe tener al menos 9 caracteres y no estar en blanco.");
    campoAsignado.focus();
    return false;
  }

  if (valorFecha.length === 0) {
    alert("La fecha de entrega no puede estar en blanco.");
    campoFecha.focus();
    return false;
  }

  if (valorEstado.length === 0) {
    alert("Debes seleccionar un estado valido para la tarea.");
    campoEstado.focus();
    return false;
  }

  return true;
}

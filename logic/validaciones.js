/* Validacion de los campos del formulario de tareas y del inicio de sesion */

/* Muestra (o limpia) el mensaje de error debajo de un campo */
function marcarError(campo, mensaje) {
  const bloque = campo.closest(".t-f");
  if (bloque) {
    bloque.classList.toggle("has-err", mensaje !== "");
    const texto = bloque.querySelector(".t-err");
    if (texto) {
      texto.textContent = mensaje;
    }
  }
  campo.setAttribute("aria-invalid", mensaje !== "" ? "true" : "false");
}

function limpiarErroresDeTarea() {
  const ids = ["nombre de tarea", "descripcion de tarea", "usuario asignado", "fecha de entrega", "estado de tarea"];
  ids.forEach(function(id) {
    marcarError(document.getElementById(id), "");
  });
}

function validateTaskForm() {
  const campoNombre = document.getElementById("nombre de tarea");
  const campoDescripcion = document.getElementById("descripcion de tarea");
  const campoAsignado = document.getElementById("usuario asignado");
  const campoFecha = document.getElementById("fecha de entrega");
  const campoEstado = document.getElementById("estado de tarea");

  const reglas = [
    { campo: campoNombre, invalido: campoNombre.value.trim().length <= 8, mensaje: "El nombre debe tener al menos 9 caracteres." },
    { campo: campoAsignado, invalido: campoAsignado.value.trim().length <= 8, mensaje: "La persona asignada debe tener al menos 9 caracteres." },
    { campo: campoFecha, invalido: campoFecha.value.trim().length === 0, mensaje: "La fecha de entrega no puede estar en blanco." },
    { campo: campoDescripcion, invalido: campoDescripcion.value.trim().length <= 15, mensaje: "La descripción debe tener al menos 16 caracteres." },
    { campo: campoEstado, invalido: campoEstado.value.trim().length === 0, mensaje: "Debes seleccionar un estado válido." }
  ];

  let primerInvalido = null;
  reglas.forEach(function(regla) {
    marcarError(regla.campo, regla.invalido ? regla.mensaje : "");
    if (regla.invalido && primerInvalido === null) {
      primerInvalido = regla.campo;
    }
  });

  if (primerInvalido !== null) {
    primerInvalido.focus();
    return false;
  }
  return true;
}

/* Mientras no existan usuarios reales, entra cualquier correo con forma texto@texto:
   algo antes de la arroba, algo despues y sin espacios ni una segunda arroba */
const Formadecorreo = /^[^\s@]+@[^\s@]+$/;

/* Devuelve un mensaje de error o una cadena vacia si el acceso es valido */
function validateLoginForm(correo, clave) {
  const valor = correo.trim();
  if (valor.length > 120 || !Formadecorreo.test(valor)) {
    return "Escribe un correo con la forma nombre@dominio.";
  }
  if (clave.length === 0) {
    return "Escribe tu contraseña.";
  }
  return "";
}

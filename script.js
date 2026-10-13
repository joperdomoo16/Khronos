/* Logica del planificador de tareas */

// Coleccion de tareas registradas
let tareas = [];

// Coleccion de usuarios disponibles
let usuarios = [];

// Captura de elementos del formulario
const formulario = document.getElementById("formulario de tarea");
const nombre = document.getElementById("nombre de tarea");
const descripcion = document.getElementById("descripcion de tarea");
const asignado = document.getElementById("usuario asignado");
const fecha = document.getElementById("fecha de entrega");
const estado = document.getElementById("estado de tarea");
const cancelar = document.getElementById("boton de cancelar");

// Captura de enlaces de la barra superior
const enlaces = document.querySelectorAll(".navbar-nav .nav-link");

// Funciones del planificador organizadas por acciones
const acciones = {
  "cargar datos": function() {
    tareas = almacenamiento["obtener tareas"]();
    usuarios = almacenamiento["obtener usuarios"]();
    acciones["actualizar lista de usuarios"]();
  },

  "guardar tareas en memoria": function() {
    almacenamiento["guardar tareas"](tareas);
  },

  "actualizar lista de usuarios": function() {
    asignado.innerHTML = '<option value="" selected disabled>Selecciona un usuario</option>';
    for (const usuario of usuarios) {
      const opcion = document.createElement("option");
      opcion.value = usuario;
      opcion.textContent = usuario;
      asignado.appendChild(opcion);
    }
  },

  "limpiar campos del formulario": function() {
    formulario.reset();
    estado.value = "Pendiente";
  },

  "filtrar usuarios": function(termino) {
    return usuarios.filter(function(usuario) {
      return usuario.toLowerCase().includes(termino.toLowerCase());
    });
  }
};

// Registrar una nueva tarea desde el formulario
formulario.addEventListener("submit", function(evento) {
  evento.preventDefault();

  const tarea = {
    id: "tarea " + Date.now(),
    nombre: nombre.value.trim(),
    descripcion: descripcion.value.trim(),
    asignado: asignado.value,
    fecha: fecha.value,
    estado: estado.value
  };

  tareas.unshift(tarea);
  acciones["guardar tareas en memoria"]();
  acciones["limpiar campos del formulario"]();
});

// Boton para restablecer el formulario
cancelar.addEventListener("click", function() {
  acciones["limpiar campos del formulario"]();
});

// Prevenir salto al pulsar enlaces de la barra superior
for (const enlace of enlaces) {
  enlace.addEventListener("click", function(evento) {
    evento.preventDefault();
  });
}

// Iniciar la carga al abrir el sitio
acciones["cargar datos"]();

/* Controlador principal de la aplicacion de tareas */

const gestorTareas = new TaskManager();
const usuarios = almacenamiento["obtener usuarios"]();

const formulario = document.getElementById("formulario de tarea");
const campoNombre = document.getElementById("nombre de tarea");
const campoDescripcion = document.getElementById("descripcion de tarea");
const campoAsignado = document.getElementById("usuario asignado");
const campoFecha = document.getElementById("fecha de entrega");
const campoEstado = document.getElementById("estado de tarea");
const botonCancelar = document.getElementById("boton de cancelar tarea");
const botonNuevaTarea = document.getElementById("boton de nueva tarea");
const cajonFormulario = document.getElementById("cajon de formulario");
const avisoGuardado = document.getElementById("aviso de guardado");
const listadoTareas = document.getElementById("listado de tareas");

/* Datos */

function diaRelativo(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fechaComoTexto(fecha);
}

/* Tareas de ejemplo que solo se cargan la primera vez que se abre la aplicacion */
function crearTareasDeEjemplo() {
  return [
    { id: 1, nombre: "Diseñar flujo de registro", descripcion: "Bocetar las pantallas de alta de usuario y sus estados vacíos.", asignadoA: "Valentina Rios", fechaDeEntrega: diaRelativo(2), estado: "POR HACER" },
    { id: 2, nombre: "Crear equipos de trabajo", descripcion: "Definir roles, líder y ciudad para cada equipo del proyecto.", asignadoA: "Carlos Mendoza", fechaDeEntrega: diaRelativo(5), estado: "POR HACER" },
    { id: 3, nombre: "Integrar almacenamiento local", descripcion: "Persistir tareas, usuarios y equipos entre sesiones del navegador.", asignadoA: "Andres Ospina", fechaDeEntrega: diaRelativo(1), estado: "EN PROCESO" },
    { id: 4, nombre: "Animación de bienvenida", descripcion: "Reloj de arena, gota y transición hacia el panel principal.", asignadoA: "Valentina Rios", fechaDeEntrega: diaRelativo(3), estado: "EN PROCESO" },
    { id: 5, nombre: "Validar formulario de tareas", descripcion: "Revisar longitudes mínimas y mensajes de error en cada campo.", asignadoA: "Camila Restrepo", fechaDeEntrega: diaRelativo(0), estado: "REVISIÓN" },
    { id: 6, nombre: "Planear sprint tres", descripcion: "Priorizar el backlog y repartir responsables por semana.", asignadoA: "Carlos Mendoza", fechaDeEntrega: diaRelativo(-2), estado: "HECHO" }
  ];
}

function guardarTareas() {
  almacenamiento["guardar tareas"](gestorTareas.getAllTasks());
}

function cargarTareas() {
  const guardadas = almacenamiento["obtener tareas"]();
  if (guardadas.length === 0 && localStorage.getItem("ejemplo de khronos") !== "cargado") {
    crearTareasDeEjemplo().forEach(function(tarea) {
      gestorTareas.addTask(tarea);
    });
    localStorage.setItem("ejemplo de khronos", "cargado");
    guardarTareas();
    return;
  }
  /* addTask respeta el id que ya trae cada tarea y sigue la numeracion desde el mayor */
  guardadas.forEach(function(tarea) {
    gestorTareas.addTask(tarea);
  });
}

/* Mueve una tarea a la columna anterior (-1) o siguiente (+1) usando updateTask */
function moverTarea(id, direccion) {
  const tarea = gestorTareas.getAllTasks().find(function(item) {
    return item.id === parseInt(id, 10);
  });
  if (!tarea) {
    return;
  }
  const posicion = Estadosdetarea.indexOf(tarea.estado);
  const nueva = Math.min(Estadosdetarea.length - 1, Math.max(0, posicion + direccion));
  gestorTareas.updateTask(id, Estadosdetarea[nueva]);
}

function renderizarTodo() {
  renderizarTablero(gestorTareas.getAllTasks(), "");
}

/* Formulario de tareas */

function abrirFormulario(abrir) {
  cajonFormulario.classList.toggle("is-open", abrir);
  botonNuevaTarea.classList.toggle("is-open", abrir);
  botonNuevaTarea.setAttribute("aria-expanded", abrir ? "true" : "false");
  botonNuevaTarea.querySelector("span").textContent = abrir ? "Cerrar formulario" : "Nueva tarea";
  if (abrir) {
    setTimeout(function() {
      campoNombre.focus({ preventScroll: true });
    }, 400);
  }
}

let temporizadorAviso = null;
function mostrarAvisoGuardado() {
  avisoGuardado.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(function() {
    avisoGuardado.hidden = true;
  }, 2600);
}

formulario.addEventListener("submit", function(evento) {
  evento.preventDefault();

  const esValido = validateTaskForm();
  if (!esValido) {
    return;
  }

  gestorTareas.addTask({
    nombre: campoNombre.value.trim(),
    descripcion: campoDescripcion.value.trim(),
    asignadoA: campoAsignado.value.trim(),
    fechaDeEntrega: campoFecha.value.trim(),
    estado: campoEstado.value.trim()
  });

  guardarTareas();
  renderizarTodo();
  formulario.reset();
  limpiarErroresDeTarea();
  mostrarAvisoGuardado();
});

/* Al escribir en un campo se limpia su mensaje de error */
[campoNombre, campoDescripcion, campoAsignado, campoFecha, campoEstado].forEach(function(campo) {
  campo.addEventListener("input", function() {
    marcarError(campo, "");
  });
});

botonCancelar.addEventListener("click", function() {
  formulario.reset();
  limpiarErroresDeTarea();
});

botonNuevaTarea.addEventListener("click", function() {
  abrirFormulario(!cajonFormulario.classList.contains("is-open"));
});

/* Lista de personas sugeridas en el campo "Asignado a" */
const listaUsuarios = document.getElementById("lista de usuarios");
usuarios.forEach(function(usuario) {
  const opcion = document.createElement("option");
  opcion.value = usuario.nombre;
  listaUsuarios.appendChild(opcion);
});

/* Acciones sobre las tarjetas */

listadoTareas.addEventListener("click", function(evento) {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) {
    return;
  }
  const id = boton.closest(".t-card").getAttribute("data-id");
  const accion = boton.getAttribute("data-accion");
  if (accion === "eliminar") {
    gestorTareas.deleteTask(id);
  } else {
    moverTarea(id, accion === "adelante" ? 1 : -1);
  }
  guardarTareas();
  renderizarTodo();
});

/* Arrastrar y soltar entre columnas */
let idArrastrado = null;

listadoTareas.addEventListener("dragstart", function(evento) {
  const tarjeta = evento.target.closest(".t-card");
  if (!tarjeta) {
    return;
  }
  idArrastrado = tarjeta.getAttribute("data-id");
  tarjeta.classList.add("is-dragging");
  evento.dataTransfer.effectAllowed = "move";
  evento.dataTransfer.setData("text/plain", idArrastrado);
});

listadoTareas.addEventListener("dragend", function(evento) {
  const tarjeta = evento.target.closest(".t-card");
  if (tarjeta) {
    tarjeta.classList.remove("is-dragging");
  }
  listadoTareas.querySelectorAll(".t-col.is-over").forEach(function(columna) {
    columna.classList.remove("is-over");
  });
});

listadoTareas.querySelectorAll(".t-col").forEach(function(columna) {
  columna.addEventListener("dragover", function(evento) {
    evento.preventDefault();
    columna.classList.add("is-over");
  });
  columna.addEventListener("dragleave", function(evento) {
    if (!columna.contains(evento.relatedTarget)) {
      columna.classList.remove("is-over");
    }
  });
  columna.addEventListener("drop", function(evento) {
    evento.preventDefault();
    columna.classList.remove("is-over");
    if (idArrastrado === null) {
      return;
    }
    gestorTareas.updateTask(idArrastrado, columna.getAttribute("data-estado"));
    idArrastrado = null;
    guardarTareas();
    renderizarTodo();
  });
});

/* Menu lateral */

document.getElementById("menu lateral").addEventListener("click", function(evento) {
  const boton = evento.target.closest(".d-nav");
  if (!boton) {
    return;
  }
  this.querySelectorAll(".d-nav").forEach(function(otro) {
    otro.classList.toggle("is-on", otro === boton);
    if (otro === boton) {
      otro.setAttribute("aria-current", "page");
    } else {
      otro.removeAttribute("aria-current");
    }
  });
});

/* Sesion */

inicio.alIniciarSesion(function() {
  renderizarTodo();
  /* Terminada la entrada del menu, los clics ya no esperan a la animacion inicial */
  setTimeout(function() {
    document.getElementById("menu").classList.add("is-settled");
  }, 2200);
});

/* Arranque */

cargarTareas();
renderizarTodo();

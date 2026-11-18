// Controlador principal de la aplicación de tareas

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

function diaRelativo(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fechaComoTexto(fecha);
}

// Datos iniciales para mostrar el tablero al entrar por primera vez
function crearTareasDeEjemplo() {
  return [
    { id: 1, nombre: "Diseñar pantalla de registro", descripcion: "Armar el formulario de registro y revisar los campos obligatorios.", asignadoA: "Valentina Rios", fechaDeEntrega: diaRelativo(2), estado: "POR HACER" },
    { id: 2, nombre: "Organizar equipos de trabajo", descripcion: "Definir integrantes y responsables para cada grupo.", asignadoA: "Carlos Mendoza", fechaDeEntrega: diaRelativo(5), estado: "POR HACER" },
    { id: 3, nombre: "Guardar tareas en el navegador", descripcion: "Probar que las tareas no se borren al recargar la página.", asignadoA: "Andres Ospina", fechaDeEntrega: diaRelativo(1), estado: "EN PROCESO" },
    { id: 4, nombre: "Ajustar pantalla de acceso", descripcion: "Revisar la entrada al tablero después de iniciar sesión.", asignadoA: "Valentina Rios", fechaDeEntrega: diaRelativo(3), estado: "EN PROCESO" },
    { id: 5, nombre: "Validar formulario de tareas", descripcion: "Comprobar los avisos de error cuando faltan datos.", asignadoA: "Camila Restrepo", fechaDeEntrega: diaRelativo(0), estado: "REVISIÓN" },
    { id: 6, nombre: "Preparar entrega de la semana", descripcion: "Revisar tareas pendientes y cerrar lo terminado.", asignadoA: "Carlos Mendoza", fechaDeEntrega: diaRelativo(-2), estado: "HECHO" }
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
  guardadas.forEach(function(tarea) {
    gestorTareas.addTask(tarea);
  });
}

function moverTarea(id, direccion) {
  const tarea = gestorTareas.getAllTasks().find(function(item) {
    return item.id === parseInt(id, 10);
  });
  if (!tarea) {
    return;
  }
  const posicion = estadosTarea.indexOf(tarea.estado);
  const nueva = Math.min(estadosTarea.length - 1, Math.max(0, posicion + direccion));
  gestorTareas.updateTask(id, estadosTarea[nueva]);
}

function renderizarTodo() {
  renderizarTablero(gestorTareas.getAllTasks(), "");
}

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

// Lista desplegable de personas sugeridas
const listaUsuarios = document.getElementById("lista de usuarios");
usuarios.forEach(function(usuario) {
  const opcion = document.createElement("option");
  opcion.value = usuario.nombre;
  listaUsuarios.appendChild(opcion);
});

// Botones de movimiento y borrado en las tarjetas
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

// Arrastrar y soltar entre columnas
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

// Cambio de botón activo en el menú lateral
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

inicio.alIniciarSesion(function() {
  renderizarTodo();
  setTimeout(function() {
    document.getElementById("menu").classList.add("is-settled");
  }, 2200);
});

cargarTareas();
renderizarTodo();

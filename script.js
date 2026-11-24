// Conecta los botones y eventos del tablero

const gestorTareas = new TaskManager();
const usuarioActivo = "Jorge Perdomo";

const formulario = document.getElementById("formulario de tarea");
const campoNombre = document.getElementById("nombre de tarea");
const campoAsignado = document.getElementById("usuario asignado");
const campoFecha = document.getElementById("fecha de entrega");
const campoEstado = document.getElementById("estado de tarea");
const campoDescripcion = document.getElementById("descripcion de tarea");
const botonCancelar = document.getElementById("boton de cancelar tarea");
const cajonFormulario = document.getElementById("cajon-formulario");
const avisoGuardado = document.getElementById("aviso de guardado");
const listadoTareas = document.getElementById("listado de tareas");

function diaRelativo(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fechaComoTexto(fecha);
}

const versionEjemplo = "viaje-madrid-v1";

// Tareas de ejemplo 
function crearTareasDeEjemplo() {
  return [
    { id: 1, nombre: "Cotizar tiquetes Bogotá a Madrid", descripcion: "Comparar precios de vuelos en pesos y revisar escalas disponibles.", asignadoA: "Valentina Rios", fechaDeEntrega: diaRelativo(2), estado: "POR HACER" },
    { id: 2, nombre: "Revisar pasaportes del grupo", descripcion: "Confirmar que todos tengan el documento vigente para el viaje.", asignadoA: "Carlos Mendoza", fechaDeEntrega: diaRelativo(4), estado: "POR HACER" },
    { id: 3, nombre: "Buscar hospedaje en el centro", descripcion: "Mirar apartamentos para cuatro personas cerca del transporte.", asignadoA: "Jorge Perdomo", fechaDeEntrega: diaRelativo(1), estado: "EN PROCESO" },
    { id: 4, nombre: "Cotizar seguro médico internacional", descripcion: "Pedir cotización por correo y confirmar la cobertura en España.", asignadoA: "Andres Ospina", fechaDeEntrega: diaRelativo(3), estado: "REVISIÓN" },
    { id: 5, nombre: "Armar presupuesto en pesos", descripcion: "Sumar gastos de vuelos, hospedaje, comida y paseos del viaje.", asignadoA: "Camila Restrepo", fechaDeEntrega: diaRelativo(0), estado: "HECHO" }
  ];
}

function cargarTareas() {
  if (localStorage.getItem("ejemplo de khronos") !== versionEjemplo) {
    crearTareasDeEjemplo().forEach(function (tarea) {
      gestorTareas.addTask(tarea);
    });
    localStorage.setItem("ejemplo de khronos", versionEjemplo);
    gestorTareas.save();
    return;
  }
  gestorTareas.load();
}

function moverTarea(id, direccion) {
  const tarea = gestorTareas.getTaskById(id);
  if (!tarea) {
    return;
  }
  const posicion = estadosTarea.indexOf(tarea.estado);
  const nueva = Math.min(estadosTarea.length - 1, Math.max(0, posicion + direccion));
  gestorTareas.updateTask(id, estadosTarea[nueva]);
}

function renderizarTodo() {
  const tareas = gestorTareas.getAllTasks();
  renderizarTablero(tareas);
  renderizarTablaEntregas(tareas);
}

function cambiarVista(vista) {
  const titulos = { tablero: "Tablero de tareas", entregas: "Entregas por fecha" };
  document.getElementById("titulo vista").textContent = titulos[vista] || "Tablero de tareas";

  ["tablero", "entregas"].forEach(function (nombre) {
    document.getElementById("vista " + nombre).classList.toggle("d-none", nombre !== vista);
  });

  document.querySelectorAll("[data-vista]").forEach(function (btn) {
    btn.classList.toggle("active", btn.getAttribute("data-vista") === vista);
  });
}

let temporizadorAviso = null;
function mostrarAvisoGuardado() {
  avisoGuardado.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(function () {
    avisoGuardado.hidden = true;
  }, 2600);
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();
  if (!validateTaskForm()) {
    return;
  }

  gestorTareas.addTask({
    nombre: campoNombre.value.trim(),
    descripcion: campoDescripcion.value.trim(),
    asignadoA: campoAsignado.value.trim(),
    fechaDeEntrega: campoFecha.value.trim(),
    estado: campoEstado.value.trim()
  });

  gestorTareas.render();
  gestorTareas.save();
  formulario.reset();
  renderizarSelectorAsignado(campoAsignado, usuarioActivo);
  limpiarErroresDeTarea();
  mostrarAvisoGuardado();
});

[campoNombre, campoDescripcion, campoAsignado, campoFecha, campoEstado].forEach(function (campo) {
  campo.addEventListener("input", function () {
    marcarError(campo, "");
  });
});

botonCancelar.addEventListener("click", function () {
  formulario.reset();
  renderizarSelectorAsignado(campoAsignado, usuarioActivo);
  limpiarErroresDeTarea();
  if (window.bootstrap && bootstrap.Collapse) {
    bootstrap.Collapse.getOrCreateInstance(cajonFormulario, { toggle: false }).hide();
  }
});

// Escucha los clics en las tarjetas para completar, mover o borrar
listadoTareas.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button");
  if (!boton) {
    return;
  }
  const tarjeta = boton.closest(".t-card");
  if (!tarjeta) {
    return;
  }
  const id = tarjeta.getAttribute("data-id");

  if (boton.classList.contains("marcar-hecha")) {
    const tarea = gestorTareas.getTaskById(id);
    if (tarea) {
      tarea.estado = "HECHO";
    }
  } else if (boton.getAttribute("data-accion") === "eliminar") {
    gestorTareas.deleteTask(id);
  } else {
    moverTarea(id, boton.getAttribute("data-accion") === "adelante" ? 1 : -1);
  }

  gestorTareas.render();
  gestorTareas.save();
});

document.getElementById("tabla entregas").addEventListener("click", function (evento) {
  const boton = evento.target.closest(".marcar-hecha");
  if (!boton) {
    return;
  }
  const fila = boton.closest("tr");
  if (!fila) {
    return;
  }
  const tarea = gestorTareas.getTaskById(fila.getAttribute("data-id"));
  if (tarea) {
    tarea.estado = "HECHO";
    gestorTareas.render();
    gestorTareas.save();
  }
});

// Arrastrar y soltar entre columnas
let idArrastrado = null;

listadoTareas.addEventListener("dragstart", function (evento) {
  const tarjeta = evento.target.closest(".t-card");
  if (!tarjeta) {
    return;
  }
  idArrastrado = tarjeta.getAttribute("data-id");
  tarjeta.classList.add("is-dragging");
  evento.dataTransfer.effectAllowed = "move";
  evento.dataTransfer.setData("text/plain", idArrastrado);
});

listadoTareas.addEventListener("dragend", function (evento) {
  const tarjeta = evento.target.closest(".t-card");
  if (tarjeta) {
    tarjeta.classList.remove("is-dragging");
  }
  listadoTareas.querySelectorAll(".k-col-box.is-over").forEach(function (caja) {
    caja.classList.remove("is-over");
  });
});

listadoTareas.querySelectorAll("[data-estado]").forEach(function (columna) {
  const caja = columna.querySelector(".k-col-box");
  columna.addEventListener("dragover", function (evento) {
    evento.preventDefault();
    caja.classList.add("is-over");
  });
  columna.addEventListener("dragleave", function (evento) {
    if (!columna.contains(evento.relatedTarget)) {
      caja.classList.remove("is-over");
    }
  });
  columna.addEventListener("drop", function (evento) {
    evento.preventDefault();
    caja.classList.remove("is-over");
    if (idArrastrado === null) {
      return;
    }
    gestorTareas.updateTask(idArrastrado, columna.getAttribute("data-estado"));
    idArrastrado = null;
    gestorTareas.render();
    gestorTareas.save();
  });
});

["menu lateral", "menu lateral movil"].forEach(function (idContenedor) {
  document.getElementById(idContenedor).addEventListener("click", function (evento) {
    const boton = evento.target.closest("[data-vista]");
    if (boton) {
      cambiarVista(boton.getAttribute("data-vista"));
    }
  });
});

// Cerrar sesion recargando la vista de bienvenida
["boton cerrar sesion", "boton cerrar sesion lateral", "boton cerrar sesion movil"].forEach(function (idBtn) {
  document.getElementById(idBtn).addEventListener("click", function () {
    window.location.reload();
  });
});

inicio.alIniciarSesion(function () {
  renderizarSelectorAsignado(campoAsignado, usuarioActivo);
  gestorTareas.render();
});

cargarTareas();
renderizarSelectorAsignado(campoAsignado, usuarioActivo);
gestorTareas.render();

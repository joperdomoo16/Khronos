/* Creacion y visualizacion de las tarjetas del tablero */

/* Orden de las columnas del tablero, de la primera a la ultima */
const Estadosdetarea = ["POR HACER", "EN PROCESO", "REVISIÓN", "HECHO"];

const Tonosdepersona = 5;

/* Utilidades */

/* La misma persona siempre recibe el mismo tono, segun las letras de su nombre */
function tonoDePersona(nombre) {
  let suma = 0;
  for (const letra of nombre) {
    suma = suma + letra.charCodeAt(0);
  }
  return "tono-persona-" + (suma % Tonosdepersona);
}

function obtenerIniciales(nombre) {
  return nombre.trim().split(/\s+/).map(function(parte) {
    return parte.charAt(0);
  }).join("").slice(0, 2).toUpperCase();
}

function fechaComoTexto(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return fecha.getFullYear() + "-" + mes + "-" + dia;
}

function textoAFecha(texto) {
  const partes = texto.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function calcularVencimiento(fechaTexto, estado) {
  if (estado === "HECHO") {
    return { texto: "Completada", clase: "vence-hecha" };
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = Math.round((textoAFecha(fechaTexto) - hoy) / 86400000);
  if (dias < 0) {
    return { texto: "Venció hace " + (-dias) + " d", clase: "vence-pasada" };
  }
  if (dias === 0) {
    return { texto: "Vence hoy", clase: "vence-hoy" };
  }
  if (dias === 1) {
    return { texto: "Mañana", clase: "vence-manana" };
  }
  return { texto: "En " + dias + " días", clase: "vence-futura" };
}
/* Tablero */

function crearTarjetaTarea(tarea) {
  const plantilla = document.getElementById("plantilla de tarjeta");
  const tarjeta = plantilla.content.firstElementChild.cloneNode(true);
  tarjeta.setAttribute("data-id", tarea.id);

  tarjeta.querySelector(".t-name").textContent = tarea.nombre;
  tarjeta.querySelector(".t-desc").textContent = tarea.descripcion;
  tarjeta.querySelector(".t-who").textContent = tarea.asignadoA;

  const avatar = tarjeta.querySelector(".t-av");
  avatar.textContent = obtenerIniciales(tarea.asignadoA);
  avatar.classList.add(tonoDePersona(tarea.asignadoA));

  const vencimiento = calcularVencimiento(tarea.fechaDeEntrega, tarea.estado);
  const etiquetaFecha = tarjeta.querySelector(".t-due");
  etiquetaFecha.textContent = vencimiento.texto;
  etiquetaFecha.classList.add(vencimiento.clase);
  etiquetaFecha.title = "Entrega: " + tarea.fechaDeEntrega;

  const posicion = Estadosdetarea.indexOf(tarea.estado);
  tarjeta.querySelector("[data-accion='atras']").disabled = posicion === 0;
  tarjeta.querySelector("[data-accion='adelante']").disabled = posicion === Estadosdetarea.length - 1;
  return tarjeta;
}

function coincideConFiltro(tarea, filtro) {
  if (!filtro) {
    return true;
  }
  const texto = (tarea.nombre + " " + tarea.asignadoA + " " + tarea.descripcion).toLowerCase();
  return texto.indexOf(filtro.toLowerCase()) !== -1;
}

function renderizarTablero(tareas, filtro) {
  const total = tareas.length || 1;
  const columnas = document.querySelectorAll("[id='listado de tareas'] .t-col");
  columnas.forEach(function(columna) {
    const estado = columna.getAttribute("data-estado");
    const delEstado = tareas.filter(function(tarea) {
      return tarea.estado === estado;
    });
    const visibles = delEstado.filter(function(tarea) {
      return coincideConFiltro(tarea, filtro);
    });
    const tarjetas = visibles.map(function(tarea, indice) {
      const tarjeta = crearTarjetaTarea(tarea);
      tarjeta.style.animationDelay = (indice * 0.06) + "s";
      return tarjeta;
    });
    columna.querySelector(".t-list").replaceChildren.apply(columna.querySelector(".t-list"), tarjetas);
    columna.querySelector(".t-count").textContent = delEstado.length;
    columna.querySelector(".t-fill").style.width = Math.round((delEstado.length / total) * 100) + "%";
  });
}

// Crea las tarjetas y llena la tabla de entregas

const estadosTarea = ["POR HACER", "EN PROCESO", "REVISIÓN", "HECHO"];

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

function claseBadgeEstado(estado) {
  if (estado === "POR HACER") return "k-badge-pendiente";
  if (estado === "EN PROCESO") return "k-badge-proceso";
  if (estado === "REVISIÓN") return "k-badge-revision";
  return "k-badge-hecho";
}

function crearTarjetaTarea(tarea) {
  const plantilla = document.getElementById("plantilla de tarjeta");
  const tarjeta = plantilla.content.firstElementChild.cloneNode(true);
  tarjeta.setAttribute("data-id", tarea.id);

  tarjeta.querySelector(".t-name").textContent = tarea.nombre;
  tarjeta.querySelector(".t-desc").textContent = tarea.descripcion;
  tarjeta.querySelector(".t-who").textContent = tarea.asignadoA;

  const vencimiento = calcularVencimiento(tarea.fechaDeEntrega, tarea.estado);
  const etiquetaFecha = tarjeta.querySelector(".t-due");
  etiquetaFecha.textContent = vencimiento.texto;
  etiquetaFecha.classList.add(vencimiento.clase);
  etiquetaFecha.title = "Entrega: " + tarea.fechaDeEntrega;

  const esHecha = tarea.estado === "HECHO";
  tarjeta.classList.toggle("is-hecha", esHecha);

  const posicion = estadosTarea.indexOf(tarea.estado);
  tarjeta.querySelector("[data-accion='atras']").disabled = posicion === 0;
  tarjeta.querySelector("[data-accion='adelante']").disabled = posicion === estadosTarea.length - 1;

  const botonHecha = tarjeta.querySelector(".marcar-hecha");
  botonHecha.disabled = esHecha;
  if (esHecha) {
    botonHecha.className = "btn btn-sm btn-success marcar-hecha";
    botonHecha.textContent = "Completada";
  }

  return tarjeta;
}

function renderizarTablero(tareas) {
  const columnas = document.getElementById("listado de tareas").querySelectorAll("[data-estado]");

  columnas.forEach(function(columna) {
    const estado = columna.getAttribute("data-estado");
    const delEstado = tareas.filter(function(tarea) {
      return tarea.estado === estado;
    });

    const lista = columna.querySelector(".t-list");
    lista.innerHTML = "";
    delEstado.forEach(function(tarea) {
      lista.appendChild(crearTarjetaTarea(tarea));
    });
  });
}

function renderizarSelectorAsignado(selectAsignado, usuarioActivo) {
  selectAsignado.innerHTML = "";
  const nombres = [usuarioActivo];
  almacenamiento["obtener usuarios"]().forEach(function(u) {
    if (nombres.indexOf(u.nombre) === -1) {
      nombres.push(u.nombre);
    }
  });

  nombres.forEach(function(nombre) {
    const opt = document.createElement("option");
    opt.value = nombre;
    opt.textContent = nombre;
    selectAsignado.appendChild(opt);
  });
}

function renderizarTablaEntregas(tareas) {
  const cuerpo = document.getElementById("tabla entregas");
  cuerpo.innerHTML = "";

  const ordenadas = tareas.slice().sort(function(a, b) {
    return a.fechaDeEntrega.localeCompare(b.fechaDeEntrega);
  });

  ordenadas.forEach(function(tarea) {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", tarea.id);

    const tdNombre = document.createElement("td");
    tdNombre.className = "fw-semibold";
    tdNombre.textContent = tarea.nombre;

    const tdQuien = document.createElement("td");
    tdQuien.textContent = tarea.asignadoA;

    const tdFecha = document.createElement("td");
    const infoFecha = calcularVencimiento(tarea.fechaDeEntrega, tarea.estado);
    const spFecha = document.createElement("span");
    spFecha.className = "badge " + infoFecha.clase;
    spFecha.textContent = tarea.fechaDeEntrega + " · " + infoFecha.texto;
    tdFecha.appendChild(spFecha);

    const tdEstado = document.createElement("td");
    const spEstado = document.createElement("span");
    spEstado.className = "badge " + claseBadgeEstado(tarea.estado);
    spEstado.textContent = tarea.estado;
    tdEstado.appendChild(spEstado);

    const tdAccion = document.createElement("td");
    tdAccion.className = "text-end";
    const btnHecha = document.createElement("button");
    btnHecha.type = "button";
    btnHecha.className = tarea.estado === "HECHO" ? "btn btn-sm btn-success marcar-hecha" : "btn btn-sm btn-outline-success marcar-hecha";
    btnHecha.disabled = tarea.estado === "HECHO";
    btnHecha.textContent = tarea.estado === "HECHO" ? "Completada" : "Hecha";
    tdAccion.appendChild(btnHecha);

    tr.append(tdNombre, tdQuien, tdFecha, tdEstado, tdAccion);
    cuerpo.appendChild(tr);
  });
}

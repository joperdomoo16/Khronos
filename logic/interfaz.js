/* Creacion y visualizacion de los elementos del panel y del tablero */

/* Orden de las columnas del tablero, de la primera a la ultima */
const Estadosdetarea = ["POR HACER", "EN PROCESO", "REVISIÓN", "HECHO"];

/* Los colores viven como tokens en style.css; aqui solo se escoge la clase */
const Clasesdeestado = {
  "POR HACER": "estado-pendiente",
  "EN PROCESO": "estado-proceso",
  "REVISIÓN": "estado-revision",
  "HECHO": "estado-hecho"
};
const Tonosdepersona = 5;
const Diascortos = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

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

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) {
    elemento.className = clase;
  }
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  return elemento;
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

/* Resumen por estado */

function renderizarResumen(tareas) {
  const contenedor = document.getElementById("resumen de estados");
  const total = tareas.length || 1;

  /* Si las tarjetas ya existen solo se actualizan, para no repetir su animacion de entrada */
  if (contenedor.children.length === Estadosdetarea.length) {
    Estadosdetarea.forEach(function(estado, indice) {
      const cantidad = tareas.filter(function(tarea) {
        return tarea.estado === estado;
      }).length;
      const tarjeta = contenedor.children[indice];
      tarjeta.querySelector(".d-num").firstChild.textContent = String(cantidad);
      tarjeta.querySelector(".d-num small").textContent = cantidad === 1 ? "tarea" : "tareas";
      tarjeta.querySelector(".d-mini span").style.width = Math.round((cantidad / total) * 100) + "%";
    });
    return;
  }

  const tarjetas = Estadosdetarea.map(function(estado, indice) {
    const cantidad = tareas.filter(function(tarea) {
      return tarea.estado === estado;
    }).length;
    const tarjeta = crearElemento("article", "d-stat d-in");
    tarjeta.style.animationDelay = (1 + indice * 0.07) + "s";

    const cabecera = crearElemento("div", "d-stat-top");
    const chip = crearElemento("span", "d-chip " + Clasesdeestado[estado], estado);
    cabecera.appendChild(chip);

    const numero = crearElemento("div", "d-num", String(cantidad));
    numero.appendChild(crearElemento("small", "", cantidad === 1 ? "tarea" : "tareas"));

    const barra = crearElemento("div", "d-mini");
    const relleno = crearElemento("span", Clasesdeestado[estado]);
    relleno.style.width = Math.round((cantidad / total) * 100) + "%";
    barra.appendChild(relleno);

    tarjeta.append(cabecera, numero, barra);
    return tarjeta;
  });
  contenedor.replaceChildren.apply(contenedor, tarjetas);
}

/* Fecha y reloj de jornada (8:00 a 18:00) */

function renderizarFecha(ahora) {
  document.getElementById("fecha de hoy").textContent = ahora.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

function renderizarJornada(tareas, ahora) {
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  const avance = Math.min(1, Math.max(0, (minutos - 480) / 600));
  const restantes = Math.round((1 - avance) * 600);
  const horas = Math.floor(restantes / 60);
  const resto = String(restantes % 60).padStart(2, "0");
  const abiertas = tareas.filter(function(tarea) {
    return tarea.estado !== "HECHO";
  }).length;

  document.getElementById("tiempo restante").textContent = restantes === 0 ? "0 h" : horas + " h " + resto + " m";
  document.getElementById("barra de jornada").style.width = Math.round(avance * 100) + "%";
  document.getElementById("arena superior del dia").style.transform = "scaleY(" + (1 - avance).toFixed(3) + ")";
  document.getElementById("arena inferior del dia").style.transform = "scaleY(" + Math.max(0.08, avance).toFixed(3) + ")";
  let estadoJornada = Math.round(avance * 100) + "% de la arena del día ya cayó. ";
  if (avance >= 1) {
    estadoJornada = "La jornada de hoy ya terminó. ";
  } else if (avance <= 0) {
    estadoJornada = "La jornada aún no empieza. ";
  }
  document.getElementById("detalle de jornada").textContent = estadoJornada + abiertas + (abiertas === 1 ? " tarea sigue abierta." : " tareas siguen abiertas.");
}

/* Semana en el tiempo */

function renderizarSemana(tareas, ahora) {
  const contenedor = document.getElementById("semana");
  const lunes = new Date(ahora);
  lunes.setDate(ahora.getDate() - ((ahora.getDay() + 6) % 7));
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  const hoyTexto = fechaComoTexto(ahora);

  const dias = Diascortos.map(function(nombre, indice) {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + indice);
    const clave = fechaComoTexto(fecha);
    const dia = crearElemento("div", clave === hoyTexto ? "d-day is-today" : "d-day");
    const cabecera = crearElemento("div", "d-dh");
    cabecera.append(crearElemento("span", "", nombre), crearElemento("b", "", String(fecha.getDate())));
    dia.appendChild(cabecera);
    tareas.filter(function(tarea) {
      return tarea.fechaDeEntrega === clave;
    }).forEach(function(tarea) {
      const evento = crearElemento("div", "d-ev " + Clasesdeestado[tarea.estado], tarea.nombre);
      evento.title = tarea.nombre + " · " + tarea.asignadoA;
      dia.appendChild(evento);
    });
    return dia;
  });

  const indiceHoy = (ahora.getDay() + 6) % 7;
  const fraccion = (ahora.getHours() * 60 + ahora.getMinutes()) / 1440;
  const linea = crearElemento("span", "d-now");
  linea.style.left = "calc(" + (((indiceHoy + fraccion) / 7) * 100).toFixed(2) + "% - 1px)";
  dias.push(linea);
  contenedor.replaceChildren.apply(contenedor, dias);

  const formato = { day: "numeric", month: "short" };
  document.getElementById("rango de semana").textContent = lunes.toLocaleDateString("es-CO", formato) + " – " + domingo.toLocaleDateString("es-CO", formato);
}

/* Equipo */

function renderizarEquipo(tareas, usuarios, equipo) {
  document.getElementById("nombre de equipo").textContent = equipo.nombre;
  document.getElementById("descripcion de equipo").textContent = equipo.descripcion;

  const total = tareas.length;
  const hechas = tareas.filter(function(tarea) {
    return tarea.estado === "HECHO";
  }).length;
  const porcentaje = total === 0 ? 0 : Math.round((hechas / total) * 100);
  document.getElementById("porcentaje completado").textContent = porcentaje + "%";

  const pulso = document.getElementById("pulso de equipo");
  pulso.setAttribute("aria-label", porcentaje + " por ciento de las tareas completadas");
  if (!pulso.querySelector(".d-tick")) {
    for (let i = 0; i < 60; i = i + 1) {
      const marca = crearElemento("span", "d-tick");
      marca.style.transform = "rotate(" + (i * 6) + "deg) translateY(-80px)";
      pulso.insertBefore(marca, pulso.firstChild);
    }
  }
  const marcas = pulso.querySelectorAll(".d-tick");
  const encendidas = Math.round(porcentaje * 0.6);
  marcas.forEach(function(marca, indice) {
    marca.classList.toggle("is-done", (marcas.length - 1 - indice) < encendidas);
  });

  const lista = usuarios.map(function(usuario) {
    const cantidad = tareas.filter(function(tarea) {
      return tarea.asignadoA === usuario.nombre;
    }).length;
    const fila = crearElemento("div", "d-mem");
    const avatar = crearElemento("span", "d-av " + tonoDePersona(usuario.nombre), obtenerIniciales(usuario.nombre));
    const datos = crearElemento("div");
    const rol = usuario.nombre === equipo.lider ? "Líder · " + usuario.ciudad : usuario.ciudad;
    datos.append(crearElemento("b", "", usuario.nombre), crearElemento("span", "", rol));
    const contador = crearElemento("em", "", String(cantidad));
    contador.title = cantidad + (cantidad === 1 ? " tarea asignada" : " tareas asignadas");
    fila.append(avatar, datos, contador);
    return fila;
  });
  const contenedor = document.getElementById("miembros de equipo");
  contenedor.replaceChildren.apply(contenedor, lista);
}

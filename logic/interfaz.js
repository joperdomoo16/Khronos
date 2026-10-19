/* Creacion y visualizacion de tarjetas de tareas en el documento */

function crearTarjetaTarea(tarea) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "card tarjeta tarea mb-3";
  tarjeta.setAttribute("data-id", tarea.id);

  let claseInsignia = "bg-secondary";
  if (tarea.estado === "POR HACER") {
    claseInsignia = "bg-warning text-dark";
  }
  if (tarea.estado === "EN PROCESO") {
    claseInsignia = "bg-primary text-white";
  }
  if (tarea.estado === "REVISIÓN") {
    claseInsignia = "bg-info text-dark";
  }
  if (tarea.estado === "HECHO") {
    claseInsignia = "bg-success text-white";
  }

  tarjeta.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h5 class="card-title fw-bold mb-0">${tarea.nombre}</h5>
        <span class="badge ${claseInsignia}">${tarea.estado}</span>
      </div>
      <p class="card-text text-muted mb-2">${tarea.descripcion}</p>
      <div class="row g-2 text-secondary small mb-3">
        <div class="col-sm-6">
          <strong>Asignado a:</strong> ${tarea.asignadoA}
        </div>
        <div class="col-sm-6">
          <strong>Fecha de entrega:</strong> ${tarea.fechaDeEntrega}
        </div>
      </div>
      <div class="d-flex justify-content-end">
        <button type="button" class="btn btn-sm btn-outline-danger boton eliminar" data-id="${tarea.id}">Eliminar</button>
      </div>
    </div>
  `;

  return tarjeta;
}

function agregarTarjetaAlDom(tarjeta) {
  const contenedor = document.getElementById("listado de tareas");
  if (contenedor) {
    contenedor.appendChild(tarjeta);
  }
}

/* Modulo para el manejo del almacenamiento local */

const almacenamiento = {
  "obtener tareas": function() {
    return JSON.parse(localStorage.getItem("tareas de khronos")) || [];
  },

  "guardar tareas": function(tareas) {
    localStorage.setItem("tareas de khronos", JSON.stringify(tareas));
  },

  "obtener usuarios": function() {
    const guardados = JSON.parse(localStorage.getItem("usuarios de khronos"));
    if (guardados && guardados.length > 0) {
      return guardados;
    }
    return [
      {
        nombre: "Carlos Mendoza",
        correo: "carlos.mendoza@correo.com",
        celular: "3104567890",
        ciudad: "Bogota"
      },
      {
        nombre: "Valentina Rios",
        correo: "valentina.rios@correo.com",
        celular: "3156781234",
        ciudad: "Medellin"
      },
      {
        nombre: "Andres Ospina",
        correo: "andres.ospina@correo.com",
        celular: "3009876543",
        ciudad: "Cali"
      },
      {
        nombre: "Camila Restrepo",
        correo: "camila.restrepo@correo.com",
        celular: "3123456789",
        ciudad: "Barranquilla"
      }
    ];
  },

  "guardar usuarios": function(usuarios) {
    localStorage.setItem("usuarios de khronos", JSON.stringify(usuarios));
  },

  "obtener equipos": function() {
    const guardados = JSON.parse(localStorage.getItem("equipos de khronos"));
    if (guardados && guardados.length > 0) {
      return guardados;
    }
    return [
      {
        id: "equipo principal",
        nombre: "Equipo Bogota",
        descripcion: "Planeacion y diseno general",
        lider: "Carlos Mendoza",
        ciudad: "Bogota"
      }
    ];
  },

  "guardar equipos": function(equipos) {
    localStorage.setItem("equipos de khronos", JSON.stringify(equipos));
  }
};

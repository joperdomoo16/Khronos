/* Modulo para el manejo del almacenamiento local */

const almacenamiento = {
  "obtener tareas": function() {
    return JSON.parse(localStorage.getItem("tareas de khronos")) || [];
  },

  "guardar tareas": function(tareas) {
    localStorage.setItem("tareas de khronos", JSON.stringify(tareas));
  },

  "obtener usuarios": function() {
    return JSON.parse(localStorage.getItem("usuarios de khronos")) || ["User Uno", "User Dos", "User Tres", "User Cuatro", "User Cinco"];
  },

  "guardar usuarios": function(usuarios) {
    localStorage.setItem("usuarios de khronos", JSON.stringify(usuarios));
  }
};

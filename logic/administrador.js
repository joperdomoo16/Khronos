/* Clase para guardar y manejar las tareas */

class TaskManager {
  constructor() {
    this.tasks = [];
    this.currentId = 1;
  }

  getAllTasks() {
    return this.tasks;
  }

  getTasksWithStatus(status) {
    return this.tasks.filter(function(tarea) {
      return tarea.estado === status;
    });
  }

  // Busca una tarea por id convirtiendo a numero para comparar bien
  getTaskById(taskId) {
    const idNumero = parseInt(taskId, 10);
    let tareaEncontrada = null;
    for (const tarea of this.tasks) {
      if (tarea.id === idNumero) {
        tareaEncontrada = tarea;
      }
    }
    return tareaEncontrada;
  }

  addTask(task) {
    if (!task.id) {
      task.id = this.currentId;
    }
    if (task.id >= this.currentId) {
      this.currentId = task.id + 1;
    }
    this.tasks.push(task);
    return task;
  }

  deleteTask(taskId) {
    const idNumero = parseInt(taskId, 10);
    this.tasks = this.tasks.filter(function(tarea) {
      return tarea.id !== idNumero;
    });
  }

  updateTask(taskId, status) {
    const idNumero = parseInt(taskId, 10);
    for (const tarea of this.tasks) {
      if (tarea.id === idNumero) {
        tarea.estado = status;
        break;
      }
    }
  }

  assignTask(taskId, assignee) {
    const idNumero = parseInt(taskId, 10);
    for (const tarea of this.tasks) {
      if (tarea.id === idNumero) {
        tarea.asignadoA = assignee;
        break;
      }
    }
  }

  // Guarda las tareas y el ultimo id en localStorage
  save() {
    const textoTareas = JSON.stringify(this.tasks);
    localStorage.setItem("tareas de khronos", textoTareas);
    localStorage.setItem("ultimo id de khronos", String(this.currentId));
  }

  // Carga las tareas y el contador de id guardados en localStorage
  load() {
    const textoTareas = localStorage.getItem("tareas de khronos");
    if (textoTareas) {
      this.tasks = JSON.parse(textoTareas);
    }
    const ultimoId = localStorage.getItem("ultimo id de khronos");
    if (ultimoId) {
      this.currentId = Number(ultimoId);
    } else if (this.tasks.length > 0) {
      const mayorId = Math.max.apply(null, this.tasks.map(function(t) { return t.id || 0; }));
      this.currentId = mayorId + 1;
    }
  }

  // Vuelve a dibujar todas las tarjetas en pantalla
  render() {
    if (typeof renderizarTodo === "function") {
      renderizarTodo();
    }
  }
}

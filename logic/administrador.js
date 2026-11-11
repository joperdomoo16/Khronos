/* Administrador de tareas en memoria */

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
}

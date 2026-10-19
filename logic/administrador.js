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
    task.id = this.currentId;
    this.currentId = this.currentId + 1;
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

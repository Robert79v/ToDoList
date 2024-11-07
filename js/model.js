export default class Model {
  constructor() {
    this.view = null;
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    if (this.todos.length === 0) {
      this.todos = [{
        id: 0,
        title: 'Learn JS',
        description: 'Watch JS Tutorials',
        completed: false,
      }];
    }
    this.currentId = this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1;
  }

  setView(view) {
    this.view = view;
  }

  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  getTodos() {
    return this.todos.map((todo) => ({...todo}));
  }

  findTodoIndex(id) {
    return this.todos.findIndex((todo) => todo.id === id);
  }

  toggleCompleted(id) {
    const index = this.findTodoIndex(id);
    if (index !== -1) {
      const todo = this.todos[index];
      todo.completed = !todo.completed;
      this.save();
      this.view.render(); // Actualiza la vista
    }
  }

  editTodo(id, values) {
    const index = this.findTodoIndex(id);
    if (index !== -1) {
      Object.assign(this.todos[index], values);
      this.save();
      this.view.render(); // Actualiza la vista
    }
  }

  addTodo(title, description) {
    const todo = {
      id: this.currentId++,
      title,
      description,
      completed: false,
    };
    this.todos.push(todo);
    this.save();
    this.view.render(); // Actualiza la vista
    return {...todo};
  }

  removeTodo(id) {
    const index = this.findTodoIndex(id);
    if (index !== -1) {
      this.todos.splice(index, 1);
      this.save();
      this.view.render(); // Actualiza la vista
    }
  }

  reorderTasks(draggedId, targetId) {
    const draggedIndex = this.todos.findIndex(todo => todo.id == draggedId);
    const targetIndex = this.todos.findIndex(todo => todo.id == targetId);
    
    // Reordenar el array de tareas en memoria
    const [draggedTodo] = this.todos.splice(draggedIndex, 1);
    this.todos.splice(targetIndex, 0, draggedTodo);

    this.save();  // Guardar el nuevo orden en localStorage
    this.view.render(); // Actualiza la vista después de reordenar
  }
}

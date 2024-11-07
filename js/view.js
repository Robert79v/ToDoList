import AddTodo from './components/add-todo.js';
import Modal from './components/modal.js';
import Filters from './components/filters.js';

export default class View {
  constructor() {
    this.model = null;
    this.table = document.getElementById('table');
    this.addTodoForm = new AddTodo();
    this.modal = new Modal();
    this.filters = new Filters();
    

    this.addTodoForm.onClick((title, description) => this.addTodo(title, description));
    this.modal.onClick((id, values) => this.editTodo(id, values));
    this.filters.onClick((filters) => this.filter(filters));
  }

  setModel(model) {
    this.model = model;
  }

  render() {
    // Limpiar las filas de la tabla, excepto el encabezado
    const rows = this.table.querySelectorAll('tr:not(:first-child)');
    rows.forEach(row => row.remove()); // Eliminar todas las filas (menos la del encabezado)
  
    // Obtener todas las tareas y renderizarlas
    const todos = this.model.getTodos();
    todos.forEach((todo) => {
      this.createRow(todo); // Crear una fila para cada tarea
      if (todo.completed) {
        // Si la tarea está completada, aplicar el estilo correspondiente
        const row = document.getElementById(todo.id);
        row.children[0].classList.add('completed');
        row.children[1].classList.add('completed');
      }
    });
  }
  

  filter(filters) {
    const { type, words } = filters;
    const [, ...rows] = this.table.getElementsByTagName('tr');
    for (const row of rows) {
      const [title, description, completed] = row.children;
      let shouldHide = false;

      if (words) {
        shouldHide = !title.innerText.includes(words) && !description.innerText.includes(words);
      }

      const shouldBeCompleted = type === 'completed';
      const isCompleted = completed.children[0].checked;

      if (type !== 'all' && shouldBeCompleted !== isCompleted) {
        shouldHide = true;
      }

      if (shouldHide) {
        row.classList.add('d-none');
      } else {
        row.classList.remove('d-none');
      }
    }
  }

  addTodo(title, description) {
    // Agregar la tarea al modelo
    const todo = this.model.addTodo(title, description);
    
    // Aquí llamamos a render() para actualizar la tabla y mostrar la nueva tarea sin duplicar
    this.render(); // Esto va a limpiar y mostrar todas las tareas correctamente, incluida la nueva.
  }

  toggleCompleted(id) {
    this.model.toggleCompleted(id);
  }

  editTodo(id, values) {
    this.model.editTodo(id, values);
    const row = document.getElementById(id);
    row.children[0].innerText = values.title;
    row.children[1].innerText = values.description;
    row.children[2].children[0].checked = values.completed;
  }

  removeTodo(id) {
    this.model.removeTodo(id);
    document.getElementById(id).remove();
  }

    createRow(todo) {
      const row = this.table.insertRow();
      row.setAttribute('id', todo.id);
      row.draggable = true; // Hacer que la fila sea draggable
  
      row.innerHTML = `
        <td>${todo.title}</td>
        <td>${todo.description}</td>
        <td class="text-center"></td>
        <td class="text-right"></td>
      `;
  
      // Checkbox para marcar como completado
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.onclick = () => {
          this.toggleCompleted(todo.id);
          row.children[0].classList.toggle('completed', checkbox.checked);
          row.children[1].classList.toggle('completed', checkbox.checked);
      };
      row.children[2].appendChild(checkbox);
  
      // Drag and Drop Events
      row.addEventListener('dragstart', (event) => {
          event.dataTransfer.setData('text/plain', todo.id); // Guardar el ID de la tarea arrastrada
          row.classList.add('dragging');
      });
  
      row.addEventListener('dragend', () => {
          row.classList.remove('dragging'); // Remover clase al terminar el arrastre
      });
  
      row.addEventListener('dragover', (event) => {
          event.preventDefault(); // Permitir que otras filas sean zonas de soltado
      });
  
      row.addEventListener('drop', (event) => {
          event.preventDefault();
          const draggedId = event.dataTransfer.getData('text/plain'); // Obtener el ID de la tarea arrastrada
          const targetId = todo.id; // ID de la fila de destino
          this.reorderTasks(draggedId, targetId);
      });
  
      // Botones de edición y eliminación (igual que antes)
      const editBtn = document.createElement('button');
      editBtn.classList.add('btn', 'btn-primary', 'mb-1');
      editBtn.innerHTML = '<i class="fa fa-pencil"></i>';
      editBtn.setAttribute('data-toggle', 'modal');
      editBtn.setAttribute('data-target', '#modal');
      editBtn.onclick = () => this.modal.setValues({
          id: todo.id,
          title: row.children[0].innerText,
          description: row.children[1].innerText,
          completed: row.children[2].children[0].checked,
      });
      row.children[3].appendChild(editBtn);
  
      const removeBtn = document.createElement('button');
      removeBtn.classList.add('btn', 'btn-danger', 'mb-1', 'ml-1');
      removeBtn.innerHTML = '<i class="fa fa-trash"></i>';
      removeBtn.onclick = () => this.removeTodo(todo.id);
      row.children[3].appendChild(removeBtn);
  }
  reorderTasks(draggedId, targetId) {
    this.model.reorderTasks(draggedId, targetId); // Llamamos al modelo para reordenar las tareas
  }  
    
}

// =============================================================
//       Projeto Independente para prática de JavaScript
//              Isabelli Cristina Mocci - 15/03/2025
//                        'To-do List'
// =============================================================

/*
    🔹 Objetivo: criar uma Lista de Tarefas interativa e funcional com JavaScript contendo as seguintes características:

    🔸Adição de Tarefas:
      ⮡ [x]Permite adicionar tarefas ao clicar no 'Adicionar' ou pressionar 'Enter'
      ⮡ [x]Permite adicionar nome a lista de tarefas
      ⮡ [x]Limpa o campo de entrada automaticamente após a adição de cada tarefa
      ⮡ [x]Ao adicionar tarefas, o foco permanece no input de add task

    🔸Exibição de Tarefas:
      ⮡ [x]Exibir as tarefas na tela, incluindo um botão para excluí-las
      ⮡ [x]Remove tarefa da lista ao clicar no botão 'Excluir' correspondente
      ⮡ [x]Edita tarefa ao clicar no botão 'Editar'
      ⮡ [x]Tarefas longas sofrem quebra de linha

    🔸Persistência de Dados:
      ⮡ [x]Armazenar tarefas no navegador utilizando `localStorage`
      ⮡ [x]Armazenar o nome da lista de tarefas no `localStorage`
      ⮡ [x]Ao recarregar a página, as tarefas e o nome da lista devem exibido novamente

    🔸Ações com Tarefas:
      ⮡ [x]Filtrar tarefas em: todas/pendentes/concluídas
      ⮡ [x]Arrastar e soltar tarefa para reposicionar
      ⮡ [x]Permite marcar tarefas como concluídas
      ⮡ [x]Ao concluir uma tarefa, a mesma recebe mudança de estilo

*/
// =============================================================

/**
 * Inicializa a aplicação: armazena referências, configura eventos e carrega tarefas salvas.
 */
const TaskManager = {
  init() {
    this.cacheDOM();
    this.bindEvents();
    this.loadTasks();
  },

  /**
   * Obtém referências do DOM e armazena em propriedades do objeto.
   */
  cacheDOM() {
    this.taskInput = document.querySelector("#input-task");
    this.taskButton = document.querySelector("#new-task");
    this.taskList = document.querySelector(".task-list");
    this.taskFilters = document.querySelectorAll(".tabs span");
    this.taskTitle = document.querySelector("#list-name");
    this.draggedTask = null;
  },

  /**
   * Associa eventos aos elementos do DOM.
   */
  bindEvents() {
    this.taskButton.addEventListener("click", () => this.addTask());
    this.taskInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.addTask();
      }
    });
    this.taskList.addEventListener("click", (event) => this.handleTaskClick(event));
    this.taskList.addEventListener("change", (event) => this.handleTaskCheck(event));
    this.taskList.addEventListener("keypress", (event) => this.handleTaskEdit(event));
    this.taskFilters.forEach((filter) =>
      filter.addEventListener("click", () => this.filterTasks(filter))
    );
    this.taskTitle.addEventListener("click", () => this.enableTitleEdit());
    this.taskTitle.addEventListener("blur", () => this.disableTitleEdit());
    this.taskTitle.addEventListener("keypress", (event) => this.handleTitleEdit(event));
    this.enableDragAndDrop();
  },

  /**
   * Cria um elemento HTML representando uma tarefa.
   */
  createTaskElement(taskText, isCompleted = false) {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task");
    if (isCompleted) taskItem.classList.add("completed");
    taskItem.draggable = true;
    taskItem.innerHTML = `
      <label>
        <input class="input-checkbox" type="checkbox" ${isCompleted ? "checked" : ""}>
        <span class="editable-text ${isCompleted ? "completed" : ""}" tabindex="0">${taskText}</span>
      </label>
      <div id="icons">
        <span class="edit-task material-symbols-outlined" role="button" tabindex="0" aria-label="Edit task">edit_square</span>
        <span class="delete-task material-symbols-outlined" role="button" tabindex="0" aria-label="Delete task">cancel</span>
      </div>`;
    return taskItem;
  },

  /**
   * Adiciona uma nova tarefa à lista.
   */
  addTask() {
    const taskText = this.taskInput.value.trim();
    if (taskText === "") return;

    const taskItem = this.createTaskElement(taskText);
    this.taskList.appendChild(taskItem);
    this.taskInput.value = "";
    this.taskInput.focus(); 
    this.saveTasks();
  },

  /**
   * Salva a lista de tarefas no localStorage.
   */
  saveTasks() {
    const tasks = [...this.taskList.children].map((task) => ({
      text: task.querySelector(".editable-text").textContent,
      completed: task.querySelector("input").checked,
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("taskTitle", this.taskTitle.value);
  },

  /**
   * Carrega tarefas salvas no localStorage ao iniciar.
   */
  loadTasks() {
    this.taskList.innerHTML = "";
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const savedTitle = localStorage.getItem("taskTitle") || "My List";

    this.taskTitle.value = savedTitle;
    savedTasks.forEach((task) => this.taskList.appendChild(this.createTaskElement(task.text, task.completed)));
  },

  /**
   * Permite clicar para editar ou excluir.
   */
  handleTaskClick(event) {
    if (event.target.classList.contains("delete-task")) {
      event.target.closest("li").remove();
      this.saveTasks();
    } else if (event.target.classList.contains("edit-task")) {
      this.enableTaskEdit(event.target);
    }
  },

  /**
   * Adiciona ou remove a classe "completed".
   */
  handleTaskCheck(event) {
    if (event.target.classList.contains("input-checkbox")) {
      const taskItem = event.target.closest("li");
      const taskText = taskItem.querySelector(".editable-text");
      taskItem.classList.toggle("completed", event.target.checked); 
      taskText.classList.toggle("completed", event.target.checked); 
      this.saveTasks();

      const activeFilter = document.querySelector(".tabs .active");
      if (activeFilter) {
        this.filterTasks(activeFilter);
      }
    }
  },

  /**
   * Permite a edição do texto da tarefa.
   */
  enableTaskEdit(editButton) {
    const taskSpan = editButton.closest("li").querySelector(".editable-text");
    taskSpan.contentEditable = true;
    taskSpan.focus();
    taskSpan.addEventListener("blur", () => {
      taskSpan.contentEditable = false;
      this.saveTasks();
    });
  },

  /**
   * Impede quebra de linha ao pressionar Enter ao editar uma tarefa.
   */
  handleTaskEdit(event) {
    if (event.target.classList.contains("editable-text") && event.key === "Enter") {
      event.preventDefault();
      event.target.blur();
    }
  },

  /**
   * Torna o título da lista editável.
   */
  enableTitleEdit() {
    this.taskTitle.contentEditable = true;
    this.taskTitle.focus();
  },

  /**
   * Torna o título da lista NÃO editável.
   */
  disableTitleEdit() {
    this.taskTitle.contentEditable = false;
    this.saveTasks();
  },

  /**
   * Verifica se a tecla pressionada foi 'Enter'.
   */
  handleTitleEdit(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.taskTitle.blur();
    } 
  },

  /**
   * Filtra as tarefas com base na categoria selecionada.
   */
  filterTasks(filter) {
    document.querySelector(".tabs .active").classList.remove("active");
    filter.classList.add("active");
    const filterType = filter.textContent.toLowerCase();
    
    [...this.taskList.children].forEach((task) => {
      const isCompleted = task.querySelector("input").checked;
      task.style.display =
        filterType === "all" ||
        (filterType === "pending" && !isCompleted) ||
        (filterType === "completed" && isCompleted)
          ? "flex"
          : "none";
    });
  },
 
  /**
   * Permite reorganizar tarefas arrastando-as.
   */
  enableDragAndDrop() {
    this.taskList.addEventListener("dragstart", (event) => {
      this.draggedTask = event.target;
      this.draggedTask.classList.add("dragging");
      setTimeout(() => (this.draggedTask.style.opacity = "0.5"), 0);
    });

    this.taskList.addEventListener("dragover", (event) => {
      event.preventDefault();
      const afterElement = this.getDragAfterElement(event.clientY);
      if (afterElement == null) {
        this.taskList.appendChild(this.draggedTask);
      } else {
        this.taskList.insertBefore(this.draggedTask, afterElement);
      }
    });

    this.taskList.addEventListener("dragend", () => {
      this.draggedTask.classList.remove("dragging");
      this.draggedTask.style.opacity = "1";
      this.saveTasks();
    });
  },

  getDragAfterElement(y) {
    const draggableElements = [...this.taskList.querySelectorAll(".task:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
};

document.addEventListener("DOMContentLoaded", () => TaskManager.init());

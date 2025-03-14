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

    🔸Exibição de Tarefas:
      ⮡ [x]Exibir as tarefas na tela, incluindo um botão para excluí-las
      ⮡ [x]Remove tarefa da lista ao clicar no botão 'Excluir' correspondente
      ⮡ [x]Edita tarefa ao clicar no botão 'Editar'

    🔸Persistência de Dados:
      ⮡ [x]Armazenar tarefas no navegador utilizando `localStorage`
      ⮡ []Armazenar o nome da lista de tarefas no `localStorage`
      ⮡ [x]Ao recarregar a página, as tarefas e o nome da lista devem exibido novamente

    🔸Ações com Tarefas:
      ⮡ [x]Filtrar tarefas em: todas/pendentes/concluídas
      ⮡ [x] Arrastar e soltar tarefa para reposicionar
      ⮡ [x]Permite marcar tarefas como concluídas
      ⮡ [x]Ao concluir uma tarefa, a mesma recebe mudança de estilo

*/
// =============================================================

document.addEventListener("DOMContentLoaded", function () {
  const taskInput = document.querySelector("#input-task");
  const taskButton = document.querySelector("#new-task");
  const taskList = document.querySelector(".task-list");
  const taskFilters = document.querySelectorAll(".tabs span");
  const taskTitle = document.querySelector("#list-name");
  let draggedTask = null;

  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const taskItem = document.createElement("li");
    taskItem.classList.add("task");
    taskItem.draggable = true;
    taskItem.innerHTML = `
      <label>
        <input class="input-checkbox" type="checkbox">
        <span class="editable-text">${taskText}</span>
      </label>
      <div>
        <span class="edit-task material-symbols-outlined">edit_square</span>
        <span class="delete-task material-symbols-outlined">cancel</span>
      </div>`;

    taskList.appendChild(taskItem);
    taskInput.value = "";
    saveTasks();
  }

  function saveTasks() {
    const tasks = [...taskList.children].map((task) => ({
      text: task.querySelector(".editable-text").textContent,
      completed: task.querySelector("input").checked,
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("taskTitle", taskTitle.value);
  }

  function loadTasks() {
    taskList.innerHTML = "";
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const savedTitle = localStorage.getItem("taskTitle") || "My List";
    
    taskTitle.value = savedTitle;
    savedTasks.forEach((task) => {
      const taskItem = document.createElement("li");
      taskItem.classList.add("task");
      taskItem.draggable = true;
      taskItem.innerHTML = `
        <label>
          <input class="input-checkbox" type="checkbox" ${task.completed ? "checked" : ""}>
          <span class="editable-text ${task.completed ? "completed" : ""}">${task.text}</span>
        </label>
        <div>
          <span class="edit-task material-symbols-outlined">edit_square</span>
          <span class="delete-task material-symbols-outlined">cancel</span>
        </div>`;
      taskList.appendChild(taskItem);
    });
  }

  taskList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-task")) {
      event.target.closest("li").remove();
      saveTasks();
    } else if (event.target.classList.contains("edit-task")) {
      const taskSpan = event.target.closest("li").querySelector(".editable-text");
      taskSpan.contentEditable = true;
      taskSpan.focus();

      taskSpan.addEventListener("blur", () => {
        taskSpan.contentEditable = false;
        saveTasks();
      });
    }
  });

  taskList.addEventListener("change", (event) => {
    if (event.target.type === "checkbox") {
      event.target.nextElementSibling.classList.toggle("completed", event.target.checked);
      saveTasks();
    }
  });

  taskFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      document.querySelector(".tabs .active").classList.remove("active");
      filter.classList.add("active");
      const filterType = filter.textContent.toLowerCase();

      [...taskList.children].forEach((task) => {
        const isCompleted = task.querySelector("input").checked;
        task.style.display =
          filterType === "all" ? "flex" :
          filterType === "pending" && !isCompleted ? "flex" :
          filterType === "completed" && isCompleted ? "flex" : "none";
      });
    });
  });

  taskTitle.addEventListener("click", () => {
    taskTitle.contentEditable = true;
    taskTitle.focus();
  });

  taskTitle.addEventListener("blur", () => {
    taskTitle.contentEditable = false;
    saveTasks();
  });

  taskTitle.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      taskTitle.blur();
    }
  });

  taskList.addEventListener("keypress", (event) => {
    if (event.target.classList.contains("editable-text") && event.key === "Enter") {
      event.preventDefault();
      event.target.blur();
    }
  });

  taskButton.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") addTask();
  });

  taskList.addEventListener("dragstart", (event) => {
    draggedTask = event.target;
    draggedTask.classList.add("dragging");
    setTimeout(() => (draggedTask.style.opacity = "0.5"), 0);
  });

  taskList.addEventListener("dragover", (event) => {
    event.preventDefault();
    const afterElement = getDragAfterElement(taskList, event.clientY);
    if (afterElement == null) {
      taskList.appendChild(draggedTask);
    } else {
      taskList.insertBefore(draggedTask, afterElement);
    }
  });

  taskList.addEventListener("dragend", (event) => {
    draggedTask.classList.remove("dragging");
    draggedTask.style.opacity = "1";
    saveTasks();
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".task:not(.dragging)")];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  loadTasks();
});


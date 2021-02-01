"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  // creating variables
  const addButton = document.querySelector("#add-button");
  const viewSection = document.querySelector("#view-section");
  const sortButton = document.querySelector("#sort-button");
  const clearButton = document.querySelector("#clear-button");
  const counter = document.querySelector("#counter");
  // getting the array out of the storage and creating container for each object of the array
  let tasks = await getPersistent();
  if (!tasks) {
    tasks = [];
  }
  for (const task of tasks) {
    viewSection.append(createContainer(task));
  }
  //calling the tasksCounter function for updating the tasks counter on loading
  tasksCounter();

  //event listeners -
  addButton.addEventListener("click", addTodo);

  viewSection.addEventListener("click", doneTask);
  viewSection.addEventListener("click", completeTask);
  clearButton.addEventListener("click", clearAll);
  sortButton.addEventListener("click", sortTasks);
  //functions -

  //function for creating new task as an arrays object
  function addTodo() {
    let task = {
      text: document.querySelector("#text-input").value,
      priority: document.querySelector("#priority-selector").value,
      date: new Date().toISOString().slice(0, 19).replace("T", " "),
      done: false,
    };
    //inserting the data to a container for displaying it properly on the pge
    viewSection.append(createContainer(task));
    tasks.push(task);
    setPersistent(tasks);
    tasksCounter();
    //emptying the input for the next task todo
    document.querySelector("#text-input").value = "";
  }

  //function for generating the html container for the "task" object
  function createContainer(task) {
    //  generating the container of the new task
    const todoContainer = document.createElement("div");
    todoContainer.className = "todo-container";

    //  generating the text div of the new task
    const todoText = document.createElement("div");
    todoText.innerText = task.text;
    todoText.className = "todo-text";
    todoContainer.append(todoText);

    //  generating the priority div of the new task
    const todoPriority = document.createElement("div");
    todoPriority.className = "todo-priority";
    todoPriority.innerText = task.priority;
    todoContainer.append(todoPriority);

    //  generating the time div of the new task and displaying it in SQL format
    const createdAt = document.createElement("div");
    createdAt.innerText = task.date;

    createdAt.className = "todo-created-at";
    todoContainer.append(createdAt);
    //create complete button and assigning classes for decoration
    const completedButton = document.createElement("button");
    completedButton.innerHTML = `<i class="fas fa-check"></i>`;
    completedButton.classList.add("complete-button");
    todoContainer.appendChild(completedButton);
    //Create trash button and assigning classes for decoration
    const trashButton = document.createElement("button");
    trashButton.innerHTML = `<i class="fas fa-trash"></i>`;
    trashButton.classList.add("trash-button");
    todoContainer.appendChild(trashButton);
    todoContainer.setAttribute("draggable", "true");

    if (task.done === "true") {
      todoContainer.classList.add("completed");
    } else {
      todoContainer.classList.remove("completed");
    }

    return todoContainer;
  }

  // function for counting tasks and displaying the amount in the counter
  function tasksCounter() {
    counter.textContent = tasks.length;
  }

  // function for sorting tasks by their priority
  function sortTasks(e) {
    const item = e.target;
    tasks = tasks.sort((a, b) => b.priority - a.priority);
    viewSection.innerHTML = " ";
    for (const task of tasks) {
      const container = createContainer(task);
      viewSection.append(container);
    }
  }
  //function for clearing the entire list(if the user approves)
  function clearAll() {
    if (confirm("Are you sure you want to clear the entire list?")) {
      viewSection.innerHTML = " ";
      tasks = [];
      counter.textContent = tasks.length;
      setPersistent(tasks);
    }
  }

  //2 functions for assigning a new class to the todo-container for animating it due to the clicked button(trash/complete) -

  //when the complete button is clicked the code below will be executed to animate the container
  function completeTask(e) {
    const item = e.target;
    if (item.classList[0] === "complete-button") {
      const taskContainer = item.parentNode;
      const date = taskContainer.querySelector(".todo-created-at").innerText;
      for (let task of tasks) {
        if (task.date === date) {
          if (task.done === "true") {
            task.done = "false";
          } else {
            task.done = "true";
          }
        }
      }

      taskContainer.classList.toggle("completed");
    }
    setPersistent(tasks);
  }
  //when the trash button is clicked the code below will be executed to animate the container and then delete it
  function doneTask(e) {
    const item = e.target;
    if (item.classList[0] === "trash-button") {
      const taskContainer = item.parentElement;
      //alerting the user to make sure he wants to delete the task
      if (!confirm(`Are you sure you want to delete task?`)) {
        return;
      }
      taskContainer.classList.add("fall");
      taskContainer.addEventListener("transitionend", (e) => {
        removeFromStorage(taskContainer);
      });
    }
  }
  // function for removing the deleted task  out of the storage
  function removeFromStorage(taskContainer) {
    const containerNodeList = document.querySelectorAll(".todo-container");
    const containerArray = Array.from(containerNodeList);
    const taskIndex = containerArray.indexOf(taskContainer);
    tasks.splice(taskIndex, 1);
    taskContainer.remove();
    setPersistent(tasks);
    counter.textContent = tasks.length;
  }
  //drag and drop section
  const draggables = document.querySelectorAll(".todo-container");

  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });

    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
    });
  });

  viewSection.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(viewSection, e.clientY);
    const draggable = document.querySelector(".dragging");
    if (afterElement == null) {
      viewSection.appendChild(draggable);
    } else {
      viewSection.insertBefore(draggable, afterElement);
    }
  });
});

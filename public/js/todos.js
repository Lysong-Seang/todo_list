const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const addButton = document.querySelector(".btnAdd");
const deleteButton = document.getElementById("deleteAll");
const filterButtons = document.querySelectorAll(".dropdown-content a");


document.addEventListener("DOMContentLoaded", async function () {
    addButton.addEventListener("click", addTask);
    todoInput.addEventListener("keydown", async function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            await addTask();
        }
    });
    deleteButton.addEventListener("click", deleteAllTasks);
    filterButtons.forEach(button => {
        button.addEventListener("click", async function (e) {
            e.preventDefault();
            const filter = e.target.id; 
            await displayTasks(filter);
        });
    });
    await displayTasks();
});

async function fetchTodos() {
    const response = await fetch('/api/todos');
    return await response.json();
}

async function addTask() {
    const newTask = todoInput.value.trim();
    let todoDate = document.getElementById("todoDate").value.trim();
    if (todoDate) {
        todoDate = new Date(todoDate).toISOString().split("T")[0]; 
    }
    if (newTask !== "") {
        await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newTask, date: todoDate || null})
        });
        todoInput.value = "";
        document.getElementById("todoDate").value = "";
        await displayTasks();
    }
}

async function displayTasks(filter="all") {
    const todos = await fetchTodos(); 
    todoList.innerHTML = ""; 
    const filteredTodos = todos.filter(todo => {
        if (filter === "rem") return !todo.disabled; 
        if (filter === "com") return todo.disabled; 
        return true; 
    });
    filteredTodos.forEach(todo => {
        const formattedDate = todo.deadline
            ? new Date(todo.deadline).toISOString().split("T")[0]
            : "";
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <div class="todo-container">
                <input type="checkbox" class="todo-checkbox" id="input-${todo.id}" ${
            todo.disabled ? "checked" : ""
        }>
                <p id="todo-${todo.id}" class="${
            todo.disabled ? "disabled" : ""
        }" onclick="editTask(${todo.id})">${todo.text}</p>
        ${
            formattedDate
                ? `<span class="todo-date">${formattedDate}</span>` 
                : ""
        }
                <button class="delete-btn" onclick="deleteTask(${todo.id})">&times;</button>

            </div>
        `;

        listItem.querySelector(".todo-checkbox").addEventListener("change", () =>
            toggleTask(todo.id)
        );
        todoList.appendChild(listItem);
    });
    todoCount.textContent = todos.length;
}

async function deleteTask(id) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    await displayTasks();
}

async function editTask(id) {
    const todoItem = document.getElementById(`todo-${id}`);
    const existingText = todoItem.textContent;
    const inputElement = document.createElement("input");

    inputElement.value = existingText;
    todoItem.replaceWith(inputElement);
    inputElement.focus();

    inputElement.addEventListener("blur", async function () {
        const updatedText = inputElement.value.trim();
        if (updatedText) {
            await fetch(`/api/todos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: updatedText })
            });
        }
        await displayTasks();
    });
}

async function toggleTask(id) {
    await fetch(`/api/todos/${id}`, { method: 'PUT' });
    await displayTasks();
}

async function deleteAllTasks() {
    await fetch('/api/todos', { method: 'DELETE' });
    await displayTasks();
}

const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const addButton = document.querySelector(".btnAdd");
const deleteButton = document.getElementById("deleteAll");
const filterButtons = document.querySelectorAll(".dropdown-content a");
const sortDateButton = document.getElementById("sortDate");

let isSorted = false;
const historyLog = [];
const logElement = document.getElementById("log");
const clearHistoryButton = document.getElementById("clear");


document.addEventListener("DOMContentLoaded", async function () {
    addButton.addEventListener("click", addTask);
    todoInput.addEventListener("keydown", async function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            await addTask();
        }
    });
    deleteButton.addEventListener("click", deleteAllTasks);
    sortDateButton.addEventListener("click", toggleSort);
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
    
    try {
        const response = await fetch('/api/todos');
        console.log("Response status:", response.status); // Log response status

        if (!response.ok) {
            // Log the response text for debugging
            const errorText = await response.text();
            console.error("Error fetching todos:", errorText);
            throw new Error(`Failed to fetch todos: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Fetch failed:", err.message);
        throw err;
    }
    
    // const response = await fetch('/api/todos');
    // return await response.json();
}

async function addTask() {
    const newTask = todoInput.value.trim();
    let todoDate = document.getElementById("todoDate").value.trim();
    if (todoDate) {
        todoDate = new Date(todoDate).toISOString().split("T")[0];
    }
    console.log("Task Data:", { text: newTask, date: todoDate }); // Log data to check

    if (newTask !== "") {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newTask, date: todoDate || null })
        });

        if (response.ok) {
            const createdTask = await response.json(); 
            addTaskToDOM(createdTask); 
            logAction(`Added task: "${newTask}"${todoDate ? ` with deadline ${todoDate}` : ""}`);
            todoInput.value = "";
            document.getElementById("todoDate").value = "";
        }
    }
}

function addTaskToDOM(task) {
    const formattedDate = task.deadline
        ? new Date(task.deadline).toISOString().split("T")[0]
        : "No Deadline";

    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <div class="todo-container">
            <input type="checkbox" class="todo-checkbox" id="input-${task.id}" ${
        task.disabled ? "checked" : ""
    }>
            <p id="todo-${task.id}" class="${
        task.disabled ? "disabled" : ""
    }" onclick="editTask(${task.id})">${task.text}</p>
            <span class="todo-date">${formattedDate}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">&times;</button>
        </div>
    `;

    listItem.querySelector(".todo-checkbox").addEventListener("change", () =>
        toggleTask(task.id)
    );

    todoList.appendChild(listItem);
    todoCount.textContent = parseInt(todoCount.textContent) + 1;
}

async function displayTasks(filter="all") {
    const todos = await fetchTodos(); 
    todoList.innerHTML = ""; 
    let filteredTodos = todos.filter(todo => {
        if (filter === "pending") return !todo.disabled; 
        if (filter === "completed") return todo.disabled; 
        if (filter === "overdue") {
            const today = new Date();
            const deadline = todo.deadline ? new Date(todo.deadline) : null;
            return !todo.disabled && deadline && deadline < today; 
        }
        return true; 
    });
    if (isSorted) {
        filteredTodos = filteredTodos.sort((a, b) => {
            const dateA = a.deadline ? new Date(a.deadline) : new Date("9999-12-31");
            const dateB = b.deadline ? new Date(b.deadline) : new Date("9999-12-31");
            return dateA - dateB;
        });
    }
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
                : `<span class="todo-date"> No Deadline </span>` 
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
    const taskText = document.getElementById(`todo-${id}`).textContent;
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    logAction(`Deleted task: "${taskText}"`);

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
        if (updatedText!== existingText) {
            await fetch(`/api/todos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: updatedText })
            });
        }
        logAction(`Edited task from "${existingText}" to "${updatedText}"`);
        await displayTasks();
    });
}

async function toggleTask(id) {
    const taskText = document.getElementById(`todo-${id}`).textContent;
    const isCompleted = document.getElementById(`input-${id}`).checked;
    await fetch(`/api/todos/${id}`, { method: 'PUT' });
    logAction(`${isCompleted ? "Completed" : "Reopened"} task: "${taskText}"`);
    await displayTasks();
}

async function deleteAllTasks() {
    await fetch('/api/todos', { method: 'DELETE' });
    logAction("Deleted all tasks");

    await displayTasks();
}


function toggleSort() {
    isSorted = !isSorted;
    sortDateButton.textContent = isSorted ? "Unsort Date" : "Sort Date";
    displayTasks(); 
}


function logAction(action) {
    const timestamp = new Date().toLocaleString();
    historyLog.push(`[${timestamp}] ${action}`);
    updateHistoryUI();
}

function updateHistoryUI() {
    logElement.innerHTML = "";
    historyLog.forEach(entry => {
        const logItem = document.createElement("li");
        logItem.textContent = entry;
        logElement.appendChild(logItem);
    });
}

clearHistoryButton.addEventListener("click", () => {
    historyLog.length = 0;
    logAction("Cleared history");
    updateHistoryUI();
});

updateHistoryUI();

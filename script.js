// To-Do List Application with Local Storage

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');

let tasks = [];
let currentFilter = 'all';

// Initialize the app
function init() {
    loadTasksFromStorage();
    renderTasks();
    updateStats();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        taskInput.focus();
        return;
    }

    if (taskText.length > 100) {
        alert('Task must be less than 100 characters!');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    tasks.push(newTask);
    taskInput.value = '';
    taskInput.focus();

    saveTasksToStorage();
    renderTasks();
    updateStats();
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasksToStorage();
    renderTasks();
    updateStats();
}

// Clear completed tasks
function clearCompleted() {
    if (tasks.some((t) => t.completed)) {
        if (confirm('Delete all completed tasks?')) {
            tasks = tasks.filter((t) => !t.completed);
            saveTasksToStorage();
            renderTasks();
            updateStats();
        }
    } else {
        alert('No completed tasks to clear!');
    }
}

// Clear all tasks
function clearAll() {
    if (tasks.length > 0) {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            tasks = [];
            saveTasksToStorage();
            renderTasks();
            updateStats();
        }
    } else {
        alert('No tasks to clear!');
    }
}

// Filter tasks based on current filter
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter((t) => !t.completed);
        case 'completed':
            return tasks.filter((t) => t.completed);
        default:
            return tasks;
    }
}

// Render tasks to the DOM
function renderTasks() {
    taskList.innerHTML = '';
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="task-date">${task.createdAt}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const remaining = total - completed;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('remainingTasks').textContent = remaining;
}

// Save tasks to local storage
function saveTasksToStorage() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to local storage:', error);
        alert('Could not save tasks. Storage may be full.');
    }
}

// Load tasks from local storage
function loadTasksFromStorage() {
    try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
    } catch (error) {
        console.error('Error loading tasks from local storage:', error);
        tasks = [];
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);

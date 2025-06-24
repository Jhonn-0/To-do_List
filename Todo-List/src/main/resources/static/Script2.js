document.addEventListener('DOMContentLoaded', () => {
    // === 🔗 Seletores ===
    const todoInput = document.querySelector('.add-todo-input');
    const addTodoButton = document.querySelector('.add-todo-button');
    const todoListSection = document.querySelector('.todo-list-section');
    const todoCount = document.getElementById('todoCount');
    const calendarGrid = document.querySelector('.calendar-grid');
    const calendarHeaderMonth = document.querySelector('.calendar-header span');
    const greetingText = document.querySelector('.greeting-text');
    const greetingIcon = document.querySelector('.greeting-icon');

    // Modal de edição
    const editModal = document.getElementById('editModal');
    const editModalOverlay = document.getElementById('editModalOverlay');
    const editTaskName = document.getElementById('editTaskName');
    const editTaskDate = document.getElementById('editTaskDate');
    const editTaskPriority = document.getElementById('editTaskPriority');
    const editTaskTag = document.getElementById('editTaskTag');
    const saveEditButton = document.getElementById('saveEditButton');
    const cancelEditButton = document.getElementById('cancelEditButton');

    const sidebarItems = document.querySelectorAll('.sidebar-list li');

    const API_URL = 'http://localhost:8081/tasks';
    let currentCategory = 'life';

    let currentEditingCard = null;

    // === 🔥 API ===
    async function fetchTasks(category = null) {
        let url = API_URL;
        if (category) url += `?category=${category}`;
        const res = await fetch(url);
        return await res.json();
    }

    async function createTaskAPI(title, category, date = null, priority = 'media') {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, completed: false, category, date, priority })
        });
        return await res.json();
    }

    async function updateTaskAPI(id, title, completed, date, priority, category) {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, title, completed, date, priority, category })
        });
        return await res.json();
    }

    async function deleteTaskAPI(id) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    }

    async function deleteAllTasksAPI() {
        const tasks = await fetchTasks(currentCategory);
        await Promise.all(tasks.map(task => deleteTaskAPI(task.id)));
    }

    // === 🧠 Utilitários ===
 function adjustDateForTimezone(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
}

function formatDate(date) {
    if (!date) return 'Sem data';
    const d = adjustDateForTimezone(date);
    return d.toLocaleDateString('pt-BR');
}

function formatDateInput(date) {
    const d = adjustDateForTimezone(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


    function updateCount() {
        const total = document.querySelectorAll('.todo-card').length;
        todoCount.textContent = total;
    }

    // === 🎨 UI ===
    function createTodoCard(task) {
    const todoCard = document.createElement('div');
    todoCard.classList.add('todo-card');
    if (task.completed) todoCard.classList.add('completed');
    todoCard.dataset.id = task.id;

    // 🟩 Adiciona classe com base na prioridade
    if (task.priority) {
        todoCard.classList.add(task.priority.toLowerCase());
    }

    const todoId = '_' + Math.random().toString(36).substr(2, 9);

    todoCard.innerHTML = `
        <div class="checkbox-wrapper">
            <input type="checkbox" id="todo-${todoId}" class="todo-checkbox" ${task.completed ? 'checked' : ''}>
            <label for="todo-${todoId}" class="custom-checkbox"></label>
        </div>
        <div class="todo-details">
            <span class="todo-date">${task.date ? formatDate(task.date) : 'Sem data'}</span>
            <p class="todo-text">${task.title}</p>
            <span class="todo-tag">#${task.category || 'geral'}</span>
            <span class="todo-priority">${task.priority || 'média'}</span>
        </div>
        <div class="todo-actions">
            <i class="fas fa-pen edit-icon" title="Editar Tarefa"></i>
            <i class="fas fa-trash-alt delete-icon" title="Excluir Tarefa"></i>
        </div>
    `;

    // === Checkbox, Delete e Edit (mantém igual) ===
    const checkbox = todoCard.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', async () => {
        todoCard.classList.toggle('completed', checkbox.checked);
        const taskId = todoCard.dataset.id;
        const title = todoCard.querySelector('.todo-text').textContent;
        const date = todoCard.querySelector('.todo-date').textContent !== 'Sem data' ? 
            formatDateInput(todoCard.querySelector('.todo-date').textContent) : null;
        const priority = todoCard.querySelector('.todo-priority').textContent;
        const tag = todoCard.querySelector('.todo-tag').textContent.replace('#', '');

        await updateTaskAPI(taskId, title, checkbox.checked, date, priority, tag);
        updateCount();
    });

    const deleteButton = todoCard.querySelector('.delete-icon');
    deleteButton.addEventListener('click', async () => {
        await deleteTaskAPI(task.id);
        todoCard.remove();
        updateCount();
    });

    const editButton = todoCard.querySelector('.edit-icon');
    editButton.addEventListener('click', () => {
        openEditModal(todoCard);
    });

    return todoCard;
}


    async function loadTasks() {
        const tasks = await fetchTasks(currentCategory);
        todoListSection.innerHTML = '';
        tasks.forEach(task => {
            const todoCard = createTodoCard(task);
            todoListSection.appendChild(todoCard);
        });
        updateCount();
    }

    async function addTodo() {
        const todoText = todoInput.value.trim();
        if (todoText === '') return;

        const task = await createTaskAPI(todoText, currentCategory);
        const todoCard = createTodoCard(task);

        todoCard.style.opacity = '0';
        todoCard.style.transform = 'translateY(10px)';
        todoListSection.prepend(todoCard);

        setTimeout(() => {
            todoCard.style.opacity = '1';
            todoCard.style.transform = 'translateY(0)';
        }, 50);

        todoInput.value = '';
        updateCount();
    }

    async function deleteAllTasks() {
        await deleteAllTasksAPI();
        todoListSection.innerHTML = '';
        updateCount();
    }

    // === ✨ Modal ===
    function openEditModal(card) {
        currentEditingCard = card;
        const text = card.querySelector('.todo-text').textContent;
        const tag = card.querySelector('.todo-tag').textContent.replace('#', '');
        const date = card.querySelector('.todo-date').textContent;
        const priority = card.querySelector('.todo-priority') ? card.querySelector('.todo-priority').textContent : 'media';

        editTaskName.value = text;
        editTaskTag.value = tag;
        editTaskDate.value = date !== 'Sem data' ? formatDateInput(date) : '';
        editTaskPriority.value = priority;

        editModal.style.display = 'block';
        editModalOverlay.style.display = 'block';
    }

    function closeEditModal() {
        editModal.style.display = 'none';
        editModalOverlay.style.display = 'none';
        currentEditingCard = null;
    }

    saveEditButton.addEventListener('click', async () => {
        if (!currentEditingCard) return;

        const newName = editTaskName.value.trim();
        const newTag = editTaskTag.value.trim();
        const newDate = editTaskDate.value;
        const newPriority = editTaskPriority.value;

        if (newName === '') {
            alert('O nome da tarefa não pode estar vazio!');
            return;
        }

        const taskId = currentEditingCard.dataset.id;
        const completed = currentEditingCard.classList.contains('completed');

        await updateTaskAPI(taskId, newName, completed, newDate, newPriority, newTag);

        currentEditingCard.querySelector('.todo-text').textContent = newName;
        currentEditingCard.querySelector('.todo-tag').textContent = `#${newTag || 'geral'}`;
        currentEditingCard.querySelector('.todo-date').textContent = newDate ? formatDate(new Date(newDate)) : 'Sem data';

        if (currentEditingCard.querySelector('.todo-priority')) {
            currentEditingCard.querySelector('.todo-priority').textContent = newPriority;
        } else {
            const prioritySpan = document.createElement('span');
            prioritySpan.classList.add('todo-priority');
            prioritySpan.textContent = newPriority;
            currentEditingCard.querySelector('.todo-details').appendChild(prioritySpan);
        }

        closeEditModal();
        loadTasks();
    });

    cancelEditButton.addEventListener('click', closeEditModal);
    editModalOverlay.addEventListener('click', closeEditModal);

    // === 🗓️ Calendário ===
    const now = new Date();
    let currentMonth = now.getMonth();
    let currentYear = now.getFullYear();

    const renderCalendar = (month, year) => {
        calendarGrid.innerHTML = '';
        const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        dayNames.forEach(name => {
            const span = document.createElement('span');
            span.classList.add('day-name');
            span.textContent = name;
            calendarGrid.appendChild(span);
        });

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = firstDayOfMonth.getDay();

        for (let i = 0; i < startDay; i++) {
            const span = document.createElement('span');
            span.classList.add('day', 'empty');
            calendarGrid.appendChild(span);
        }

        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const span = document.createElement('span');
            span.classList.add('day');
            span.textContent = day;

            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                span.classList.add('today');
            }

            calendarGrid.appendChild(span);
        }

        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        calendarHeaderMonth.textContent = `${monthNames[month]} ${year}`;
    };

    renderCalendar(currentMonth, currentYear);
    markCalendarTasks(currentMonth, currentYear);


    document.querySelector('.calendar-header .fa-chevron-left').addEventListener('click', async () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
    await markCalendarTasks(currentMonth, currentYear);
    loadTasks();
});

document.querySelector('.calendar-header .fa-chevron-right').addEventListener('click', async () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
    await markCalendarTasks(currentMonth, currentYear);
    loadTasks();
});


async function markCalendarTasks(month, year) {
    const tasks = await fetchTasks();
    const dayElements = calendarGrid.querySelectorAll('.day:not(.empty)');

    dayElements.forEach(dayEl => {
        const day = parseInt(dayEl.textContent);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const hasTask = tasks.some(task => {
            if (!task.date) return false;

            const taskDate = new Date(task.date);
            const taskDateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;

            return taskDateStr === dateStr;
        });

        if (hasTask) {
            dayEl.classList.add('has-todo');
        }
    });
}




    // === 🔥 Sidebar ===
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            if (item.classList.contains('list-Life')) {
                currentCategory = 'life';
            } else if (item.classList.contains('list-Work')) {
                currentCategory = 'work';
            } else {
                currentCategory = 'geral';
            }

            loadTasks();
        });
    });

    // === 🌅 Saudação ===
    const updateGreeting = () => {
        const hours = new Date().getHours();
        let greeting = "Boa Noite!";
        let iconClass = "fas fa-moon";

        if (hours >= 5 && hours < 12) {
            greeting = "Bom Dia!";
            iconClass = "fas fa-sun";
        } else if (hours >= 12 && hours < 18) {
            greeting = "Boa Tarde!";
            iconClass = "fas fa-cloud-sun";
        }

        if (greetingText && greetingIcon) {
            greetingText.textContent = greeting;
            greetingIcon.className = `${iconClass} greeting-icon`;
        }
    };

document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
});

    // === 📦 Event Listeners ===
    addTodoButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    document.getElementById('deleteButton').addEventListener('click', deleteAllTasks);
function updateCount() {
    const total = document.querySelectorAll('.todo-card').length;
    const countElement = document.getElementById('todoCount');
    if (countElement) {
        countElement.textContent = total;
    }
}

    // === 🚀 Carregar tarefas ===
    loadTasks();
});

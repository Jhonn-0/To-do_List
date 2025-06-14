// Carregar tarefas
async function loadTasks() {
    const response = await fetch('/tasks');
    const tasks = await response.json();

    const list = document.getElementById('todoList');
    list.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');

        const taskContainer = document.createElement('p');
        taskContainer.textContent = task.title;
        if (task.completed) taskContainer.classList.add('disabled');

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;

        checkbox.addEventListener('change', async () => {
            taskContainer.classList.toggle('disabled');
            await fetch('/tasks/' + task.id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: checkbox.checked })
            });
            updateCount();
        });

        // Botão deletar individual
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete');
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        // Montar item
        taskContainer.prepend(checkbox);
        taskContainer.appendChild(deleteBtn);
        li.appendChild(taskContainer);
        list.appendChild(li);
    });

    updateCount();
}

// Criar nova tarefa
async function createTask() {
    const input = document.getElementById('todoInput');
    const title = input.value.trim();

    if (title === '') {
        alert('Digite uma tarefa!');
        return;
    }

    await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, completed: false })
    });

    input.value = '';
    loadTasks();
}

// Deletar tarefa individual
async function deleteTask(id) {
    await fetch('/tasks/' + id, { method: 'DELETE' });
    loadTasks();
}

// Deletar todas as tarefas
async function deleteAllTasks() {
    const response = await fetch('/tasks');
    const tasks = await response.json();

    await Promise.all(
        tasks.map(task => fetch('/tasks/' + task.id, { method: 'DELETE' }))
    );

    loadTasks();
}

// Atualizar contador de tarefas
function updateCount() {
    const total = document.querySelectorAll('#todoList li').length;
    document.getElementById('todoCount').textContent = total;
}

//  Eventos dos botões
document.querySelector('.btn').addEventListener('click', createTask);
document.getElementById('deleteButton').addEventListener('click', deleteAllTasks);

//  Evento Enter no input (corrigido)
document.getElementById('todoInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        createTask();
    }
});

//  Carregar tarefas ao abrir
loadTasks();

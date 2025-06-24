package com.todo_list.Todo_List.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.todo_list.Todo_List.model.Task;
import com.todo_list.Todo_List.repository.TaskRepository;

@Service
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public List<Task> findAll() {
        return repository.findAll();
    }

    public List<Task> findByCategory(String category) {
        return repository.findByCategory(category);
    }

    public Optional<Task> findById(Long id) {
        return repository.findById(id);
    }

    public Task save(Task task) {
        return repository.save(task);
    }

   public Task update(Long id, Task updatedTask) {
    return repository.findById(id).map(task -> {
        task.setTitle(updatedTask.getTitle());
        task.setCompleted(updatedTask.getCompleted()); // <== aqui
        task.setCategory(updatedTask.getCategory());
        task.setDate(updatedTask.getDate());
        task.setPriority(updatedTask.getPriority());
        return repository.save(task);
    }).orElseThrow(() -> new RuntimeException("Task not found"));
}




    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Task not found with id: " + id);
        }
        repository.deleteById(id);
    }
}

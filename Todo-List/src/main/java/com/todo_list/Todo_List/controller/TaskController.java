package com.todo_list.Todo_List.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.todo_list.Todo_List.model.Task;
import com.todo_list.Todo_List.service.TaskService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    public List<Task> getAll(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return service.findByCategory(category);
        } else {
            return service.findAll();
        }
    }

    @PostMapping
    public Task create(@RequestBody Task task) {
        return service.save(task);
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable Long id, @RequestBody Task updatedTask) {
        return service.update(id, updatedTask);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

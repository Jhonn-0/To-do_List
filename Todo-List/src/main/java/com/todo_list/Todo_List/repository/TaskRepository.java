package com.todo_list.Todo_List.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.todo_list.Todo_List.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCategory(String category);
}

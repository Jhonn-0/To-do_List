/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.todo_list.Todo_List.repository;

import com.todo_list.Todo_List.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 *
 * @author AdminAmor
 */
public interface TaskRepository extends JpaRepository<Task, Long> {
}


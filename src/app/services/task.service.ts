import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { Task } from '../shared/models/task.model';

@Injectable({
	providedIn: 'root',
})
export class TaskService {
	private mockTasks: Task[] = [
		{
			id: '1',
			title: 'Complete project documentation',
			description: 'Write detailed documentation for the NGXS project',
			completed: false,
			priority: 'high',
			assignedTo: '1',
			dueDate: new Date('2025-04-20'),
			createdAt: new Date('2025-04-05'),
			updatedAt: new Date('2025-04-05'),
		},
		{
			id: '2',
			title: 'Fix navigation bug',
			description: 'Investigate and fix the navigation issue in the admin panel',
			completed: true,
			priority: 'medium',
			assignedTo: '2',
			dueDate: new Date('2025-04-12'),
			createdAt: new Date('2025-04-03'),
			updatedAt: new Date('2025-04-10'),
		},
		{
			id: '3',
			title: 'Implement new dashboard features',
			description: 'Add new charts and analytics features to the dashboard',
			completed: false,
			priority: 'high',
			assignedTo: '1',
			dueDate: new Date('2025-04-30'),
			createdAt: new Date('2025-04-05'),
			updatedAt: new Date('2025-04-05'),
		},
		{
			id: '4',
			title: 'Review pull requests',
			description: 'Review pending pull requests from the team',
			completed: false,
			priority: 'low',
			assignedTo: '3',
			dueDate: new Date('2025-04-15'),
			createdAt: new Date('2025-04-08'),
			updatedAt: new Date('2025-04-08'),
		},
		{
			id: '5',
			title: 'Update dependencies',
			description: 'Update all project dependencies to the latest versions',
			completed: false,
			priority: 'medium',
			assignedTo: null,
			dueDate: null,
			createdAt: new Date('2025-04-10'),
			updatedAt: new Date('2025-04-10'),
		},
	];

	getAllTasks(): Observable<Task[]> {
		return of(this.mockTasks).pipe(delay(500));
	}

	getTasksByUserId(userId: string): Observable<Task[]> {
		const userTasks = this.mockTasks.filter(task => task.assignedTo === userId);
		return of(userTasks).pipe(delay(300));
	}

	getTaskById(id: string): Observable<Task> {
		const task = this.mockTasks.find(t => t.id === id);

		if (task) {
			return of(task).pipe(delay(300));
		}

		return throwError(() => new Error('Task not found'));
	}

	createTask(taskData: Partial<Task>): Observable<Task> {
		const now = new Date();

		const newTask: Task = {
			id: Math.random().toString(36).substr(2, 9),
			title: taskData.title!,
			description: taskData.description || '',
			completed: taskData.completed || false,
			priority: taskData.priority || 'medium',
			assignedTo: taskData.assignedTo || null,
			dueDate: taskData.dueDate || null,
			createdAt: now,
			updatedAt: now,
		};

		this.mockTasks.push(newTask);
		return of(newTask).pipe(delay(500));
	}

	updateTask(id: string, changes: Partial<Task>): Observable<Task> {
		const index = this.mockTasks.findIndex(t => t.id === id);

		if (index !== -1) {
			const updatedTask = {
				...this.mockTasks[index],
				...changes,
				updatedAt: new Date(),
			};

			this.mockTasks[index] = updatedTask;
			return of(updatedTask).pipe(delay(500));
		}

		return throwError(() => new Error('Task not found'));
	}

	deleteTask(id: string): Observable<boolean> {
		const index = this.mockTasks.findIndex(t => t.id === id);

		if (index !== -1) {
			this.mockTasks.splice(index, 1);
			return of(true).pipe(delay(500));
		}

		return throwError(() => new Error('Task not found'));
	}

	assignTask(taskId: string, userId: string): Observable<Task> {
		return this.updateTask(taskId, { assignedTo: userId });
	}

	unassignTask(taskId: string): Observable<Task> {
		return this.updateTask(taskId, { assignedTo: null });
	}
}

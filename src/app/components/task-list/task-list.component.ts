import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { select, Store } from '@ngxs/store';

import { Task } from '../../shared/models/task.model';

import { TaskActions, TaskState } from '../../store/states/task.state';
import { UserState } from '../../store/states/user.state';

@Component({
	selector: 'app-task-list',
	templateUrl: './task-list.component.html',
	imports: [FormsModule, DatePipe],
})
export class TaskListComponent implements OnInit {
	public tasks = select(TaskState.getTasks);
	public loading = select(TaskState.getLoading);
	public error = select(TaskState.getError);
	public users = select(UserState.getUsers);

	public showCompletedTasks = true;
	public priorityFilter: 'low' | 'medium' | 'high' | null = null;
	public newTask: Partial<Task> = {
		title: '',
		description: '',
		priority: 'medium',
		completed: false,
		assignedTo: null,
		dueDate: null,
	};
	public showNewTaskForm = false;

	constructor(private store: Store) {}

	public ngOnInit() {
		this.fetchTasks();
	}

	public fetchTasks() {
		this.store.dispatch(new TaskActions.FetchTasks());
	}

	public toggleNewTaskForm() {
		this.showNewTaskForm = !this.showNewTaskForm;

		if (!this.showNewTaskForm) {
			this.resetNewTaskForm();
		}
	}

	public resetNewTaskForm() {
		this.newTask = {
			title: '',
			description: '',
			priority: 'medium',
			completed: false,
			assignedTo: null,
			dueDate: null,
		};
	}

	public addTask() {
		if (this.newTask.title) {
			this.store.dispatch(new TaskActions.AddTask(this.newTask));
			this.resetNewTaskForm();
			this.showNewTaskForm = false;
		}
	}

	public toggleTaskCompletion(task: Task) {
		this.store.dispatch(new TaskActions.UpdateTask({ id: task.id, changes: { completed: !task.completed } }));
	}

	public updateTaskPriority(task: Task, priority: 'low' | 'medium' | 'high') {
		this.store.dispatch(new TaskActions.SetTaskPriority({ taskId: task.id, priority }));
	}

	public assignTaskToUser(task: Task, userId: string | null) {
		if (userId) {
			this.store.dispatch(new TaskActions.AssignTask({ taskId: task.id, userId }));
		} else {
			this.store.dispatch(new TaskActions.UnassignTask(task.id));
		}
	}

	public deleteTask(taskId: string) {
		if (confirm('Are you sure you want to delete this task?')) {
			this.store.dispatch(new TaskActions.DeleteTask(taskId));
		}
	}

	public filterByPriority(priority: 'low' | 'medium' | 'high' | null) {
		this.priorityFilter = priority;
	}

	public toggleShowCompleted() {
		this.showCompletedTasks = !this.showCompletedTasks;
	}

	getFilteredTasks(): Task[] {
		let tasks = this.store.selectSnapshot(TaskState.getTasks);

		if (!this.showCompletedTasks) {
			tasks = tasks.filter(task => !task.completed);
		}

		if (this.priorityFilter) {
			tasks = tasks.filter(task => task.priority === this.priorityFilter);
		}

		return tasks;
	}

	getUserName(userId: string | null): string {
		if (!userId) return 'Unassigned';

		const users = this.store.selectSnapshot(UserState.getUsers);
		const user = users.find(u => u.id === userId);
		return user ? user.name : 'Unknown User';
	}
}

import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { select, Store } from '@ngxs/store';

import { Task } from '../../shared/models/task.model';

import { TaskActions, TaskState } from '../../store/states/task.state';
import { UserActions, UserState } from '../../store/states/user.state';

interface TaskPriority {
	name: string;
	value: number;
}

interface TaskSummary {
	total: number;
	completed: number;
	pending: number;
	highPriority: number;
	mediumPriority: number;
	lowPriority: number;
}

interface UserSummary {
	total: number;
	active: number;
	inactive: number;
	admins: number;
	users: number;
	guests: number;
}

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	imports: [DatePipe],
})
export class DashboardComponent implements OnInit {
	public users = select(UserState.getUsers);
	public tasks = select(TaskState.getTasks);

	public taskSummary!: TaskSummary;
	public userSummary!: UserSummary;
	public tasksByPriority: TaskPriority[] = [];
	public recentTasks: Task[] = [];
	public highPriorityTasks: Task[] = [];

	constructor(private store: Store) {}

	public ngOnInit() {
		this.store.dispatch(new UserActions.FetchUsers());
		this.store.dispatch(new TaskActions.FetchTasks());

		this.initializeDashboardData();
	}

	public initializeDashboardData() {
		// Create task summary data
		this.taskSummary = {
			total: this.tasks().length,
			completed: this.tasks().filter(t => t.completed).length,
			pending: this.tasks().filter(t => !t.completed).length,
			highPriority: this.tasks().filter(t => t.priority === 'high').length,
			mediumPriority: this.tasks().filter(t => t.priority === 'medium').length,
			lowPriority: this.tasks().filter(t => t.priority === 'low').length,
		};

		// Create user summary data
		this.userSummary = {
			total: this.users().length,
			active: this.users().filter(u => u.isActive).length,
			inactive: this.users().filter(u => !u.isActive).length,
			admins: this.users().filter(u => u.role === 'admin').length,
			users: this.users().filter(u => u.role === 'user').length,
			guests: this.users().filter(u => u.role === 'guest').length,
		};

		// Tasks by priority for chart
		this.tasksByPriority = [
			{ name: 'High', value: this.tasks().filter(t => t.priority === 'high').length },
			{ name: 'Medium', value: this.tasks().filter(t => t.priority === 'medium').length },
			{ name: 'Low', value: this.tasks().filter(t => t.priority === 'low').length },
		];

		// Recent tasks (last 5)
		this.recentTasks = [...this.tasks()]
			.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
			.slice(0, 5);

		// High priority pending tasks
		this.highPriorityTasks = this.tasks().filter(t => t.priority === 'high' && !t.completed);
	}

	public getUserName(userId: string | null): string {
		if (!userId) return 'Unassigned';

		const users = this.store.selectSnapshot(UserState.getUsers);
		const user = users.find(u => u.id === userId);
		return user ? user.name : 'Unknown User';
	}
}

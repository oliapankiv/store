export interface Task {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	priority: 'low' | 'medium' | 'high';
	assignedTo: string | null;
	dueDate: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface TaskStateModel {
	tasks: Task[];
	loading: boolean;
	error: string | null;
	filters: {
		assignedTo: string | null;
		completed: boolean | null;
		priority: 'low' | 'medium' | 'high' | null;
	};
}

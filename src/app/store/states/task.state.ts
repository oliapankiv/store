import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { TaskService } from '../../services/task.service';

import { Task, TaskStateModel } from '../../shared/models/task.model';

export namespace TaskActions {
	export class FetchTasks {
		static readonly type = '[Task] Fetch Tasks';
	}

	export class FetchTasksByUserId {
		static readonly type = '[Task] Fetch Tasks By User Id';
		constructor(public payload: string) {}
	}

	export class AddTask {
		static readonly type = '[Task] Add Task';
		constructor(public payload: Partial<Task>) {}
	}

	export class UpdateTask {
		static readonly type = '[Task] Update Task';
		constructor(public payload: { id: string; changes: Partial<Task> }) {}
	}

	export class DeleteTask {
		static readonly type = '[Task] Delete Task';
		constructor(public payload: string) {}
	}

	export class AssignTask {
		static readonly type = '[Task] Assign Task';
		constructor(public payload: { taskId: string; userId: string }) {}
	}

	export class UnassignTask {
		static readonly type = '[Task] Unassign Task';
		constructor(public payload: string) {}
	}

	export class SetTaskPriority {
		static readonly type = '[Task] Set Task Priority';
		constructor(public payload: { taskId: string; priority: 'low' | 'medium' | 'high' }) {}
	}
}

@State<TaskStateModel>({
	name: 'tasks',
	defaults: {
		tasks: [],
		loading: false,
		error: null,
		filters: {
			assignedTo: null,
			completed: null,
			priority: null,
		},
	},
})
@Injectable()
export class TaskState {
	constructor(private taskService: TaskService) {}

	@Selector()
	static getTasks(state: TaskStateModel): Task[] {
		return state.tasks;
	}

	@Selector()
	static getLoading(state: TaskStateModel): boolean {
		return state.loading;
	}

	@Selector()
	static getError(state: TaskStateModel): string | null {
		return state.error;
	}

	@Selector()
	static getTasksByAssignee(state: TaskStateModel) {
		return (userId: string) => {
			return state.tasks.filter(task => task.assignedTo === userId);
		};
	}

	@Selector()
	static getCompletedTasks(state: TaskStateModel): Task[] {
		return state.tasks.filter(task => task.completed);
	}

	@Selector()
	static getPendingTasks(state: TaskStateModel): Task[] {
		return state.tasks.filter(task => !task.completed);
	}

	@Selector()
	static getTasksByPriority(state: TaskStateModel) {
		return (priority: 'low' | 'medium' | 'high') => {
			return state.tasks.filter(task => task.priority === priority);
		};
	}

	@Selector()
	static getFilteredTasks(state: TaskStateModel): Task[] {
		const { assignedTo, completed, priority } = state.filters;

		return state.tasks.filter(task => {
			const matchesAssignee = assignedTo !== null ? task.assignedTo === assignedTo : true;
			const matchesCompleted = completed !== null ? task.completed === completed : true;
			const matchesPriority = priority !== null ? task.priority === priority : true;

			return matchesAssignee && matchesCompleted && matchesPriority;
		});
	}

	@Action(TaskActions.FetchTasks)
	fetchTasks(ctx: StateContext<TaskStateModel>) {
		ctx.patchState({ loading: true, error: null });

		return this.taskService.getAllTasks().pipe(
			tap(tasks => ctx.patchState({ tasks, loading: false })),
			catchError(error => {
				ctx.patchState({ loading: false, error: error.message });

				return throwError(() => error);
			})
		);
	}

	@Action(TaskActions.FetchTasksByUserId)
	fetchTasksByUserId(ctx: StateContext<TaskStateModel>, action: TaskActions.FetchTasksByUserId) {
		ctx.patchState({ loading: true, error: null });

		return this.taskService.getTasksByUserId(action.payload).pipe(
			tap(tasks => {
				ctx.patchState({
					tasks,
					loading: false,
					filters: { ...ctx.getState().filters, assignedTo: action.payload },
				});
			}),
			catchError(error => {
				ctx.patchState({ loading: false, error: error.message });

				return throwError(() => error);
			})
		);
	}

	@Action(TaskActions.AddTask)
	addTask(ctx: StateContext<TaskStateModel>, action: TaskActions.AddTask) {
		ctx.patchState({ loading: true, error: null });

		return this.taskService.createTask(action.payload).pipe(
			tap(newTask => {
				const state = ctx.getState();

				ctx.patchState({ tasks: [...state.tasks, newTask], loading: false });
			}),
			catchError(error => {
				ctx.patchState({ loading: false, error: error.message });

				return throwError(() => error);
			})
		);
	}

	@Action(TaskActions.UpdateTask)
	updateTask(ctx: StateContext<TaskStateModel>, action: TaskActions.UpdateTask) {
		ctx.patchState({ loading: true, error: null });

		return this.taskService.updateTask(action.payload.id, action.payload.changes).pipe(
			tap(updatedTask => {
				const state = ctx.getState();
				const tasks = state.tasks.map(task => (task.id === updatedTask.id ? updatedTask : task));

				ctx.patchState({ tasks, loading: false });
			}),
			catchError(error => {
				ctx.patchState({ loading: false, error: error.message });

				return throwError(() => error);
			})
		);
	}

	@Action(TaskActions.DeleteTask)
	deleteTask(ctx: StateContext<TaskStateModel>, action: TaskActions.DeleteTask) {
		ctx.patchState({ loading: true, error: null });

		return this.taskService.deleteTask(action.payload).pipe(
			tap(() => {
				const state = ctx.getState();
				const tasks = state.tasks.filter(task => task.id !== action.payload);

				ctx.patchState({ tasks, loading: false });
			}),
			catchError(error => {
				ctx.patchState({ loading: false, error: error.message });

				return throwError(() => error);
			})
		);
	}

	@Action(TaskActions.AssignTask)
	assignTask(ctx: StateContext<TaskStateModel>, action: TaskActions.AssignTask) {
		const { taskId, userId } = action.payload;
		ctx.patchState({ loading: true, error: null });

		return this.taskService.assignTask(taskId, userId).pipe(
			tap(updatedTask => {
				const state = ctx.getState();
				const tasks = state.tasks.map(task => (task.id === updatedTask.id ? updatedTask : task));

				ctx.patchState({ tasks, loading: false });
			}),
			catchError(error => {
				ctx.patchState({ loading: false, error: error.message });

				return throwError(() => error);
			})
		);
	}

	@Action(TaskActions.UnassignTask)
	unassignTask(ctx: StateContext<TaskStateModel>, action: TaskActions.UnassignTask) {
		ctx.patchState({ loading: true, error: null });

		return this.taskService.unassignTask(action.payload).pipe(
			tap(updatedTask => {
				const state = ctx.getState();
				const tasks = state.tasks.map(task => (task.id === updatedTask.id ? updatedTask : task));

				ctx.patchState({ tasks, loading: false });
			}),
			catchError(error => {
				ctx.patchState({ loading: false, error: error.message });

				return throwError(() => error);
			})
		);
	}

	@Action(TaskActions.SetTaskPriority)
	setTaskPriority(ctx: StateContext<TaskStateModel>, action: TaskActions.SetTaskPriority) {
		const { taskId, priority } = action.payload;
		ctx.patchState({ loading: true, error: null });

		return this.taskService.updateTask(taskId, { priority }).pipe(
			tap(updatedTask => {
				const state = ctx.getState();
				const tasks = state.tasks.map(task => (task.id === updatedTask.id ? updatedTask : task));

				ctx.patchState({ tasks, loading: false });
			}),
			catchError(error => {
				ctx.patchState({ loading: false, error: error.message });

				return throwError(() => error);
			})
		);
	}
}

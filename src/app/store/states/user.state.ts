import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { UserService } from '../../services/user.service';

import { User, UserStateModel } from '../../shared/models/user.model';

export namespace UserActions {
	export class FetchUsers {
		static readonly type = '[User] Fetch Users';
	}

	export class FetchUserById {
		static readonly type = '[User] Fetch User By Id';
		constructor(public payload: string) {}
	}

	export class UpdateUser {
		static readonly type = '[User] Update User';
		constructor(public payload: { id: string; changes: Partial<User> }) {}
	}

	export class SetSelectedUser {
		static readonly type = '[User] Set Selected User';
		constructor(public payload: string) {}
	}

	export class ClearSelectedUser {
		static readonly type = '[User] Clear Selected User';
	}

	export class SetSearchFilter {
		static readonly type = '[User] Set Search Filter';
		constructor(public payload: string) {}
	}

	export class SetRoleFilter {
		static readonly type = '[User] Set Role Filter';
		constructor(public payload: 'admin' | 'user' | 'guest' | null) {}
	}
}

@State<UserStateModel>({
	name: 'users',
	defaults: {
		users: [],
		selectedUserId: null,
		loading: false,
		error: null,
		filters: {
			searchTerm: '',
			role: null,
		},
	},
})
@Injectable()
export class UserState {
	constructor(private userService: UserService) {}

	@Selector()
	static getUsers(state: UserStateModel): User[] {
		return state.users;
	}

	@Selector()
	static getSelectedUserId(state: UserStateModel): string | null {
		return state.selectedUserId;
	}

	@Selector()
	static getSelectedUser(state: UserStateModel): User | undefined {
		return state.selectedUserId ? state.users.find(user => user.id === state.selectedUserId) : undefined;
	}

	@Selector()
	static getLoading(state: UserStateModel): boolean {
		return state.loading;
	}

	@Selector()
	static getError(state: UserStateModel): string | null {
		return state.error;
	}

	@Selector()
	static getFilters(state: UserStateModel) {
		return state.filters;
	}

	@Selector()
	static getFilteredUsers(state: UserStateModel): User[] {
		const { searchTerm, role } = state.filters;

		return state.users.filter(user => {
			const matchesSearch = searchTerm
				? user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					user.email.toLowerCase().includes(searchTerm.toLowerCase())
				: true;

			const matchesRole = role ? user.role === role : true;

			return matchesSearch && matchesRole;
		});
	}

	@Selector()
	static getActiveUsers(state: UserStateModel): User[] {
		return state.users.filter(user => user.isActive);
	}

	@Selector()
	static getUsersByRole(state: UserStateModel) {
		return (role: 'admin' | 'user' | 'guest') => {
			return state.users.filter(user => user.role === role);
		};
	}

	@Action(UserActions.FetchUsers)
	fetchUsers(ctx: StateContext<UserStateModel>) {
		const state = ctx.getState();
		ctx.patchState({ loading: true, error: null });

		return this.userService.getAllUsers().pipe(
			tap({
				next: users => {
					ctx.patchState({
						users,
						loading: false,
					});
				},
				error: error => {
					ctx.patchState({
						loading: false,
						error: error.message,
					});
				},
			})
		);
	}

	@Action(UserActions.FetchUserById)
	fetchUserById(ctx: StateContext<UserStateModel>, action: UserActions.FetchUserById) {
		const state = ctx.getState();
		ctx.patchState({ loading: true, error: null });

		return this.userService.getUserById(action.payload).pipe(
			tap({
				next: user => {
					const users = [...state.users];
					const index = users.findIndex(u => u.id === user.id);

					if (index !== -1) {
						users[index] = user;
					} else {
						users.push(user);
					}

					ctx.patchState({
						users,
						loading: false,
						selectedUserId: user.id,
					});
				},
				error: error => {
					ctx.patchState({
						loading: false,
						error: error.message,
					});
				},
			})
		);
	}

	@Action(UserActions.UpdateUser)
	updateUser(ctx: StateContext<UserStateModel>, action: UserActions.UpdateUser) {
		const state = ctx.getState();
		ctx.patchState({ loading: true, error: null });

		return this.userService.updateUser(action.payload.id, action.payload.changes).pipe(
			tap({
				next: updatedUser => {
					const users = state.users.map(user => (user.id === updatedUser.id ? updatedUser : user));

					ctx.patchState({
						users,
						loading: false,
					});
				},
				error: error => {
					ctx.patchState({
						loading: false,
						error: error.message,
					});
				},
			})
		);
	}

	@Action(UserActions.SetSelectedUser)
	setSelectedUser(ctx: StateContext<UserStateModel>, action: UserActions.SetSelectedUser) {
		ctx.patchState({
			selectedUserId: action.payload,
		});
	}

	@Action(UserActions.ClearSelectedUser)
	clearSelectedUser(ctx: StateContext<UserStateModel>) {
		ctx.patchState({
			selectedUserId: null,
		});
	}

	@Action(UserActions.SetSearchFilter)
	setSearchFilter(ctx: StateContext<UserStateModel>, action: UserActions.SetSearchFilter) {
		const state = ctx.getState();
		ctx.patchState({
			filters: {
				...state.filters,
				searchTerm: action.payload,
			},
		});
	}

	@Action(UserActions.SetRoleFilter)
	setRoleFilter(ctx: StateContext<UserStateModel>, action: UserActions.SetRoleFilter) {
		const state = ctx.getState();
		ctx.patchState({
			filters: {
				...state.filters,
				role: action.payload,
			},
		});
	}
}

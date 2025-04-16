import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { select, Store } from '@ngxs/store';

import { UserActions, UserState } from '../../store/states/user.state';

@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	imports: [FormsModule, NgClass, DatePipe],
})
export class UserListComponent implements OnInit {
	public users = select(UserState.getFilteredUsers);
	public loading = select(UserState.getLoading);
	public error = select(UserState.getError);

	public searchTerm = '';
	public selectedRole: 'admin' | 'user' | 'guest' | null = null;

	constructor(private store: Store) {}

	public ngOnInit() {
		this.fetchUsers();
	}

	public fetchUsers() {
		this.store.dispatch(new UserActions.FetchUsers());
	}

	public selectUser(userId: string) {
		this.store.dispatch(new UserActions.SetSelectedUser(userId));
	}

	public applySearchFilter() {
		this.store.dispatch(new UserActions.SetSearchFilter(this.searchTerm));
	}

	public applyRoleFilter() {
		this.store.dispatch(new UserActions.SetRoleFilter(this.selectedRole));
	}

	public clearFilters() {
		this.searchTerm = '';
		this.selectedRole = null;
		this.store.dispatch(new UserActions.SetSearchFilter(''));
		this.store.dispatch(new UserActions.SetRoleFilter(null));
	}
}

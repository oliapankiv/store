import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngxs/store';

import { AuthActions, AuthState } from './store/states/auth.state';

@Component({
	standalone: false,
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	public isAuthenticated = select(AuthState.isAuthenticated);
	public currentUser = select(AuthState.getCurrentUser);

	public title = 'NGXS Task Management';

	constructor(
		private store: Store,
		private router: Router
	) {}

	ngOnInit() {
		// Check authentication status on app init
		this.store.dispatch(new AuthActions.CheckAuthStatus());
	}

	logout() {
		this.store.dispatch(new AuthActions.Logout());
		this.router.navigate(['/login']);
	}
}

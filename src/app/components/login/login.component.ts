import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngxs/store';

import { AuthActions, AuthState } from '../../store/states/auth.state';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	imports: [FormsModule],
})
export class LoginComponent {
	public isAuthenticated = select(AuthState.isAuthenticated);
	public loading = select(AuthState.getLoading);
	public loginError = select(AuthState.getLoginError);

	public credentials = { email: '', password: '' };

	constructor(
		private store: Store,
		private router: Router
	) {
		effect(() => this.isAuthenticated() && this.router.navigate(['/dashboard']));
	}

	public login() {
		if (this.credentials.email && this.credentials.password) {
			this.store.dispatch(new AuthActions.ClearLoginError());
			this.store.dispatch(
				new AuthActions.Login({ email: this.credentials.email, password: this.credentials.password })
			);
		}
	}

	public clearError() {
		this.store.dispatch(new AuthActions.ClearLoginError());
	}
}

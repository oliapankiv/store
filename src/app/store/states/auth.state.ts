import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

import { User } from '../../shared/models/user.model';

export namespace AuthActions {
	export class Login {
		static readonly type = '[Auth] Login';
		constructor(public payload: { email: string; password: string }) {}
	}

	export class Logout {
		static readonly type = '[Auth] Logout';
	}

	export class CheckAuthStatus {
		static readonly type = '[Auth] Check Auth Status';
	}

	export class ClearLoginError {
		static readonly type = '[Auth] Clear Login Error';
	}
}

export interface AuthStateModel {
	isAuthenticated: boolean;
	currentUser: User | null;
	token: string | null;
	loading: boolean;
	loginError: string | null;
}

@State<AuthStateModel>({
	name: 'auth',
	defaults: {
		isAuthenticated: false,
		currentUser: null,
		token: null,
		loading: false,
		loginError: null,
	},
})
@Injectable()
export class AuthState {
	constructor(private authService: AuthService) {}

	// Selectors
	@Selector()
	static isAuthenticated(state: AuthStateModel): boolean {
		return state.isAuthenticated;
	}

	@Selector()
	static getCurrentUser(state: AuthStateModel): User | null {
		return state.currentUser;
	}

	@Selector()
	static getToken(state: AuthStateModel): string | null {
		return state.token;
	}

	@Selector()
	static getLoading(state: AuthStateModel): boolean {
		return state.loading;
	}

	@Selector()
	static getLoginError(state: AuthStateModel): string | null {
		return state.loginError;
	}

	@Selector()
	static userRole(state: AuthStateModel): string | null {
		return state.currentUser?.role || null;
	}

	@Selector()
	static userHasRole(state: AuthStateModel) {
		return (role: 'admin' | 'user' | 'guest') => {
			return state.currentUser?.role === role;
		};
	}

	// Actions
	@Action(AuthActions.Login)
	login(ctx: StateContext<AuthStateModel>, action: AuthActions.Login) {
		ctx.patchState({ loading: true, loginError: null });

		return this.authService.login(action.payload.email, action.payload.password).pipe(
			tap(success => {
				if (success) {
					const authState = this.authService.authState()!;

					ctx.patchState({
						isAuthenticated: authState.isAuthenticated,
						currentUser: authState.currentUser,
						token: authState.token,
						loading: false,
					});
				} else {
					const authState = this.authService.authState()!;

					ctx.patchState({
						loading: false,
						loginError: authState.loginError,
					});
				}
			}),
			catchError(error => {
				ctx.patchState({
					loading: false,
					loginError: error.message || 'Login failed',
				});
				return throwError(() => error);
			})
		);
	}

	@Action(AuthActions.Logout)
	logout(ctx: StateContext<AuthStateModel>) {
		this.authService.logout();

		ctx.patchState({
			isAuthenticated: false,
			currentUser: null,
			token: null,
			loginError: null,
		});
	}

	@Action(AuthActions.CheckAuthStatus)
	checkAuthStatus(ctx: StateContext<AuthStateModel>) {
		const authState = this.authService.authState()!;

		if (authState.isAuthenticated) {
			ctx.patchState({
				isAuthenticated: true,
				currentUser: authState.currentUser,
				token: authState.token,
			});
		}
	}

	@Action(AuthActions.ClearLoginError)
	clearLoginError(ctx: StateContext<AuthStateModel>) {
		ctx.patchState({ loginError: null });
		this.authService.clearLoginError();
	}
}

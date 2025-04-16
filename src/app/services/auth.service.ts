import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { User } from '../shared/models/user.model';

export interface AuthState {
	isAuthenticated: boolean;
	currentUser: User | null;
	token: string | null;
	loginError: string | null;
}

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private authStateSubject = new BehaviorSubject<AuthState>({
		isAuthenticated: false,
		currentUser: null,
		token: null,
		loginError: null,
	});

	public authState = toSignal(this.authStateSubject);

	constructor() {
		this.checkAuthFromStorage(); // check for existing token on service initialization
	}

	private checkAuthFromStorage() {
		const token = localStorage.getItem('auth_token');
		const userString = localStorage.getItem('current_user');

		if (token && userString) {
			try {
				const user = JSON.parse(userString);
				this.authStateSubject.next({
					isAuthenticated: true,
					currentUser: user,
					token: token,
					loginError: null,
				});
			} catch (error) {
				this.logout(); // handle JSON parsing error
			}
		}
	}

	public login(email: string, password: string): Observable<boolean> {
		if (email === 'admin@example.com' && password === 'admin123') {
			const mockUser: User = {
				id: '1',
				name: 'John Doe',
				email: 'admin@example.com',
				role: 'admin',
				lastLogin: new Date(),
				isActive: true,
			};

			const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);

			// Store auth data in localStorage
			localStorage.setItem('auth_token', mockToken);
			localStorage.setItem('current_user', JSON.stringify(mockUser));

			// Update auth state
			this.authStateSubject.next({
				isAuthenticated: true,
				currentUser: mockUser,
				token: mockToken,
				loginError: null,
			});

			return of(true).pipe(delay(800));
		}

		// Login failed
		this.authStateSubject.next({ ...this.authStateSubject.value, loginError: 'Invalid email or password' });

		return of(false).pipe(delay(800));
	}

	public logout(): void {
		// Clear stored auth data
		localStorage.removeItem('auth_token');
		localStorage.removeItem('current_user');

		// Reset auth state
		this.authStateSubject.next({
			isAuthenticated: false,
			currentUser: null,
			token: null,
			loginError: null,
		});
	}

	public getToken(): string | null {
		return this.authStateSubject.value.token;
	}

	public getCurrentUser(): User | null {
		return this.authStateSubject.value.currentUser;
	}

	public isAuthenticated(): boolean {
		return this.authStateSubject.value.isAuthenticated;
	}

	public hasRole(role: 'admin' | 'user' | 'guest'): boolean {
		const currentUser = this.authStateSubject.value.currentUser;
		return currentUser !== null && currentUser.role === role;
	}

	public clearLoginError(): void {
		this.authStateSubject.next({ ...this.authStateSubject.value, loginError: null });
	}
}

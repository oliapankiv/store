import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthActions, AuthState } from '../store/states/auth.state';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(
		private store: Store,
		private router: Router
	) {}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const token = this.store.selectSnapshot(AuthState.getToken);

		if (token) {
			request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
		}

		return next.handle(request).pipe(
			catchError((error: HttpErrorResponse) => {
				if (error.status === 401) {
					this.store.dispatch(new AuthActions.Logout());
					this.router.navigate(['/login']);
				}

				return throwError(() => error);
			})
		);
	}
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { AuthState } from '../store/states/auth.state';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate {
	constructor(
		private store: Store,
		private router: Router
	) {}

	canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);

		if (!isAuthenticated) {
			this.router.navigate(['/login']);
			return false;
		}

		const requiredRole = route.data['requiredRole'];
		if (requiredRole) {
			const hasRole = this.store.selectSnapshot(AuthState.userHasRole)(requiredRole);

			if (!hasRole) {
				this.router.navigate(['/unauthorized']);
				return false;
			}
		}

		return true;
	}
}

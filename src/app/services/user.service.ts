import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { User } from '../shared/models/user.model';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private mockUsers: User[] = [
		{
			id: '1',
			name: 'John Doe',
			email: 'john.doe@example.com',
			role: 'admin',
			lastLogin: new Date('2025-04-10T08:30:00'),
			isActive: true,
		},
		{
			id: '2',
			name: 'Jane Smith',
			email: 'jane.smith@example.com',
			role: 'user',
			lastLogin: new Date('2025-04-09T14:15:00'),
			isActive: true,
		},
		{
			id: '3',
			name: 'Mike Brown',
			email: 'mike.brown@example.com',
			role: 'user',
			lastLogin: new Date('2025-04-08T11:45:00'),
			isActive: false,
		},
		{
			id: '4',
			name: 'Sarah Johnson',
			email: 'sarah.johnson@example.com',
			role: 'guest',
			lastLogin: new Date('2025-04-05T09:20:00'),
			isActive: true,
		},
	];

	getAllUsers(): Observable<User[]> {
		return of(this.mockUsers).pipe(delay(500));
	}

	getUserById(id: string): Observable<User> {
		const user = this.mockUsers.find(u => u.id === id);

		if (user) {
			return of(user).pipe(delay(300));
		}

		return throwError(() => new Error('User not found'));
	}

	createUser(userData: Partial<User>): Observable<User> {
		const newUser: User = {
			id: Math.random().toString(36).substr(2, 9),
			name: userData.name!,
			email: userData.email!,
			role: userData.role || 'user',
			lastLogin: new Date(),
			isActive: userData.isActive !== undefined ? userData.isActive : true,
		};

		this.mockUsers.push(newUser);
		return of(newUser).pipe(delay(500));
	}

	updateUser(id: string, changes: Partial<User>): Observable<User> {
		const index = this.mockUsers.findIndex(u => u.id === id);

		if (index !== -1) {
			const updatedUser = {
				...this.mockUsers[index],
				...changes,
				updatedAt: new Date(),
			};

			this.mockUsers[index] = updatedUser;
			return of(updatedUser).pipe(delay(500));
		}

		return throwError(() => new Error('User not found'));
	}

	deleteUser(id: string): Observable<boolean> {
		const index = this.mockUsers.findIndex(u => u.id === id);

		if (index !== -1) {
			this.mockUsers.splice(index, 1);
			return of(true).pipe(delay(500));
		}

		return throwError(() => new Error('User not found'));
	}
}

import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { UserListComponent } from './components/user-list/user-list.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [AuthGuard],
	},
	{
		path: 'users',
		component: UserListComponent,
		canActivate: [AuthGuard],
		data: { requiredRole: 'admin' },
	},
	{
		path: 'tasks',
		component: TaskListComponent,
		canActivate: [AuthGuard],
	},
	{ path: '**', redirectTo: 'dashboard' },
];

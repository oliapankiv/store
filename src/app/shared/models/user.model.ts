export interface User {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'user' | 'guest';
	lastLogin: Date;
	isActive: boolean;
}

export interface UserStateModel {
	users: User[];
	selectedUserId: string | null;
	loading: boolean;
	error: string | null;
	filters: {
		searchTerm: string;
		role: 'admin' | 'user' | 'guest' | null;
	};
}

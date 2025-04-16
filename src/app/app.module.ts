import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';

import { AuthService } from './services/auth.service';
import { TaskService } from './services/task.service';
import { UserService } from './services/user.service';
import { AuthGuard } from './guards/auth.guard';

import { AppComponent } from './app.component';

import { routes } from './app.routes';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthState } from './store/states/auth.state';
import { TaskState } from './store/states/task.state';
import { UserState } from './store/states/user.state';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		RouterLink,
		RouterLinkActive,
		AsyncPipe,
		RouterOutlet,
		RouterModule.forRoot(routes),
		NgxsModule.forRoot([UserState, TaskState, AuthState], { developmentMode: true }),
		NgxsLoggerPluginModule.forRoot(),
		NgxsReduxDevtoolsPluginModule.forRoot(),
	],
	providers: [
		UserService,
		TaskService,
		AuthService,
		AuthGuard,
		provideZoneChangeDetection({ eventCoalescing: true }),
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
	],
	bootstrap: [AppComponent],
})
export class AppModule {}

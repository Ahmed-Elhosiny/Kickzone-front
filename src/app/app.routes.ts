import { Routes } from '@angular/router';
import { HomeComponent } from './Component/Home/Home';
import { RegisterComponent } from './auth/register/register';
import { LoginComponent } from './auth/login/login';
import { Result } from './Component/result/result';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'result', component: Result },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

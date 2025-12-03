import { Routes } from '@angular/router';
import { Home } from './Component/Home/Home';
import { Register } from './auth/register/register';

import { Login } from './auth/login/login';

import { Result } from './Component/result/result';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'result', component: Result },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

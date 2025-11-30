import { Routes } from '@angular/router';
import { Home } from './Component/Home/Home';
import { Register } from './auth/register/register';

export const routes: Routes = [
    {path:'home', component: Home },
    {path: '', redirectTo: '/home', pathMatch: 'full' },
    {path:'register',component:Register}
];

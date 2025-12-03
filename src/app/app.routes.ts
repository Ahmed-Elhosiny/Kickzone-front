import { Routes } from '@angular/router';
import { Home } from './Component/Home/Home';
import { Register } from './auth/register/register';
import { Result } from './Component/result/result';


export const routes: Routes = [
    {path:'home', component: Home },
    {path: '', redirectTo: '/home', pathMatch: 'full' },
    {path:'register',component:Register},
    {path:'result', component: Result}
];

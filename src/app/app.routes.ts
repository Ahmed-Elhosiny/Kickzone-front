import { Routes } from '@angular/router';
import { Home } from './Component/Home/Home';

export const routes: Routes = [
    {path:'home', component: Home },
    {path: '', redirectTo: '/home', pathMatch: 'full' }
];

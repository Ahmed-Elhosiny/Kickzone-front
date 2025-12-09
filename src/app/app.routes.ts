import { Routes } from '@angular/router';
import { HomeComponent } from './Component/Home/Home';
import { RegisterComponent } from './auth/register/register';
import { LoginComponent } from './auth/login/login';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './auth/reset-password/reset-password';
import { ConfirmEmailComponent } from './auth/confirm-email/confirm-email';
import { ConfirmEmailChangeComponent } from './auth/confirm-email-change/confirm-email-change';
import { ResendVerificationComponent } from './auth/resend-verification/resend-verification';
import { Result } from './Component/result/result';
import { AuthGuard } from './auth/auth-guard';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'confirm-email-change', component: ConfirmEmailChangeComponent },
  { path: 'resend-verification', component: ResendVerificationComponent },
  { path: 'result', component: Result },
  { 
    path: 'profile', 
    loadComponent: () => import('./Component/user-profile/user-profile').then(m => m.UserProfileComponent),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

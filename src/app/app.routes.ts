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
import { GuestGuard } from './auth/guest-guard';
import { AdminPanelComponent } from './Component/admin/admin';
import { AdminGuard } from './auth/admin-guard';
import { fieldOwnerGuard } from './auth/field-owner-guard';
import { FieldDetails } from './Component/field-details/field-details';
import { ReservationCart } from './Component/ReservationCart/reservation-cart/reservation-cart';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'confirm-email-change', component: ConfirmEmailChangeComponent },
  { path: 'resend-verification', component: ResendVerificationComponent },
  { path: 'result', component: Result },
  { path: 'field/:id', component: FieldDetails },
  { path: 'reservation-cart', component: ReservationCart },
  {
    path: 'profile',
    loadComponent: () =>
      import('./Component/user-profile/user-profile').then((m) => m.UserProfileComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'field-owner',
    loadComponent: () =>
      import('./Component/field-owner-dashboard/field-owner-dashboard').then(
        (m) => m.FieldOwnerDashboardComponent
      ),
    canActivate: [fieldOwnerGuard],
    children: [
      {
        path: 'my-fields',
        loadComponent: () => import('./Component/my-fields/my-fields').then((m) => m.MyFieldsComponent),
      },
      {
        path: 'add-field',
        loadComponent: () =>
          import('./Component/add-edit-field/add-edit-field').then((m) => m.AddEditFieldComponent),
      },
      {
        path: 'edit-field/:id',
        loadComponent: () =>
          import('./Component/add-edit-field/add-edit-field').then((m) => m.AddEditFieldComponent),
      },
      {
        path: '',
        redirectTo: 'my-fields',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./Component/admin/admin').then((m) => m.AdminPanelComponent),
    canActivate: [AdminGuard],
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

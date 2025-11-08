import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Route par défaut - redirige vers dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Routes publiques (Auth)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },

  // Routes protégées
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'workouts',
    loadComponent: () => import('./features/workouts/workouts.component').then(m => m.WorkoutsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nutrition',
    loadComponent: () => import('./features/nutrition/nutrition.component').then(m => m.NutritionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },

  // Route 404 - Wildcard
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

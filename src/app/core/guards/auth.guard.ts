import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

/**
 * Guard pour protéger les routes nécessitant une authentification
 * Utilise les functional guards (Angular 17+)
 */
export const authGuard: CanActivateFn = (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const isAuthenticated = supabaseService.isAuthenticated();

  if (!isAuthenticated) {
    // Rediriger vers la page de login si non authentifié
    // On peut aussi passer l'URL demandée pour rediriger après login
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  return true;
};

/**
 * Guard inverse : redirige vers dashboard si déjà authentifié
 * Utile pour les pages login/register
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const isAuthenticated = supabaseService.isAuthenticated();

  if (isAuthenticated) {
    // Rediriger vers dashboard si déjà connecté
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};

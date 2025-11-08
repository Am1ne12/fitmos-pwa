import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';

// Note: Supabase est initialisé directement dans le service SupabaseService
// Pas besoin de configuration globale ici comme avec Firebase

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone change detection optimisé pour Angular 17+
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Configuration du routing
    provideRouter(routes),
    
    // Configuration HttpClient pour les appels API
    provideHttpClient(withInterceptorsFromDi())
  ]
};

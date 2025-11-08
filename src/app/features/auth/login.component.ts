import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [true] // Par défaut activé
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    try {
      await this.supabaseService.login(email, password, rememberMe);
      
      // Récupérer l'URL de retour depuis les query params
      const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/dashboard';
      
      this.router.navigate([returnUrl]);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      // Gérer les erreurs Supabase
      if (error.message?.includes('Invalid login credentials')) {
        this.errorMessage = 'Email ou mot de passe incorrect.';
      } else if (error.message?.includes('Email not confirmed')) {
        this.errorMessage = 'Veuillez confirmer votre email.';
      } else {
        this.errorMessage = error.message || 'Une erreur est survenue. Veuillez réessayer.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  // Utilitaire pour marquer tous les champs comme touchés
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour faciliter l'accès aux erreurs dans le template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field.hasError('email')) {
      return 'Email invalide';
    }
    if (field.hasError('minlength')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return '';
  }
}

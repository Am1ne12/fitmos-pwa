import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      // Informations physiques
      age: ['', [Validators.required, Validators.min(13), Validators.max(120)]],
      weight: ['', [Validators.required, Validators.min(30), Validators.max(300)]],
      height: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
      gender: ['male', [Validators.required]],
      activityLevel: ['sedentary', [Validators.required]],
      goal: ['maintain', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, displayName, age, weight, height, gender, activityLevel, goal } = this.registerForm.value;

    try {
      // Calculer les calories journalières avec la formule de Mifflin-St Jeor
      const dailyCalories = this.calculateDailyCalories(weight, height, age, gender, activityLevel, goal);
      
      await this.supabaseService.register(email, password, displayName, {
        age,
        weight,
        height,
        gender,
        activityLevel,
        goal,
        dailyCalories
      });
      
      // Rediriger vers le dashboard après inscription réussie
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      
      // Gérer les erreurs Supabase
      if (error.message?.includes('already registered')) {
        this.errorMessage = 'Cet email est déjà utilisé.';
      } else if (error.message?.includes('Password should be')) {
        this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      } else {
        this.errorMessage = error.message || 'Une erreur est survenue. Veuillez réessayer.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  // Calcul des calories journalières avec la formule de Mifflin-St Jeor
  private calculateDailyCalories(
    weight: number,
    height: number,
    age: number,
    gender: string,
    activityLevel: string,
    goal: string
  ): number {
    // BMR (Basal Metabolic Rate) - Mifflin-St Jeor
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Facteur d'activité
    const activityFactors: { [key: string]: number } = {
      sedentary: 1.2,      // Peu ou pas d'exercice
      light: 1.375,        // Exercice léger 1-3 jours/semaine
      moderate: 1.55,      // Exercice modéré 3-5 jours/semaine
      active: 1.725,       // Exercice intense 6-7 jours/semaine
      veryActive: 1.9      // Exercice très intense 2x par jour
    };

    const tdee = bmr * (activityFactors[activityLevel] || 1.2);

    // Ajustement selon l'objectif
    let calories = tdee;
    if (goal === 'lose') {
      calories = tdee - 500; // Déficit de 500 cal pour perdre ~0.5kg/semaine
    } else if (goal === 'gain') {
      calories = tdee + 300; // Surplus de 300 cal pour gagner du muscle
    }

    return Math.round(calories);
  }

  // Utilitaire pour marquer tous les champs comme touchés
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour faciliter l'accès aux contrôles dans le template
  get displayName() {
    return this.registerForm.get('displayName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field.hasError('email')) {
      return 'Email invalide';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    
    // Erreur spécifique pour la confirmation du mot de passe
    if (fieldName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }

    return '';
  }
}

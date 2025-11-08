import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { UserProfile } from '../../core/interfaces/user.interface';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  
  user = this.supabaseService.currentUser;
  isSaving = signal(false);
  isEditing = signal(false);
  successMessage = signal('');
  
  profile = signal<UserProfile>({
    display_name: '',
    age: 0,
    weight: 0,
    height: 0,
    gender: 'male',
    activity_level: 'moderate',
    goal: 'maintain',
    daily_calories: 0
  });

  // Copie pour l'édition
  editedProfile = signal<UserProfile>({ ...this.profile() });

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    const currentUser = this.user();
    if (currentUser) {
      const userProfile = await this.supabaseService.getUserProfile(currentUser.uid);
      if (userProfile) {
        this.profile.set(userProfile);
        this.editedProfile.set({ ...userProfile });
      }
    }
  }

  enableEdit() {
    this.isEditing.set(true);
    this.editedProfile.set({ ...this.profile() });
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editedProfile.set({ ...this.profile() });
  }

  /**
   * Calculer les calories selon le profil (même formule que l'inscription)
   */
  private calculateCalories(
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
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };

    const tdee = bmr * (activityFactors[activityLevel] || 1.55);

    // Ajustement selon l'objectif
    let calories = tdee;
    if (goal === 'lose' || goal === 'lose-weight') {
      calories = tdee - 500;
    } else if (goal === 'gain' || goal === 'gain-muscle') {
      calories = tdee + 300;
    }

    return Math.round(calories);
  }

  async saveProfile() {
    this.isSaving.set(true);
    this.successMessage.set('');
    
    try {
      const currentUser = this.user();
      if (!currentUser) return;

      const edited = this.editedProfile();
      
      // Recalculer les calories si nécessaire
      const newCalories = this.calculateCalories(
        edited.weight || 0,
        edited.height || 0,
        edited.age || 0,
        edited.gender || 'male',
        edited.activity_level || 'moderate',
        edited.goal || 'maintain'
      );

      const updatedProfile = {
        display_name: edited.display_name,
        age: edited.age,
        weight: edited.weight,
        height: edited.height,
        gender: edited.gender,
        activity_level: edited.activity_level,
        goal: edited.goal,
        daily_calories: newCalories
      };

      // Sauvegarder dans Supabase
      await this.supabaseService.updateUserProfile(currentUser.uid, updatedProfile);
      
      this.profile.set(updatedProfile);
      this.isEditing.set(false);
      this.successMessage.set(`✅ Profil mis à jour ! Objectif calorique: ${newCalories} kcal/jour`);
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch (error) {
      console.error('Save error:', error);
      this.successMessage.set('❌ Erreur lors de la sauvegarde');
    } finally {
      this.isSaving.set(false);
    }
  }

  async logout() {
    await this.supabaseService.logout();
    this.router.navigate(['/login']);
  }
}

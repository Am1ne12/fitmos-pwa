import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  user = this.supabaseService.user;
  userProfile = signal<any>(null);
  todayWorkouts = signal<number>(0);
  todayCalories = signal<number>(0);
  waterGlasses = signal<number>(0);
  waterGoal = signal<number>(8);
  isLoading = signal(true);
  isUpdatingWater = signal(false);
  
  // Statistiques hebdomadaires
  weeklyWaterDays = signal<number>(0);
  weeklyCaloriesAvg = signal<number>(0);
  progressiveOverload = signal<number>(0);

  getUserName(): string {
    const u = this.user();
    if (u?.displayName) return u.displayName;
    if (u?.email) return u.email.split('@')[0];
    return 'User';
  }

  async ngOnInit() {
    await this.loadUserProfile();
    await this.loadTodayStats();
    await this.loadWeeklyStats();
  }

  async loadUserProfile() {
    const u = this.user();
    if (!u) return;

    try {
      const profile = await this.supabaseService.getUserProfile(u.uid);
      this.userProfile.set(profile);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  }

  async loadTodayStats() {
    const u = this.user();
    if (!u) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Charger le nombre d'entraînements aujourd'hui
      const todayWorkoutsCount = await this.supabaseService.getTodayWorkouts(u.uid);
      this.todayWorkouts.set(todayWorkoutsCount);
      
      // Charger les calories consommées aujourd'hui
      const nutritionData = await this.supabaseService.getNutritionForDate(u.uid, today);
      if (nutritionData) {
        const totalCalories = nutritionData.total_calories || 0;
        this.todayCalories.set(totalCalories);
      } else {
        this.todayCalories.set(0);
      }

      // Charger le suivi d'eau aujourd'hui
      const waterData = await this.supabaseService.getWaterIntake(u.uid, today);
      if (waterData) {
        this.waterGlasses.set(waterData.glasses || 0);
        this.waterGoal.set(waterData.goal || 8);
      } else {
        this.waterGlasses.set(0);
        this.waterGoal.set(8);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getCaloriesDashOffset(): number {
    const dailyGoal = this.userProfile()?.daily_calories || 3000;
    const consumed = this.todayCalories();
    const percentage = Math.min((consumed / dailyGoal) * 100, 100);
    const circumference = 2 * Math.PI * 85;
    return circumference - (circumference * percentage) / 100;
  }

  getCaloriesRemaining(): number {
    const dailyGoal = this.userProfile()?.daily_calories || 0;
    const consumed = this.todayCalories();
    return Math.max(dailyGoal - consumed, 0);
  }

  getWeightGoal(): string {
    const goal = this.userProfile()?.goal;
    const currentWeight = this.userProfile()?.weight || 0;
    
    if (goal === 'lose') {
      return `${(currentWeight - 5).toFixed(1)} kg`;
    } else if (goal === 'gain') {
      return `${(currentWeight + 3).toFixed(1)} kg`;
    }
    return `${currentWeight.toFixed(1)} kg`;
  }

  getMealsCount(): number {
    // Nombre de repas enregistrés aujourd'hui (basé sur les calories > 0)
    return this.todayCalories() > 0 ? 3 : 0;
  }

  async loadWeeklyStats() {
    const u = this.user();
    if (!u) return;

    try {
      // Charger les jours où l'objectif d'eau a été atteint
      const waterDays = await this.supabaseService.getWeeklyWaterGoalDays(u.uid);
      this.weeklyWaterDays.set(waterDays);

      // Charger la moyenne des calories de la semaine
      const caloriesAvg = await this.supabaseService.getWeeklyCaloriesAverage(u.uid);
      this.weeklyCaloriesAvg.set(caloriesAvg);

      // Charger le progressive overload
      const overload = await this.supabaseService.getProgressiveOverload(u.uid);
      this.progressiveOverload.set(overload);
    } catch (error) {
      console.error('Erreur chargement stats hebdomadaires:', error);
    }
  }

  async addWaterGlass() {
    const u = this.user();
    if (!u || this.isUpdatingWater()) return;

    const currentGlasses = this.waterGlasses();
    const goal = this.waterGoal();

    // Ne pas dépasser 15 verres
    if (currentGlasses >= 15) return;

    this.isUpdatingWater.set(true);
    try {
      const newCount = currentGlasses + 1;
      const today = new Date().toISOString().split('T')[0];
      
      await this.supabaseService.updateWaterIntake(u.uid, today, newCount, goal);
      this.waterGlasses.set(newCount);
    } catch (error) {
      console.error('Erreur ajout verre d\'eau:', error);
    } finally {
      this.isUpdatingWater.set(false);
    }
  }

  async removeWaterGlass() {
    const u = this.user();
    if (!u || this.isUpdatingWater()) return;

    const currentGlasses = this.waterGlasses();
    if (currentGlasses <= 0) return;

    this.isUpdatingWater.set(true);
    try {
      const newCount = currentGlasses - 1;
      const today = new Date().toISOString().split('T')[0];
      
      await this.supabaseService.updateWaterIntake(u.uid, today, newCount, this.waterGoal());
      this.waterGlasses.set(newCount);
    } catch (error) {
      console.error('Erreur suppression verre d\'eau:', error);
    } finally {
      this.isUpdatingWater.set(false);
    }
  }

  getWaterPercentage(): number {
    return Math.min((this.waterGlasses() / this.waterGoal()) * 100, 100);
  }
}

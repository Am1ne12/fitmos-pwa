import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { NutritionApiService } from '../../core/services/nutrition-api.service';
import { NutritionService, NutritionDay, Meal, FoodItem, DailyTotals } from '../../core/services/nutrition.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './nutrition.component.html',
  styleUrl: './nutrition.component.css'
})
export class NutritionComponent implements OnInit {
  private nutritionApiService = inject(NutritionApiService);
  private nutritionService = inject(NutritionService);
  private supabaseService = inject(SupabaseService);
  
  // Expose Math pour le template
  Math = Math;
  
  // État de la journée nutritionnelle
  todayNutritionDay = signal<NutritionDay | null>(null);
  dailyTotals = signal<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  dailyGoals = signal({ calories: 3000, protein: 180, carbs: 350, fat: 80 });
  
  // Recherche d'aliments
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  isSearching = signal(false);
  private searchTimeout: any = null;
  
  // Modal pour ajouter un aliment
  showAddFoodModal = signal(false);
  selectedMeal = signal<Meal | null>(null);
  selectedFood = signal<any | null>(null);
  foodQuantity = signal(1);
  selectedUnit = signal('g');
  availableUnits = signal<any[]>([]);
  
  // Modal pour ajouter un repas
  showAddMealModal = signal(false);
  newMealName = signal('');
  
  // Loading states
  isLoading = signal(true);

  async ngOnInit() {
    await this.loadUserGoals();
    this.loadTodayNutrition();
  }

  async loadUserGoals() {
    const user = this.supabaseService.currentUser();
    if (user) {
      const profile = await this.supabaseService.getUserProfile(user.uid);
      if (profile) {
        // Utiliser les calories du profil (daily_calories vient de la BDD)
        const calories = profile.daily_calories || 3000;
        
        // Calculer les macros basés sur les calories
        // Répartition standard : 30% protéines, 45% glucides, 25% lipides
        const protein = Math.round((calories * 0.30) / 4); // 4 cal/g
        const carbs = Math.round((calories * 0.45) / 4);   // 4 cal/g
        const fat = Math.round((calories * 0.25) / 9);     // 9 cal/g
        
        this.dailyGoals.set({ calories, protein, carbs, fat });
      }
    }
  }

  loadTodayNutrition() {
    this.isLoading.set(true);
    
    this.nutritionService.getTodayNutritionDay().subscribe({
      next: (day) => {
        if (day) {
          this.todayNutritionDay.set(day);
          this.updateTotals();
        } else {
          // Créer une nouvelle journée
          this.nutritionService.createNutritionDay().subscribe({
            next: (newDay) => {
              this.todayNutritionDay.set(newDay);
            }
          });
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading nutrition day:', error);
        this.isLoading.set(false);
      }
    });
  }

  // === GESTION DES REPAS ===

  openAddMealModal() {
    this.newMealName.set('');
    this.showAddMealModal.set(true);
  }

  addMeal() {
    const day = this.todayNutritionDay();
    const mealName = this.newMealName().trim();
    
    console.log('🍽️ Ajout du repas:', { day, mealName });
    
    if (!day) {
      console.error('❌ Pas de journée nutritionnelle active');
      alert('Erreur : Aucune journée nutritionnelle active. Rechargez la page.');
      return;
    }
    
    if (!mealName) {
      console.error('❌ Nom de repas vide');
      return;
    }
    
    const order = (day.meals?.length || 0) + 1;
    console.log('📊 Ordre du repas:', order);
    
    this.nutritionService.addMeal(day.id, mealName, order).subscribe({
      next: (meal) => {
        console.log('✅ Repas ajouté:', meal);
        if (meal) {
          this.todayNutritionDay.update(d => {
            if (!d) return d;
            return {
              ...d,
              meals: [...(d.meals || []), meal]
            };
          });
          this.showAddMealModal.set(false);
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'ajout du repas:', error);
        alert('Erreur lors de l\'ajout du repas. Vérifiez la console pour plus de détails.');
      }
    });
  }

  deleteMeal(mealId: string) {
    if (!confirm('Supprimer ce repas et tous ses aliments ?')) return;
    
    this.nutritionService.deleteMeal(mealId).subscribe({
      next: (success) => {
        if (success) {
          this.todayNutritionDay.update(day => {
            if (!day) return day;
            return {
              ...day,
              meals: day.meals?.filter(m => m.id !== mealId) || []
            };
          });
          this.updateTotals();
        }
      }
    });
  }

  // === RECHERCHE D'ALIMENTS ===

  async searchFood() {
    const query = this.searchQuery();
    
    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 500);
  }
  
  private performSearch(query: string) {
    this.isSearching.set(true);
    
    this.nutritionApiService.searchFood(query).subscribe({
      next: (results: any) => {
        this.searchResults.set(results || []);
        this.isSearching.set(false);
      },
      error: (error: any) => {
        console.error('Erreur de recherche:', error);
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });
  }
  
  searchSuggestion(suggestion: string) {
    this.searchQuery.set(suggestion);
    this.performSearch(suggestion);
  }

  // === AJOUT D'ALIMENTS ===

  openAddFoodModal(meal: Meal, food: any) {
    this.selectedMeal.set(meal);
    this.selectedFood.set(food);
    
    // Récupérer les unités disponibles pour cet aliment
    // Utilise les servingSizes de la base locale si disponibles
    const units = this.nutritionService.getUnitsForFood(food.label, food.servingSizes);
    this.availableUnits.set(units);
    
    // Définir l'unité par défaut et la quantité
    if (units.length > 0) {
      // Utiliser le defaultUnit si disponible
      const defaultUnit = food.defaultUnit || units[0].value;
      this.selectedUnit.set(defaultUnit);
      this.foodQuantity.set(1);
    }
    
    this.showAddFoodModal.set(true);
    this.searchResults.set([]);
    this.searchQuery.set('');
  }

  addFoodToMeal() {
    const meal = this.selectedMeal();
    const food = this.selectedFood();
    const quantity = this.foodQuantity();
    const unit = this.selectedUnit();
    
    if (!meal || !food || quantity <= 0) return;
    
    // Trouver la conversion en grammes
    const unitOption = this.availableUnits().find(u => u.value === unit);
    const gramsEquivalent = quantity * (unitOption?.gramsPerUnit || 1);
    
    const foodItem: FoodItem = {
      fdc_id: food.foodId,
      food_name: food.label,
      quantity: quantity,
      unit: unit,
      grams_equivalent: gramsEquivalent,
      calories_per_100g: food.nutrients.calories || 0,
      protein_per_100g: food.nutrients.protein || 0,
      carbs_per_100g: food.nutrients.carbs || 0,
      fat_per_100g: food.nutrients.fat || 0
    };
    
    this.nutritionService.addFoodToMeal(meal.id, foodItem).subscribe({
      next: (addedFood) => {
        if (addedFood) {
          this.todayNutritionDay.update(day => {
            if (!day) return day;
            return {
              ...day,
              meals: day.meals?.map(m => 
                m.id === meal.id 
                  ? { ...m, food_items: [...(m.food_items || []), addedFood] }
                  : m
              ) || []
            };
          });
          this.updateTotals();
          this.showAddFoodModal.set(false);
        }
      },
      error: (error) => console.error('Error adding food:', error)
    });
  }

  onUnitChange() {
    // Réinitialiser la quantité à 1 quand on change d'unité
    this.foodQuantity.set(1);
  }

  getQuickQuantities(): number[] {
    const unit = this.selectedUnit();
    
    // Pour les pièces, portions, verres : 1, 2, 3, 4
    if (unit === 'pièce' || unit === 'portion' || unit === 'verre' || 
        unit === 'pot' || unit === 'tranche') {
      return [1, 2, 3, 4];
    }
    
    // Pour les grammes : 50, 100, 150, 200, 250
    if (unit === 'g') {
      return [50, 100, 150, 200, 250];
    }
    
    // Pour les ml : 100, 200, 250, 500
    if (unit === 'ml') {
      return [100, 200, 250, 500];
    }
    
    // Pour les litres : 0.25, 0.5, 1, 1.5
    if (unit === 'L') {
      return [0.25, 0.5, 1, 1.5];
    }
    
    return [1, 2, 3, 4];
  }

  deleteFoodItem(mealId: string, foodId: string) {
    this.nutritionService.deleteFoodItem(foodId).subscribe({
      next: (success) => {
        if (success) {
          this.todayNutritionDay.update(day => {
            if (!day) return day;
            return {
              ...day,
              meals: day.meals?.map(m =>
                m.id === mealId
                  ? { ...m, food_items: m.food_items?.filter(f => f.id !== foodId) || [] }
                  : m
              ) || []
            };
          });
          this.updateTotals();
        }
      }
    });
  }

  // === CALCULS ===

  updateTotals() {
    const day = this.todayNutritionDay();
    if (!day) {
      this.dailyTotals.set({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      return;
    }
    
    const totals = this.nutritionService.calculateDailyTotals(day);
    this.dailyTotals.set(totals);
  }

  getFoodTotals(food: FoodItem) {
    const multiplier = (food.grams_equivalent || food.quantity) / 100;
    return {
      calories: Math.round((food.calories_per_100g || 0) * multiplier),
      protein: Math.round((food.protein_per_100g || 0) * multiplier * 10) / 10,
      carbs: Math.round((food.carbs_per_100g || 0) * multiplier * 10) / 10,
      fat: Math.round((food.fat_per_100g || 0) * multiplier * 10) / 10
    };
  }

  getCalculatedNutrients() {
    const food = this.selectedFood();
    const quantity = this.foodQuantity();
    const unitOption = this.availableUnits().find(u => u.value === this.selectedUnit());
    
    if (!food || !unitOption) return null;
    
    const gramsEquivalent = quantity * unitOption.gramsPerUnit;
    const multiplier = gramsEquivalent / 100;
    
    return {
      calories: Math.round((food.nutrients.calories || 0) * multiplier),
      protein: Math.round((food.nutrients.protein || 0) * multiplier * 10) / 10,
      carbs: Math.round((food.nutrients.carbs || 0) * multiplier * 10) / 10,
      fat: Math.round((food.nutrients.fat || 0) * multiplier * 10) / 10,
      gramsEquivalent: Math.round(gramsEquivalent)
    };
  }

  getMealTotals(meal: Meal) {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    meal.food_items?.forEach(food => {
      const foodTotals = this.getFoodTotals(food);
      totals.calories += foodTotals.calories;
      totals.protein += foodTotals.protein;
      totals.carbs += foodTotals.carbs;
      totals.fat += foodTotals.fat;
    });
    
    return totals;
  }

  // === COMPLÉTER LA JOURNÉE ===

  completeDay() {
    const day = this.todayNutritionDay();
    if (!day) return;
    
    if (!confirm('Terminer la journée ? Une nouvelle journée sera créée demain.')) return;
    
    this.nutritionService.completeNutritionDay(day.id).subscribe({
      next: (success) => {
        if (success) {
          alert('Journée terminée ! Vos données ont été sauvegardées.');
          this.loadTodayNutrition();
        }
      },
      error: (error) => console.error('Error completing day:', error)
    });
  }
}

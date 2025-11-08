import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface NutritionDay {
  id: string;
  user_id: string;
  date: string;
  is_completed: boolean;
  notes?: string;
  meals: Meal[];
}

export interface Meal {
  id: string;
  nutrition_day_id: string;
  name: string;
  meal_order: number;
  food_items: FoodItem[];
}

export interface FoodItem {
  id?: string;
  meal_id?: string;
  fdc_id?: string;
  food_name: string;
  quantity: number;
  unit: string; // 'g', 'ml', 'pièce', 'portion'
  grams_equivalent: number; // Conversion en grammes
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export interface UnitOption {
  value: string;
  label: string;
  gramsPerUnit: number;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private supabase = inject(SupabaseService);

  /**
   * Obtenir les unités possibles pour un aliment
   * Peut utiliser soit les servingSizes de l'aliment, soit les unités par défaut
   */
  getUnitsForFood(foodName: string, servingSizes?: Array<{unit: string, label: string, grams: number}>): UnitOption[] {
    // Si l'aliment a des servingSizes définis, les utiliser
    if (servingSizes && servingSizes.length > 0) {
      return servingSizes.map(size => ({
        value: size.unit,
        label: size.label,
        gramsPerUnit: size.grams
      }));
    }
    
    // Sinon, utiliser les unités par défaut selon le nom
    const name = foodName.toLowerCase();
    
    // Œufs (poids moyen d'un œuf sans coquille)
    if (name.includes('egg') || name.includes('oeuf') || name.includes('œuf')) {
      return [
        { value: 'pièce', label: 'pièce(s)', gramsPerUnit: 50 },
        { value: 'g', label: 'grammes', gramsPerUnit: 1 }
      ];
    }
    
    // Liquides (lait, jus, eau, boisson, shake, etc.)
    if (name.includes('milk') || name.includes('lait') || 
        name.includes('juice') || name.includes('jus') ||
        name.includes('water') || name.includes('eau') ||
        name.includes('drink') || name.includes('boisson') ||
        name.includes('shake') || name.includes('smoothie') ||
        name.includes('coffee') || name.includes('café') ||
        name.includes('tea') || name.includes('thé')) {
      return [
        { value: 'ml', label: 'ml', gramsPerUnit: 1 },
        { value: 'L', label: 'litre(s)', gramsPerUnit: 1000 },
        { value: 'verre', label: 'verre(s) (250ml)', gramsPerUnit: 250 },
        { value: 'g', label: 'grammes', gramsPerUnit: 1 }
      ];
    }
    
    // Fruits entiers
    if (name.includes('apple') || name.includes('pomme') ||
        name.includes('orange') || name.includes('banana') || name.includes('banane') ||
        name.includes('pear') || name.includes('poire')) {
      return [
        { value: 'pièce', label: 'pièce(s)', gramsPerUnit: 150 },
        { value: 'g', label: 'grammes', gramsPerUnit: 1 }
      ];
    }
    
    // Pain, tranches
    if (name.includes('bread') || name.includes('pain') ||
        name.includes('toast') || name.includes('slice')) {
      return [
        { value: 'tranche', label: 'tranche(s)', gramsPerUnit: 30 },
        { value: 'g', label: 'grammes', gramsPerUnit: 1 }
      ];
    }
    
    // Pâtes, riz (cuits ou crus)
    if (name.includes('pasta') || name.includes('pâtes') ||
        name.includes('rice') || name.includes('riz') ||
        name.includes('noodle') || name.includes('nouille')) {
      if (name.includes('cooked') || name.includes('cuit')) {
        return [
          { value: 'portion', label: 'portion(s) (200g)', gramsPerUnit: 200 },
          { value: 'g', label: 'grammes', gramsPerUnit: 1 }
        ];
      } else {
        return [
          { value: 'portion', label: 'portion(s) (80g)', gramsPerUnit: 80 },
          { value: 'g', label: 'grammes', gramsPerUnit: 1 }
        ];
      }
    }
    
    // Viandes, poissons
    if (name.includes('chicken') || name.includes('poulet') ||
        name.includes('beef') || name.includes('boeuf') ||
        name.includes('pork') || name.includes('porc') ||
        name.includes('fish') || name.includes('poisson') ||
        name.includes('salmon') || name.includes('saumon') ||
        name.includes('tuna') || name.includes('thon')) {
      return [
        { value: 'portion', label: 'portion(s) (150g)', gramsPerUnit: 150 },
        { value: 'g', label: 'grammes', gramsPerUnit: 1 }
      ];
    }
    
    // Yaourt
    if (name.includes('yogurt') || name.includes('yoghurt') || name.includes('yaourt')) {
      return [
        { value: 'pot', label: 'pot(s) (125g)', gramsPerUnit: 125 },
        { value: 'g', label: 'grammes', gramsPerUnit: 1 }
      ];
    }
    
    // Par défaut : grammes uniquement
    return [
      { value: 'g', label: 'grammes', gramsPerUnit: 1 }
    ];
  }

  /**
   * Récupère ou crée la journée nutritionnelle du jour
   */
  getTodayNutritionDay(): Observable<NutritionDay | null> {
    const today = new Date().toISOString().split('T')[0];
    
    return from(this.supabase.getClient().auth.getUser()).pipe(
      switchMap(({ data: { user } }) => {
        if (!user) throw new Error('Not authenticated');
        
        return from(
          this.supabase.getClient()
            .from('nutrition_days')
            .select(`
              *,
              meals (
                *,
                food_items (*)
              )
            `)
            .eq('user_id', user.id)
            .eq('date', today)
            .order('meal_order', { ascending: true, foreignTable: 'meals' })
            .single()
        );
      }),
      map(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching nutrition day:', error);
          return null;
        }
        return data;
      })
    );
  }

  /**
   * Crée une nouvelle journée nutritionnelle
   */
  createNutritionDay(date?: string): Observable<NutritionDay | null> {
    const dayDate = date || new Date().toISOString().split('T')[0];
    
    return from(this.supabase.getClient().auth.getUser()).pipe(
      switchMap(({ data: { user } }) => {
        if (!user) throw new Error('Not authenticated');
        
        return from(
          this.supabase.getClient()
            .from('nutrition_days')
            .insert({
              user_id: user.id,
              date: dayDate,
              is_completed: false
            })
            .select()
            .single()
        );
      }),
      map(({ data, error }) => {
        if (error) {
          console.error('Error creating nutrition day:', error);
          return null;
        }
        return { ...data, meals: [] };
      })
    );
  }

  /**
   * Ajoute un repas à la journée
   */
  addMeal(nutritionDayId: string, mealName: string, order: number): Observable<Meal | null> {
    console.log('🔄 Service addMeal appelé:', { nutritionDayId, mealName, order });
    
    return from(
      this.supabase.getClient()
        .from('meals')
        .insert({
          nutrition_day_id: nutritionDayId,
          name: mealName,
          meal_order: order
        })
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('❌ Erreur DB lors de l\'ajout du repas:', error);
          console.error('Détails:', { nutritionDayId, mealName, order });
          return null;
        }
        console.log('✅ Repas ajouté en DB:', data);
        return { ...data, food_items: [] };
      })
    );
  }

  /**
   * Ajoute un aliment à un repas
   */
  addFoodToMeal(mealId: string, food: FoodItem): Observable<FoodItem | null> {
    return from(
      this.supabase.getClient()
        .from('food_items')
        .insert({
          meal_id: mealId,
          fdc_id: food.fdc_id,
          food_name: food.food_name,
          quantity: food.quantity,
          unit: food.unit,
          grams_equivalent: food.grams_equivalent,
          calories_per_100g: food.calories_per_100g,
          protein_per_100g: food.protein_per_100g,
          carbs_per_100g: food.carbs_per_100g,
          fat_per_100g: food.fat_per_100g
        })
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error adding food:', error);
          return null;
        }
        return data;
      })
    );
  }

  /**
   * Supprime un repas
   */
  deleteMeal(mealId: string): Observable<boolean> {
    return from(
      this.supabase.getClient()
        .from('meals')
        .delete()
        .eq('id', mealId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error deleting meal:', error);
          return false;
        }
        return true;
      })
    );
  }

  /**
   * Supprime un aliment
   */
  deleteFoodItem(foodId: string): Observable<boolean> {
    return from(
      this.supabase.getClient()
        .from('food_items')
        .delete()
        .eq('id', foodId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error deleting food item:', error);
          return false;
        }
        return true;
      })
    );
  }

  /**
   * Met à jour la quantité d'un aliment
   */
  updateFoodQuantity(foodId: string, newQuantity: number): Observable<boolean> {
    return from(
      this.supabase.getClient()
        .from('food_items')
        .update({ quantity: newQuantity })
        .eq('id', foodId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error updating food quantity:', error);
          return false;
        }
        return true;
      })
    );
  }

  /**
   * Termine la journée nutritionnelle
   */
  completeNutritionDay(nutritionDayId: string, notes?: string): Observable<boolean> {
    return from(
      this.supabase.getClient()
        .from('nutrition_days')
        .update({
          is_completed: true,
          notes: notes || null
        })
        .eq('id', nutritionDayId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error completing nutrition day:', error);
          return false;
        }
        return true;
      })
    );
  }

  /**
   * Calcule les totaux d'une journée
   */
  calculateDailyTotals(nutritionDay: NutritionDay): DailyTotals {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    nutritionDay.meals?.forEach(meal => {
      meal.food_items?.forEach(food => {
        // Utiliser grams_equivalent pour le calcul
        const multiplier = (food.grams_equivalent || food.quantity) / 100;
        totals.calories += (food.calories_per_100g || 0) * multiplier;
        totals.protein += (food.protein_per_100g || 0) * multiplier;
        totals.carbs += (food.carbs_per_100g || 0) * multiplier;
        totals.fat += (food.fat_per_100g || 0) * multiplier;
      });
    });
    
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10
    };
  }

  /**
   * Récupère l'historique des journées nutritionnelles
   */
  getNutritionHistory(limit: number = 30): Observable<NutritionDay[]> {
    return from(this.supabase.getClient().auth.getUser()).pipe(
      switchMap(({ data: { user } }) => {
        if (!user) throw new Error('Not authenticated');
        
        return from(
          this.supabase.getClient()
            .from('nutrition_days')
            .select(`
              *,
              meals (
                *,
                food_items (*)
              )
            `)
            .eq('user_id', user.id)
            .eq('is_completed', true)
            .order('date', { ascending: false })
            .limit(limit)
        );
      }),
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching nutrition history:', error);
          return [];
        }
        return data || [];
      })
    );
  }
}

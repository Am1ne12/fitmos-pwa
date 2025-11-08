import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NutritionApiFood } from '../interfaces/nutrition.interface';
import { LocalFoodDatabaseService, LocalFood } from './local-food-database.service';

@Injectable({
  providedIn: 'root'
})
export class NutritionApiService {
  private localFoodDb = inject(LocalFoodDatabaseService);

  searchFood(query: string): Observable<NutritionApiFood[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    return this.localFoodDb.searchFood(query).pipe(
      map(foods => foods.map(food => this.transformLocalFood(food)))
    );
  }

  getPopularFoods(): Observable<NutritionApiFood[]> {
    return this.localFoodDb.getPopularFoods().pipe(
      map(foods => foods.map(food => this.transformLocalFood(food)))
    );
  }

  getFoodsByCategory(category: string): Observable<NutritionApiFood[]> {
    return this.localFoodDb.getFoodsByCategory(category).pipe(
      map(foods => foods.map(food => this.transformLocalFood(food)))
    );
  }

  private transformLocalFood(food: LocalFood): NutritionApiFood {
    return {
      foodId: food.id,
      label: food.nameFr,
      nutrients: {
        calories: food.nutrients.calories,
        protein: food.nutrients.protein,
        carbs: food.nutrients.carbs,
        fat: food.nutrients.fat
      },
      servingSize: 100,
      servingUnit: 'g',
      category: food.category,
      defaultUnit: food.defaultUnit,
      servingSizes: food.servingSizes
    };
  }

  calculateTotalNutrients(foods: Array<{ nutrients: any, quantity: number }>): {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
  } {
    return foods.reduce((totals, food) => {
      const multiplier = food.quantity / 100;
      
      return {
        totalCalories: totals.totalCalories + (food.nutrients.calories * multiplier),
        totalProtein: totals.totalProtein + (food.nutrients.protein * multiplier),
        totalCarbs: totals.totalCarbs + (food.nutrients.carbs * multiplier),
        totalFats: totals.totalFats + (food.nutrients.fat * multiplier)
      };
    }, {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0
    });
  }
}

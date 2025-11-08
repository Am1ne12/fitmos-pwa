export interface Meal {
  id: string;
  userId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  notes?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // e.g., "g", "ml", "serving"
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionApiResponse {
  foods: NutritionApiFood[];
  totalResults: number;
}

export interface NutritionApiFood {
  foodId: string;
  label: string;
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  servingSize?: number;
  servingUnit?: string;
  category?: string;
  defaultUnit?: string;
  servingSizes?: Array<{
    unit: string;
    label: string;
    grams: number;
  }>;
}

export interface DailyNutrition {
  date: Date;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

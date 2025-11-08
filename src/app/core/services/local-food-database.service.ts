import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';

export interface LocalFood {
  id: string;
  name: string;
  nameFr: string;
  category: string;
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  defaultUnit: string;
  servingSizes: {
    unit: string;
    label: string;
    grams: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class LocalFoodDatabaseService {
  
  private foods: LocalFood[] = [
    // ŒUFS
    {
      id: 'egg-whole',
      name: 'Egg, whole, raw',
      nameFr: 'Œuf entier',
      category: 'Protéines',
      nutrients: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s)', grams: 50 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'egg-white',
      name: 'Egg white, raw',
      nameFr: 'Blanc d\'œuf',
      category: 'Protéines',
      nutrients: { calories: 52, protein: 11, carbs: 0.7, fat: 0.2 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'blanc(s)', grams: 33 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    
    // VIANDES
    {
      id: 'chicken-breast',
      name: 'Chicken breast, raw',
      nameFr: 'Poulet (blanc)',
      category: 'Protéines',
      nutrients: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (150g)', grams: 150 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'ground-beef',
      name: 'Ground beef, 80% lean',
      nameFr: 'Bœuf haché (15% MG)',
      category: 'Protéines',
      nutrients: { calories: 250, protein: 17, carbs: 0, fat: 20 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'salmon',
      name: 'Salmon, raw',
      nameFr: 'Saumon',
      category: 'Protéines',
      nutrients: { calories: 208, protein: 20, carbs: 0, fat: 13 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (150g)', grams: 150 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'tuna',
      name: 'Tuna',
      nameFr: 'Thon',
      category: 'Protéines',
      nutrients: { calories: 144, protein: 30, carbs: 0, fat: 1 },
      defaultUnit: 'boîte',
      servingSizes: [
        { unit: 'boîte', label: 'boîte(s) (150g)', grams: 150 },
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'turkey',
      name: 'Turkey breast',
      nameFr: 'Dinde (blanc)',
      category: 'Protéines',
      nutrients: { calories: 135, protein: 30, carbs: 0, fat: 0.7 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'tranche', label: 'tranche(s) (30g)', grams: 30 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'shrimp',
      name: 'Shrimp',
      nameFr: 'Crevettes',
      category: 'Protéines',
      nutrients: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'pork-chop',
      name: 'Pork chop',
      nameFr: 'Côtelette de porc',
      category: 'Protéines',
      nutrients: { calories: 231, protein: 23, carbs: 0, fat: 14 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    
    // PRODUITS LAITIERS
    {
      id: 'milk-whole',
      name: 'Milk, whole',
      nameFr: 'Lait entier',
      category: 'Produits laitiers',
      nutrients: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
      defaultUnit: 'ml',
      servingSizes: [
        { unit: 'ml', label: 'ml', grams: 1 },
        { unit: 'verre', label: 'verre(s) (250ml)', grams: 250 },
        { unit: 'L', label: 'litre(s)', grams: 1000 }
      ]
    },
    {
      id: 'yogurt-plain',
      name: 'Yogurt, plain',
      nameFr: 'Yaourt nature',
      category: 'Produits laitiers',
      nutrients: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
      defaultUnit: 'pot',
      servingSizes: [
        { unit: 'pot', label: 'pot(s) (125g)', grams: 125 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'cheese-cheddar',
      name: 'Cheddar cheese',
      nameFr: 'Fromage cheddar',
      category: 'Produits laitiers',
      nutrients: { calories: 403, protein: 23, carbs: 3.1, fat: 33 },
      defaultUnit: 'tranche',
      servingSizes: [
        { unit: 'tranche', label: 'tranche(s) (30g)', grams: 30 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'cottage-cheese',
      name: 'Cottage cheese (Perly)',
      nameFr: 'Fromage blanc (type Perly)',
      category: 'Produits laitiers',
      nutrients: { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
      defaultUnit: 'pot',
      servingSizes: [
        { unit: 'pot', label: 'pot(s) (200g)', grams: 200 },
        { unit: 'cuillère', label: 'cuillère(s) à soupe (30g)', grams: 30 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'fromage-blanc-0',
      name: 'Fromage blanc 0%',
      nameFr: 'Fromage blanc 0% MG',
      category: 'Produits laitiers',
      nutrients: { calories: 47, protein: 8, carbs: 4, fat: 0.2 },
      defaultUnit: 'pot',
      servingSizes: [
        { unit: 'pot', label: 'pot(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'greek-yogurt',
      name: 'Greek yogurt',
      nameFr: 'Yaourt grec',
      category: 'Produits laitiers',
      nutrients: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
      defaultUnit: 'pot',
      servingSizes: [
        { unit: 'pot', label: 'pot(s) (150g)', grams: 150 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'mozzarella',
      name: 'Mozzarella',
      nameFr: 'Mozzarella',
      category: 'Produits laitiers',
      nutrients: { calories: 280, protein: 28, carbs: 3.1, fat: 17 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (30g)', grams: 30 },
        { unit: 'boule', label: 'boule(s) (125g)', grams: 125 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'feta',
      name: 'Feta cheese',
      nameFr: 'Feta',
      category: 'Produits laitiers',
      nutrients: { calories: 264, protein: 14, carbs: 4.1, fat: 21 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (30g)', grams: 30 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    
    // FÉCULENTS
    {
      id: 'rice-white-cooked',
      name: 'Rice, white, cooked',
      nameFr: 'Riz blanc cuit',
      category: 'Féculents',
      nutrients: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (200g)', grams: 200 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'rice-white-raw',
      name: 'Rice, white, raw',
      nameFr: 'Riz blanc cru',
      category: 'Féculents',
      nutrients: { calories: 365, protein: 7.1, carbs: 80, fat: 0.7 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (80g)', grams: 80 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'pasta-cooked',
      name: 'Pasta, cooked',
      nameFr: 'Pâtes cuites',
      category: 'Féculents',
      nutrients: { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (200g)', grams: 200 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'bread-white',
      name: 'Bread, white',
      nameFr: 'Pain blanc',
      category: 'Féculents',
      nutrients: { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
      defaultUnit: 'tranche',
      servingSizes: [
        { unit: 'tranche', label: 'tranche(s)', grams: 30 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'potato',
      name: 'Potato, raw',
      nameFr: 'Pomme de terre',
      category: 'Féculents',
      nutrients: { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s) (150g)', grams: 150 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'oats',
      name: 'Oats, raw',
      nameFr: 'Flocons d\'avoine',
      category: 'Féculents',
      nutrients: { calories: 389, protein: 17, carbs: 66, fat: 7 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (50g)', grams: 50 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    
    // FRUITS
    {
      id: 'banana',
      name: 'Banana',
      nameFr: 'Banane',
      category: 'Fruits',
      nutrients: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s)', grams: 120 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'apple',
      name: 'Apple',
      nameFr: 'Pomme',
      category: 'Fruits',
      nutrients: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s)', grams: 150 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'orange',
      name: 'Orange',
      nameFr: 'Orange',
      category: 'Fruits',
      nutrients: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s)', grams: 130 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'avocado',
      name: 'Avocado',
      nameFr: 'Avocat',
      category: 'Fruits',
      nutrients: { calories: 160, protein: 2, carbs: 9, fat: 15 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s) (200g)', grams: 200 },
        { unit: 'moitié', label: 'moitié(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'strawberry',
      name: 'Strawberry',
      nameFr: 'Fraise',
      category: 'Fruits',
      nutrients: { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'kiwi',
      name: 'Kiwi',
      nameFr: 'Kiwi',
      category: 'Fruits',
      nutrients: { calories: 61, protein: 1.1, carbs: 15, fat: 0.5 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s)', grams: 70 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'pear',
      name: 'Pear',
      nameFr: 'Poire',
      category: 'Fruits',
      nutrients: { calories: 57, protein: 0.4, carbs: 15, fat: 0.1 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s)', grams: 180 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'grapes',
      name: 'Grapes',
      nameFr: 'Raisin',
      category: 'Fruits',
      nutrients: { calories: 69, protein: 0.7, carbs: 18, fat: 0.2 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'mango',
      name: 'Mango',
      nameFr: 'Mangue',
      category: 'Fruits',
      nutrients: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s) (200g)', grams: 200 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'blueberry',
      name: 'Blueberry',
      nameFr: 'Myrtille',
      category: 'Fruits',
      nutrients: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'watermelon',
      name: 'Watermelon',
      nameFr: 'Pastèque',
      category: 'Fruits',
      nutrients: { calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
      defaultUnit: 'tranche',
      servingSizes: [
        { unit: 'tranche', label: 'tranche(s) (150g)', grams: 150 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'peach',
      name: 'Peach',
      nameFr: 'Pêche',
      category: 'Fruits',
      nutrients: { calories: 39, protein: 0.9, carbs: 10, fat: 0.3 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s)', grams: 150 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    
    // LÉGUMES
    {
      id: 'broccoli',
      name: 'Broccoli, raw',
      nameFr: 'Brocoli',
      category: 'Légumes',
      nutrients: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'carrot',
      name: 'Carrot, raw',
      nameFr: 'Carotte',
      category: 'Légumes',
      nutrients: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s) (80g)', grams: 80 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'tomato',
      name: 'Tomato, raw',
      nameFr: 'Tomate',
      category: 'Légumes',
      nutrients: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s) (120g)', grams: 120 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'spinach',
      name: 'Spinach, raw',
      nameFr: 'Épinards',
      category: 'Légumes',
      nutrients: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'onion',
      name: 'Onion, raw',
      nameFr: 'Oignon',
      category: 'Légumes',
      nutrients: { calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s) (110g)', grams: 110 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'cucumber',
      name: 'Cucumber',
      nameFr: 'Concombre',
      category: 'Légumes',
      nutrients: { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'zucchini',
      name: 'Zucchini',
      nameFr: 'Courgette',
      category: 'Légumes',
      nutrients: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s) (200g)', grams: 200 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'bell-pepper',
      name: 'Bell pepper',
      nameFr: 'Poivron',
      category: 'Légumes',
      nutrients: { calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s) (150g)', grams: 150 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'mushroom',
      name: 'Mushroom',
      nameFr: 'Champignon',
      category: 'Légumes',
      nutrients: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'lettuce',
      name: 'Lettuce',
      nameFr: 'Salade verte',
      category: 'Légumes',
      nutrients: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'green-beans',
      name: 'Green beans',
      nameFr: 'Haricots verts',
      category: 'Légumes',
      nutrients: { calories: 31, protein: 1.8, carbs: 7, fat: 0.1 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'eggplant',
      name: 'Eggplant',
      nameFr: 'Aubergine',
      category: 'Légumes',
      nutrients: { calories: 25, protein: 1, carbs: 6, fat: 0.2 },
      defaultUnit: 'pièce',
      servingSizes: [
        { unit: 'pièce', label: 'pièce(s) (300g)', grams: 300 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'cauliflower',
      name: 'Cauliflower',
      nameFr: 'Chou-fleur',
      category: 'Légumes',
      nutrients: { calories: 25, protein: 1.9, carbs: 5, fat: 0.3 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (100g)', grams: 100 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    
    // MATIÈRES GRASSES
    {
      id: 'olive-oil',
      name: 'Olive oil',
      nameFr: 'Huile d\'olive',
      category: 'Matières grasses',
      nutrients: { calories: 884, protein: 0, carbs: 0, fat: 100 },
      defaultUnit: 'ml',
      servingSizes: [
        { unit: 'cuillère', label: 'cuillère(s) à soupe (15ml)', grams: 14 },
        { unit: 'ml', label: 'ml', grams: 0.92 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'butter',
      name: 'Butter',
      nameFr: 'Beurre',
      category: 'Matières grasses',
      nutrients: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (10g)', grams: 10 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'peanut-butter',
      name: 'Peanut butter',
      nameFr: 'Beurre de cacahuète',
      category: 'Matières grasses',
      nutrients: { calories: 588, protein: 25, carbs: 20, fat: 50 },
      defaultUnit: 'cuillère',
      servingSizes: [
        { unit: 'cuillère', label: 'cuillère(s) à soupe (20g)', grams: 20 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    
    // LÉGUMINEUSES
    {
      id: 'lentils-cooked',
      name: 'Lentils, cooked',
      nameFr: 'Lentilles cuites',
      category: 'Légumineuses',
      nutrients: { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (200g)', grams: 200 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'chickpeas',
      name: 'Chickpeas',
      nameFr: 'Pois chiches',
      category: 'Légumineuses',
      nutrients: { calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (150g)', grams: 150 },
        { unit: 'boîte', label: 'boîte(s) (240g)', grams: 240 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'black-beans',
      name: 'Black beans',
      nameFr: 'Haricots noirs',
      category: 'Légumineuses',
      nutrients: { calories: 132, protein: 8.9, carbs: 24, fat: 0.5 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (150g)', grams: 150 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'kidney-beans',
      name: 'Kidney beans',
      nameFr: 'Haricots rouges',
      category: 'Légumineuses',
      nutrients: { calories: 127, protein: 8.7, carbs: 23, fat: 0.5 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (150g)', grams: 150 },
        { unit: 'boîte', label: 'boîte(s) (240g)', grams: 240 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    
    // SNACKS & NOIX
    {
      id: 'almonds',
      name: 'Almonds',
      nameFr: 'Amandes',
      category: 'Snacks',
      nutrients: { calories: 579, protein: 21, carbs: 22, fat: 50 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (30g)', grams: 30 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'walnuts',
      name: 'Walnuts',
      nameFr: 'Noix',
      category: 'Snacks',
      nutrients: { calories: 654, protein: 15, carbs: 14, fat: 65 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (30g)', grams: 30 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'cashews',
      name: 'Cashews',
      nameFr: 'Noix de cajou',
      category: 'Snacks',
      nutrients: { calories: 553, protein: 18, carbs: 30, fat: 44 },
      defaultUnit: 'portion',
      servingSizes: [
        { unit: 'portion', label: 'portion(s) (30g)', grams: 30 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    },
    {
      id: 'protein-powder',
      name: 'Whey protein powder',
      nameFr: 'Protéine en poudre (whey)',
      category: 'Suppléments',
      nutrients: { calories: 400, protein: 80, carbs: 8, fat: 6 },
      defaultUnit: 'scoop',
      servingSizes: [
        { unit: 'scoop', label: 'dose(s) (30g)', grams: 30 },
        { unit: 'g', label: 'grammes', grams: 1 }
      ]
    }
  ];

  constructor() {}

  /**
   * Rechercher des aliments dans la base locale
   * Utilise RxJS pour simuler une requête asynchrone
   */
  searchFood(query: string): Observable<LocalFood[]> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Simuler un délai réseau avec RxJS
    return of(this.foods).pipe(
      delay(300), // Délai de 300ms pour simuler une requête
      map(foods => {
        if (!normalizedQuery || normalizedQuery.length < 2) {
          return [];
        }
        
        return foods.filter(food => 
          food.name.toLowerCase().includes(normalizedQuery) ||
          food.nameFr.toLowerCase().includes(normalizedQuery) ||
          food.category.toLowerCase().includes(normalizedQuery)
        );
      })
    );
  }

  /**
   * Obtenir un aliment par son ID
   */
  getFoodById(id: string): Observable<LocalFood | undefined> {
    return of(this.foods.find(f => f.id === id)).pipe(delay(100));
  }

  /**
   * Obtenir tous les aliments d'une catégorie
   */
  getFoodsByCategory(category: string): Observable<LocalFood[]> {
    return of(this.foods.filter(f => f.category === category)).pipe(delay(200));
  }

  /**
   * Obtenir toutes les catégories disponibles
   */
  getCategories(): Observable<string[]> {
    const categories = Array.from(new Set(this.foods.map(f => f.category)));
    return of(categories).pipe(delay(100));
  }

  /**
   * Obtenir des suggestions d'aliments populaires
   */
  getPopularFoods(): Observable<LocalFood[]> {
    const popularIds = [
      'egg-whole', 'chicken-breast', 'rice-white-cooked', 
      'banana', 'oats', 'salmon', 'avocado', 'cottage-cheese',
      'potato', 'broccoli', 'tuna', 'greek-yogurt'
    ];
    return of(this.foods.filter(f => popularIds.includes(f.id))).pipe(delay(100));
  }
}

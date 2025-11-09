import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserProfile } from '../interfaces/user.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // Signal pour l'utilisateur actuel
  currentUser = signal<User | null>(null);
  
  // BehaviorSubject pour l'état d'authentification
  private authState$ = new BehaviorSubject<User | null>(null);

  constructor() {
    // Initialiser le client Supabase avec des valeurs par défaut si non configurées
    const supabaseUrl = environment.supabase?.url || 'https://placeholder.supabase.co';
    const supabaseKey = environment.supabase?.anonKey || 'placeholder-key';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Écouter les changements d'authentification
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user: User = {
          uid: session.user.id,
          email: session.user.email!,
          displayName: session.user.user_metadata?.['display_name'] || undefined,
          photoURL: session.user.user_metadata?.['avatar_url'] || undefined,
          createdAt: new Date(session.user.created_at)
        };
        this.currentUser.set(user);
        this.authState$.next(user);
      } else {
        this.currentUser.set(null);
        this.authState$.next(null);
      }
    });

    // Vérifier la session actuelle
    this.initSession();
  }

  private async initSession(): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      const user: User = {
        uid: session.user.id,
        email: session.user.email!,
        displayName: session.user.user_metadata?.['display_name'] || undefined,
        photoURL: session.user.user_metadata?.['avatar_url'] || undefined,
        createdAt: new Date(session.user.created_at)
      };
      this.currentUser.set(user);
      this.authState$.next(user);
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(
    email: string, 
    password: string, 
    displayName?: string,
    physicalInfo?: {
      age: number;
      weight: number;
      height: number;
      gender: string;
      activityLevel: string;
      goal: string;
      dailyCalories: number;
    }
  ): Promise<User> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Échec de la création du compte');

      // Créer un profil utilisateur dans la table user_profiles
      const newUser: User = {
        uid: data.user.id,
        email: data.user.email!,
        displayName: displayName,
        createdAt: new Date()
      };

      // Créer le profil utilisateur dans Supabase avec les infos physiques
      if (physicalInfo) {
        await this.createUserProfile(newUser.uid, {
          display_name: displayName,
          age: physicalInfo.age,
          weight: physicalInfo.weight,
          height: physicalInfo.height,
          gender: physicalInfo.gender,
          activity_level: physicalInfo.activityLevel,
          goal: physicalInfo.goal,
          daily_calories: physicalInfo.dailyCalories
        } as any);
      } else if (displayName) {
        await this.createUserProfile(newUser.uid, {
          display_name: displayName
        } as any);
      }

      return newUser;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  /**
   * Connexion d'un utilisateur existant
   */
  async login(email: string, password: string, rememberMe: boolean = true): Promise<User> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('Échec de la connexion');

      // Si "Rester connecté" est désactivé, on stocke l'info en sessionStorage
      // Supabase utilise localStorage par défaut pour la persistance
      if (!rememberMe) {
        // On pourrait gérer une session temporaire ici si nécessaire
        // Pour l'instant, Supabase garde toujours la session
        localStorage.setItem('rememberMe', 'false');
      } else {
        localStorage.setItem('rememberMe', 'true');
      }

      return {
        uid: data.user.id,
        email: data.user.email!,
        displayName: data.user.user_metadata?.['display_name'] || undefined,
        photoURL: data.user.user_metadata?.['avatar_url'] || undefined,
        createdAt: new Date(data.user.created_at)
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async logout(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'utilisateur actuellement connecté (Signal)
   */
  get user() {
    return this.currentUser;
  }

  /**
   * Vérifier si un utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  /**
   * Créer un profil utilisateur dans Supabase
   */
  private async createUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur lors de la création du profil:', error);
      throw error;
    }
  }

  /**
   * Récupérer le profil utilisateur depuis Supabase
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return data as UserProfile;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le profil utilisateur dans Supabase
   */
  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  /**
   * Observable du profil utilisateur
   */
  getUserProfile$(userId: string): Observable<UserProfile | null> {
    return from(this.getUserProfile(userId));
  }

  /**
   * Obtenir le client Supabase (pour des requêtes personnalisées)
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Sauvegarder un workout complet avec exercices et séries
   */
  async saveWorkout(userId: string, workout: any): Promise<string> {
    try {
      // 1. Insérer le workout principal
      const { data: workoutData, error: workoutError } = await this.supabase
        .from('workouts')
        .insert({
          user_id: userId,
          name: workout.name,
          date: workout.date,
          notes: workout.notes || null
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      const workoutId = workoutData.id;

      // 2. Insérer les exercices
      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        
        const { data: exerciseData, error: exerciseError } = await this.supabase
          .from('workout_exercises')
          .insert({
            workout_id: workoutId,
            name: exercise.name,
            order_index: i
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // 3. Insérer les séries de cet exercice
        const sets = exercise.sets.map((set: any, index: number) => ({
          workout_exercise_id: exerciseData.id,
          set_number: index + 1,
          reps: set.reps,
          weight: set.weight
        }));

        const { error: setsError } = await this.supabase
          .from('exercise_sets')
          .insert(sets);

        if (setsError) throw setsError;
      }

      return workoutId;
    } catch (error) {
      console.error('Erreur sauvegarde workout:', error);
      throw error;
    }
  }

  /**
   * Récupérer les workouts d'un utilisateur
   */
  async getUserWorkouts(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data: workouts, error } = await this.supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            exercise_sets (*)
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transformer les données pour correspondre à notre interface
      return (workouts || []).map(workout => ({
        id: workout.id,
        name: workout.name,
        date: new Date(workout.date),
        notes: workout.notes,
        exercises: (workout.workout_exercises || []).map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          sets: (ex.exercise_sets || [])
            .sort((a: any, b: any) => a.set_number - b.set_number)
            .map((set: any) => ({
              reps: set.reps,
              weight: set.weight
            }))
        }))
      }));
    } catch (error) {
      console.error('Erreur chargement workouts:', error);
      return [];
    }
  }

  /**
   * Supprimer un workout
   */
  async deleteWorkout(workoutId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur suppression workout:', error);
      throw error;
    }
  }

  /**
   * Récupérer les workouts du jour
   */
  async getTodayWorkouts(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { count, error } = await this.supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date', today);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erreur comptage workouts:', error);
      return 0;
    }
  }

  /**
   * Récupérer les données nutrition pour une date
   */
  async getNutritionForDate(userId: string, date: string): Promise<any> {
    try {
      // Récupérer le jour de nutrition avec tous les repas et aliments
      const { data: nutritionDay, error: dayError } = await this.supabase
        .from('nutrition_days')
        .select(`
          *,
          meals (
            *,
            food_items (*)
          )
        `)
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (dayError && dayError.code !== 'PGRST116') throw dayError;
      
      if (!nutritionDay) return null;

      // Calculer les totaux depuis les aliments
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      if (nutritionDay.meals) {
        for (const meal of nutritionDay.meals) {
          if (meal.food_items) {
            for (const food of meal.food_items) {
              // Calculer les valeurs réelles à partir des valeurs pour 100g et du poids en grammes
              const gramsEquivalent = food.grams_equivalent || 0;
              const factor = gramsEquivalent / 100;
              
              totalCalories += (food.calories_per_100g || 0) * factor;
              totalProtein += (food.protein_per_100g || 0) * factor;
              totalCarbs += (food.carbs_per_100g || 0) * factor;
              totalFat += (food.fat_per_100g || 0) * factor;
              
              console.log(`📝 Food: ${food.food_name}, ${gramsEquivalent}g, Calories: ${(food.calories_per_100g || 0) * factor}`);
            }
          }
        }
      }

      console.log(`📊 Total calculated - Calories: ${totalCalories}, Protein: ${totalProtein}g, Carbs: ${totalCarbs}g, Fat: ${totalFat}g`);

      return {
        ...nutritionDay,
        total_calories: Math.round(totalCalories),
        total_protein: Math.round(totalProtein),
        total_carbs: Math.round(totalCarbs),
        total_fat: Math.round(totalFat)
      };
    } catch (error) {
      console.error('Erreur chargement nutrition:', error);
      return null;
    }
  }

  /**
   * Récupérer le suivi d'eau pour une date
   */
  async getWaterIntake(userId: string, date: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Erreur chargement water intake:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le suivi d'eau (upsert)
   */
  async updateWaterIntake(userId: string, date: string, glasses: number, goal: number = 8): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('water_intake')
        .upsert({
          user_id: userId,
          date: date,
          glasses: glasses,
          goal: goal,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur mise à jour water intake:', error);
      throw error;
    }
  }

  /**
   * Obtenir le nombre de jours où l'objectif d'eau a été atteint cette semaine
   */
  async getWeeklyWaterGoalDays(userId: string): Promise<number> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Dimanche
      
      const { data, error } = await this.supabase
        .from('water_intake')
        .select('glasses, goal')
        .eq('user_id', userId)
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0]);

      if (error) throw error;
      
      // Compter les jours où glasses >= goal (8 verres = 2L)
      return data?.filter(d => d.glasses >= (d.goal || 8)).length || 0;
    } catch (error) {
      console.error('Erreur comptage jours eau:', error);
      return 0;
    }
  }

  /**
   * Obtenir la moyenne des calories de la semaine
   */
  async getWeeklyCaloriesAverage(userId: string): Promise<number> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const { data, error } = await this.supabase
        .from('nutrition_days')
        .select('total_calories')
        .eq('user_id', userId)
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0]);

      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      const total = data.reduce((sum, day) => sum + (day.total_calories || 0), 0);
      return Math.round(total / data.length);
    } catch (error) {
      console.error('Erreur moyenne calories:', error);
      return 0;
    }
  }

  /**
   * Calculer le progressive overload (progression entre semaines)
   */
  async getProgressiveOverload(userId: string): Promise<number> {
    try {
      const today = new Date();
      
      // Cette semaine
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      
      // Semaine dernière
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

      // Volume cette semaine
      const { data: thisWeek, error: error1 } = await this.supabase
        .from('workouts')
        .select('exercises:workout_exercises(exercise_sets:exercise_sets(reps, weight))')
        .eq('user_id', userId)
        .gte('date', thisWeekStart.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0]);

      // Volume semaine dernière
      const { data: lastWeek, error: error2 } = await this.supabase
        .from('workouts')
        .select('exercises:workout_exercises(exercise_sets:exercise_sets(reps, weight))')
        .eq('user_id', userId)
        .gte('date', lastWeekStart.toISOString().split('T')[0])
        .lte('date', lastWeekEnd.toISOString().split('T')[0]);

      if (error1 || error2) throw error1 || error2;

      const calculateVolume = (workouts: any[]) => {
        let totalVolume = 0;
        workouts?.forEach((workout: any) => {
          workout.exercises?.forEach((exercise: any) => {
            exercise.exercise_sets?.forEach((set: any) => {
              totalVolume += (set.reps || 0) * (set.weight || 0);
            });
          });
        });
        return totalVolume;
      };

      const thisWeekVolume = calculateVolume(thisWeek || []);
      const lastWeekVolume = calculateVolume(lastWeek || []);

      if (lastWeekVolume === 0) return 0;
      
      // Calculer la progression en pourcentage
      const progression = ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100;
      return Math.round(progression);
    } catch (error) {
      console.error('Erreur calcul progressive overload:', error);
      return 0;
    }
  }
}

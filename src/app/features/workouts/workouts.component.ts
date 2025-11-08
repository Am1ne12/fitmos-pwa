import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SupabaseService } from '../../core/services/supabase.service';

interface Exercise {
  id?: string;
  name: string;
  sets: ExerciseSet[];
}

interface ExerciseSet {
  reps: number;
  weight: number;
}

interface Workout {
  id?: string;
  name: string;
  date: Date;
  exercises: Exercise[];
  notes?: string;
}

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.css'
})
export class WorkoutsComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  user = this.supabaseService.user;
  
  workouts = signal<Workout[]>([]);
  isLoading = signal(true);
  showAddExerciseModal = signal(false);
  isWorkoutActive = signal(false);
  
  // Workout actuel en cours
  currentWorkout = signal<Workout>({
    name: '',
    date: new Date(),
    exercises: [],
    notes: ''
  });
  
  // Nouvel exercice à ajouter
  newExercise = {
    name: '',
    sets: [{ reps: 0, weight: 0 }]
  };

  async ngOnInit() {
    await this.loadWorkouts();
  }

  async loadWorkouts() {
    const u = this.user();
    if (!u) return;

    this.isLoading.set(true);
    try {
      const workouts = await this.supabaseService.getUserWorkouts(u.uid);
      this.workouts.set(workouts);
    } catch (error) {
      console.error('Erreur chargement workouts:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  startNewWorkout() {
    this.isWorkoutActive.set(true);
    this.currentWorkout.set({
      name: `Entraînement du ${new Date().toLocaleDateString('fr-FR')}`,
      date: new Date(),
      exercises: [],
      notes: ''
    });
  }

  addSetToNewExercise() {
    this.newExercise.sets.push({ reps: 0, weight: 0 });
  }

  removeSetFromNewExercise(index: number) {
    if (this.newExercise.sets.length > 1) {
      this.newExercise.sets.splice(index, 1);
    }
  }

  addExerciseToWorkout() {
    if (this.newExercise.name && this.newExercise.sets.length > 0) {
      const workout = this.currentWorkout();
      workout.exercises.push({
        name: this.newExercise.name,
        sets: [...this.newExercise.sets]
      });
      this.currentWorkout.set({ ...workout });
      
      // Reset
      this.newExercise = {
        name: '',
        sets: [{ reps: 0, weight: 0 }]
      };
      this.showAddExerciseModal.set(false);
    }
  }

  async saveWorkout() {
    const u = this.user();
    if (!u) return;

    const workout = this.currentWorkout();
    if (workout.exercises.length === 0) {
      alert('Ajoutez au moins un exercice');
      return;
    }

    try {
      const workoutId = await this.supabaseService.saveWorkout(u.uid, workout);
      
      // Recharger les workouts
      await this.loadWorkouts();
      
      // Reset current workout
      this.isWorkoutActive.set(false);
      this.currentWorkout.set({
        name: '',
        date: new Date(),
        exercises: [],
        notes: ''
      });
      
      alert('✅ Entraînement sauvegardé avec succès!');
    } catch (error) {
      console.error('Erreur sauvegarde workout:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  }

  removeExercise(index: number) {
    const workout = this.currentWorkout();
    workout.exercises.splice(index, 1);
    this.currentWorkout.set({ ...workout });
  }
}

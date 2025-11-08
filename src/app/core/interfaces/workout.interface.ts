export interface Workout {
  id: string;
  userId: string;
  name: string; // e.g., "Push Day", "Pull Day"
  description?: string;
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  workoutId: string;
  name: string; // e.g., "Bench Press", "Squat"
  category?: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'other';
  order: number; // Position in the workout
  sets?: number;
  targetReps?: number;
  notes?: string;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  userId: string;
  date: Date;
  sets: SetLog[];
  notes?: string;
}

export interface SetLog {
  setNumber: number;
  weight: number; // in kg or lbs
  reps: number;
  completed: boolean;
}

export interface ExerciseHistory {
  exerciseId: string;
  exerciseName: string;
  logs: ExerciseLog[];
}

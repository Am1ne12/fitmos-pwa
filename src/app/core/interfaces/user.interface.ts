export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}

export interface UserProfile {
  user_id?: string;
  display_name?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  goal?: 'lose' | 'maintain' | 'gain';
  daily_calories?: number;
  created_at?: string;
  updated_at?: string;
}

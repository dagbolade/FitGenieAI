import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface for workout data
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  equipment: string;
  muscleGroup: string[];
  instructions?: string[];
}

export interface Workout {
  _id?: string;
  name: string;
  description: string;
  type: string;
  level: string;
  goal: string;
  duration: number;
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
  }

// Workout service methods
export const workoutService = {
  // Get all workouts with optional filters
  getWorkouts: async (filters?: {
    level?: string;
    goal?: string;
    type?: string;
  }) => {
    const response = await api.get('/workouts', { params: filters });
    return response.data;
  },

  // Get workout by ID
  getWorkoutById: async (id: string) => {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  },

  // Create a new workout
  createWorkout: async (workout: Omit<Workout, '_id'>) => {
    const response = await api.post('/workouts', workout);
    return response.data;
  },

  // Update a workout
  updateWorkout: async (id: string, workout: Partial<Workout>) => {
    const response = await api.put(`/workouts/${id}`, workout);
    return response.data;
  },

  // Delete a workout
  deleteWorkout: async (id: string) => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  }
};
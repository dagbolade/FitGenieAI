import { create } from 'zustand';
import {type Workout, workoutService } from '../api/workoutService';

interface WorkoutState {
  workouts: Workout[];
  currentWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWorkouts: (filters?: { level?: string; goal?: string; type?: string }) => Promise<void>;
  fetchWorkoutById: (id: string) => Promise<void>;
  createWorkout: (workout: Omit<Workout, '_id'>) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  setCurrentWorkout: (workout: Workout | null) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  currentWorkout: null,
  isLoading: false,
  error: null,

  fetchWorkouts: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const workouts = await workoutService.getWorkouts(filters);
      set({ workouts, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch workouts',
        isLoading: false
      });
    }
  },

  fetchWorkoutById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const workout = await workoutService.getWorkoutById(id);
      set({ currentWorkout: workout, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch workout',
        isLoading: false
      });
    }
  },

  createWorkout: async (workout) => {
    set({ isLoading: true, error: null });
    try {
      const newWorkout = await workoutService.createWorkout(workout);
      set(state => ({
        workouts: [...state.workouts, newWorkout],
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create workout',
        isLoading: false
      });
    }
  },

  updateWorkout: async (id, workout) => {
    set({ isLoading: true, error: null });
    try {
      const updatedWorkout = await workoutService.updateWorkout(id, workout);
      set(state => ({
        workouts: state.workouts.map(w => w._id === id ? updatedWorkout : w),
        currentWorkout: state.currentWorkout?._id === id ? updatedWorkout : state.currentWorkout,
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update workout',
        isLoading: false
      });
    }
  },

  deleteWorkout: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await workoutService.deleteWorkout(id);
      set(state => ({
        workouts: state.workouts.filter(w => w._id !== id),
        currentWorkout: state.currentWorkout?._id === id ? null : state.currentWorkout,
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete workout',
        isLoading: false
      });
    }
  },

  setCurrentWorkout: (workout) => {
    set({ currentWorkout: workout });
  }
}));
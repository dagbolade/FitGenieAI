// frontend/src/services/api.ts
const API_URL = 'http://localhost:4000/api';

export const apiService = {
  // Exercise-related functions
  getExercises: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.equipment) queryParams.append('equipment', filters.equipment);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.muscle) queryParams.append('muscle', filters.muscle);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const response = await fetch(`${API_URL}/exercises?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  },

  getExerciseById: async (id) => {
    try {
      console.log(`Fetching exercise with ID: ${id}`); // Add this log
      const response = await fetch(`${API_URL}/exercises/${id}`);

      if (!response.ok) {
        const errorText = await response.text(); // Get the error message
        console.error(`API Error (${response.status}):`, errorText); // Add this log
        throw new Error(`Failed to fetch exercise details: ${response.status}`);
      }

      const data = await response.json();
      console.log('Exercise data received:', data); // Add this log
      return data;
    } catch (error) {
      console.error('Error fetching exercise details:', error);
      throw error;
    }
  },

  // Workout-related functions
  getWorkouts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.level) queryParams.append('level', filters.level);
      if (filters.goal) queryParams.append('goal', filters.goal);
      if (filters.type) queryParams.append('type', filters.type);

      const response = await fetch(`${API_URL}/workouts?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  },

  getWorkoutById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/workouts/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch workout details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching workout details:', error);
      throw error;
    }
  },

  generateWorkout: async (userProfile) => {
    try {
      const response = await fetch(`${API_URL}/workouts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to generate workout');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating workout:', error);
      throw error;
    }
  },

  createWorkout: async (workout) => {
    try {
      const response = await fetch(`${API_URL}/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workout),
      });

      if (!response.ok) {
        throw new Error('Failed to create workout');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
  },

  updateWorkout: async (id, workout) => {
    try {
      const response = await fetch(`${API_URL}/workouts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workout),
      });

      if (!response.ok) {
        throw new Error('Failed to update workout');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  },

  deleteWorkout: async (id) => {
    try {
      const response = await fetch(`${API_URL}/workouts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  },

  // AI coach function
  askCoach: async (query, userProfile = null) => {
    try {
      const payload = { query };
      if (userProfile) payload.user_profile = userProfile;

      const response = await fetch(`${API_URL}/ai-coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI coach');
      }

      return await response.json();
    } catch (error) {
      console.error('Error asking coach:', error);
      throw error;
    }
  }
};
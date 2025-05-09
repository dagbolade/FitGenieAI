// src/services/api.ts
const API_URL = 'http://localhost:8000/api';

export const apiService = {
  // Get all exercises
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

  // Get a specific exercise by ID
  getExerciseById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/exercise/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exercise details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching exercise details:', error);
      throw error;
    }
  },

  // Generate a workout based on user profile and
  generateWorkout: async (userProfile) => {
    try {
      const response = await fetch(`${API_URL}/generate-workout`, {
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

  // Ask the AI coach a question
  askCoach: async (query, userProfile = null) => {
    try {
      const payload = { query };
      if (userProfile) payload.user_profile = userProfile;

      const response = await fetch(`${API_URL}/ask-coach`, {
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
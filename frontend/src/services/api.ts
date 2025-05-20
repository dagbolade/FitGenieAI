// frontend/src/services/api.ts
const API_URL = 'http://localhost:4000/api';

// Helper function to get auth token
const getToken = () => localStorage.getItem('token');

// Helper function to create headers with auth token
const createAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiService = {
  API_URL, // Export the API_URL for access in other components

  // Authentication functions
  register: async (userData: any) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Exercise-related functions
  getExercises: async (filters: any = {}) => {
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

  getExerciseById: async (id: string) => {
    try {
      console.log(`Fetching exercise with ID: ${id}`);
      const response = await fetch(`${API_URL}/exercises/${id}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch exercise details: ${response.status}`);
      }

      const data = await response.json();
      console.log('Exercise data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching exercise details:', error);
      throw error;
    }
  },

  // Workout-related functions - auth required
  getWorkouts: async (filters: any = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.level) queryParams.append('level', filters.level);
      if (filters.goal) queryParams.append('goal', filters.goal);
      if (filters.type) queryParams.append('type', filters.type);

      const response = await fetch(`${API_URL}/workouts?${queryParams.toString()}`, {
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  },

  getWorkoutById: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/workouts/${id}`, {
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workout details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching workout details:', error);
      throw error;
    }
  },

  generateWorkout: async (userProfile: any) => {
    try {
      const response = await fetch(`${API_URL}/workouts/generate`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(userProfile)
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

  updateWorkoutProgress: async (id: string, exercises: any[]) => {
    try {
      const response = await fetch(`${API_URL}/user-workouts/${id}/progress`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ exercises })
      });

      if (!response.ok) {
        throw new Error('Failed to update workout progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating workout progress:', error);
      throw error;
    }
  },

  deleteWorkout: async (id: string) => {
    try {
      console.log(`Deleting workout with ID: ${id}`);

      // Make sure we're using the correct URL and authentication
      const response = await fetch(`${API_URL}/workouts/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders()
      });

      // Log more detailed error information
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Delete workout error (${response.status}):`, errorText);
        throw new Error(`Failed to delete workout: ${response.status} ${errorText}`);
      }

      // Return the response as JSON (or return a simple success)
      try {
        return await response.json();
      } catch (e) {
        // If the response is not JSON, just return a success message
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  },

  // AI coach function
  askCoach: async (query: string, userProfile: any = null) => {
    try {
      const payload: any = { query };
      if (userProfile) payload.user_profile = userProfile;

      const response = await fetch(`${API_URL}/ai-coach`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI coach');
      }

      return await response.json();
    } catch (error) {
      console.error('Error asking coach:', error);
      throw error;
    }
  },

  createWorkout: async (workoutData: any) => {
    try {
      const response = await fetch(`${API_URL}/workouts`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(workoutData)
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

  // Add exercises to workout
  addExercisesToWorkout: async (workoutId: string, exerciseIds: string[]) => {
    try {
      const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ exerciseIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to add exercises to workout');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding exercises to workout:', error);
      throw error;
    }
  },

  // Dashboard-related functions - auth required
  getDashboardData: async () => {
    try {
      console.log('Fetching dashboard data...');
      const response = await fetch(`${API_URL}/dashboard`, {
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Dashboard API Error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dashboard data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  getRecentActivity: async () => {
    try {
      console.log('Fetching recent activity...');
      const response = await fetch(`${API_URL}/dashboard/activity/recent`, {
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recent activity: ${response.status}`);
      }

      const data = await response.json();
      console.log('Recent activity received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  getUpcomingWorkouts: async () => {
    try {
      const response = await fetch(`${API_URL}/user-workouts/upcoming`, {
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upcoming workouts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming workouts:', error);
      throw error;
    }
  },

  getPastWorkouts: async () => {
    try {
      const response = await fetch(`${API_URL}/user-workouts/past`, {
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch past workouts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching past workouts:', error);
      throw error;
    }
  },

  getUserWorkout: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/user-workouts/${id}`, {
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workout details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching workout details:', error);
      throw error;
    }
  },

  // Complete a workout with calorie tracking
  completeWorkout: async (id: string, data: {
    duration: number;
    caloriesBurned?: number;
    exerciseData?: any[];
  }) => {
    try {
      console.log(`Completing workout ${id} with data:`, data);

      const response = await fetch(`${API_URL}/workouts/${id}/complete`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`Failed to complete workout: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  },

  // User profile methods
  getUserProfile: async () => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  updateUserProfile: async (profileData: any) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};
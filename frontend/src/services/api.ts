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


  // Workout-related functions - auth required
  getWorkouts: async (filters = {}) => {
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

  getWorkoutById: async (id) => {
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

  generateWorkout: async (userProfile) => {
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


  updateWorkoutProgress: async (id, exercises) => {
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
   // AI coach function
  askCoach: async (query, userProfile = null) => {
    try {
      const payload = { query };
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

  // Update this function in your apiService
  createWorkout: async (workoutData) => {
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
  addExercisesToWorkout: async (workoutId, exerciseIds) => {
    try {
      const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // src/services/api.ts
// Add these functions to your existing apiService

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

  repairStats: async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard/repair-stats`, {
      method: 'POST',
      headers: createAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to repair stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error repairing stats:', error);
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

  getUserWorkout: async (id) => {
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


  // This function will be called when a user completes a workout
  completeWorkout: async (workoutId, data = {}) => {
  try {
    const response = await fetch(`${API_URL}/workouts/${workoutId}/complete`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to complete workout');
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing workout:', error);
    throw error;
  }
}

};
// frontend/src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Chart.js for better visualizations - you'll need to install this
// npm install react-chartjs-2 chart.js
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalWorkouts: number;
  completedWorkouts: number;
  totalExercises: number;
  favoriteExercises: Array<{ name: string; count: number }>;
  weeklyActivity: Array<{ day: string; minutes: number }>;
  muscleGroups: Array<{ name: string; percentage: number }>;
}

interface DashboardData {
  stats: DashboardStats;
}

const DashboardPage: React.FC = () => {
  const [userStats, setUserStats] = useState<DashboardStats | null>(null);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the authenticated user
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const dashboardResponse = await apiService.getDashboardData();
      console.log('Dashboard response:', dashboardResponse);

      if (dashboardResponse && dashboardResponse.stats) {
        setUserStats(dashboardResponse.stats);
      } else {
        console.error('Invalid dashboard data structure:', dashboardResponse);
        throw new Error('Invalid dashboard data format');
      }

      // Fetch upcoming workouts
      try {
        const workoutsResponse = await apiService.getUpcomingWorkouts();
        console.log('Upcoming workouts response:', workoutsResponse);
        setUpcomingWorkouts(workoutsResponse || []);
      } catch (workoutErr) {
        console.error('Error fetching upcoming workouts:', workoutErr);
        setUpcomingWorkouts([]);
      }

      // Fetch recent activity
      try {
        const activityResponse = await apiService.getRecentActivity();
        console.log('Recent activity response:', activityResponse);
        setRecentActivity(activityResponse || []);
      } catch (activityErr) {
        console.error('Error fetching recent activity:', activityErr);
        setRecentActivity([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setError('You must be logged in to view the dashboard');
      setLoading(false);
    }
  }, [user]);

  // Calculate completion rate
  const getCompletionRate = () => {
    if (!userStats) return '0%';
    const { totalWorkouts, completedWorkouts } = userStats;
    if (totalWorkouts === 0) return '0%';
    return `${Math.round((completedWorkouts / totalWorkouts) * 100)}%`;
  };

  // Prepare weekly activity chart data
  const getWeeklyActivityChartData = () => {
    if (!userStats?.weeklyActivity) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Minutes',
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
        ],
      };
    }

    // Reorder days to start with Monday
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap = userStats.weeklyActivity.reduce((acc, day) => {
      acc[day.day] = day.minutes;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: orderedDays,
      datasets: [
        {
          label: 'Minutes',
          data: orderedDays.map(day => dayMap[day] || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  };

  // Get muscle group data for the bar chart
  const getMuscleGroupData = () => {
    if (!userStats?.muscleGroups || userStats.muscleGroups.length === 0) {
      return {
        labels: ['No data available'],
        datasets: [
          {
            label: 'Exercises',
            data: [0],
            backgroundColor: ['rgba(200, 200, 200, 0.6)'],
          },
        ],
      };
    }

    // Sort muscle groups by count
    const sortedMuscleGroups = [...userStats.muscleGroups]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5); // Top 5 muscle groups

    const muscleGroupColors = {
      'Chest': 'rgba(255, 99, 132, 0.6)',
      'Back': 'rgba(54, 162, 235, 0.6)',
      'Legs': 'rgba(255, 206, 86, 0.6)',
      'Arms': 'rgba(75, 192, 192, 0.6)',
      'Shoulders': 'rgba(153, 102, 255, 0.6)',
      'Core': 'rgba(255, 159, 64, 0.6)',
      'Abs': 'rgba(255, 159, 64, 0.6)',
      'Calves': 'rgba(255, 206, 86, 0.6)',
      'Glutes': 'rgba(255, 206, 86, 0.6)',
      'Quadriceps': 'rgba(255, 206, 86, 0.6)',
      'Hamstrings': 'rgba(255, 206, 86, 0.6)',
      'Triceps': 'rgba(75, 192, 192, 0.6)',
      'Biceps': 'rgba(75, 192, 192, 0.6)',
    };

    return {
      labels: sortedMuscleGroups.map(group => group.name),
      datasets: [
        {
          label: 'Frequency',
          data: sortedMuscleGroups.map(group => group.percentage),
          backgroundColor: sortedMuscleGroups.map(group =>
            muscleGroupColors[group.name as keyof typeof muscleGroupColors] || 'rgba(200, 200, 200, 0.6)'
          ),
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Get personalized recommendation
  const getRecommendation = () => {
    if (!userStats?.muscleGroups || userStats.muscleGroups.length === 0) {
      return "Start tracking your workouts to get personalized recommendations.";
    }

    // Check if any major muscle group is underrepresented
    const muscleGroupMap = userStats.muscleGroups.reduce((acc, group) => {
      acc[group.name.toLowerCase()] = group.percentage;
      return acc;
    }, {} as Record<string, number>);

    const coreGroups = ['abs', 'core'];
    const hasCore = coreGroups.some(group => muscleGroupMap[group]);

    if (!hasCore || (muscleGroupMap['core'] || muscleGroupMap['abs'] || 0) < 10) {
      return "Your routine could benefit from adding exercises for Core to achieve a more balanced workout plan.";
    }

    const legGroups = ['legs', 'quadriceps', 'hamstrings', 'glutes', 'calves'];
    const hasLegs = legGroups.some(group => muscleGroupMap[group]);

    if (!hasLegs || legGroups.every(group => (muscleGroupMap[group] || 0) < 10)) {
      return "Consider adding more leg exercises to your routine for a more balanced approach.";
    }

    return "Your workout plan looks well-balanced! Keep up the good work.";
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-500 text-white px-6 py-4 text-center">
            <h2 className="text-xl font-bold">Progress Overview</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <span className="block text-4xl font-bold text-blue-600">
                  {userStats?.totalWorkouts || 0}
                </span>
                <span className="text-gray-600">Total Workouts</span>
              </div>

              <div className="bg-green-50 rounded-lg p-4 text-center">
                <span className="block text-4xl font-bold text-green-600">
                  {userStats?.completedWorkouts || 0}
                </span>
                <span className="text-gray-600">Completed</span>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <span className="block text-4xl font-bold text-purple-600">
                  {userStats?.totalExercises || 0}
                </span>
                <span className="text-gray-600">Total Exercises</span>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <span className="block text-4xl font-bold text-yellow-600">
                  {getCompletionRate()}
                </span>
                <span className="text-gray-600">Completion Rate</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-700 mb-2">Weekly Activity</h3>
              <div className="h-64">
                <Bar data={getWeeklyActivityChartData()} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Workouts */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-500 text-white px-6 py-4 text-center">
            <h2 className="text-xl font-bold">Upcoming Workouts</h2>
          </div>

          <div className="p-6">
            {upcomingWorkouts.length > 0 ? (
              <div className="space-y-6">
                {upcomingWorkouts.map((workout, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg">{workout.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {formatDate(workout.date)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{workout.duration} minutes</p>
                    <div className="mt-2 flex space-x-4">
                      <Link
                        to={`/workout/${workout.workoutId}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/workout-session/${workout._id}`}
                        className="text-green-600 hover:underline text-sm"
                      >
                        Start Workout
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No upcoming workouts</p>
                <Link
                  to="/workouts"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                >
                  Browse Workouts
                </Link>
              </div>
            )}

            {upcomingWorkouts.length > 0 && (
              <div className="mt-4 text-right">
                <Link to="/workouts" className="text-blue-600 hover:underline">
                  View All Workouts →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Muscle Group Focus */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 text-center">
            <h2 className="text-xl font-bold">Muscle Group Focus</h2>
          </div>

          <div className="p-6">
            <div className="h-64 mb-6">
              <Bar data={getMuscleGroupData()} options={chartOptions} />
            </div>

            <div>
              <h3 className="font-bold text-gray-700 mb-2">Recommendations</h3>
              <p className="text-gray-600 mb-4">{getRecommendation()}</p>
              <div className="text-right">
                <Link to="/ai-coach" className="text-blue-600 hover:underline">
                  Ask AI Coach for a balanced workout plan →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-4 text-center">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>

          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {activity.type === 'completed_workout' ? (
                        <div className="bg-green-100 rounded-full p-2 text-green-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : activity.type === 'ai_coach' ? (
                        <div className="bg-blue-100 rounded-full p-2 text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      ) : activity.type === 'exercise' ? (
                        <div className="bg-purple-100 rounded-full p-2 text-purple-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-full p-2 text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{activity.title}</h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.date)}
                        </span>
                      </div>

                      <div className="mt-2">
                        {activity.type === 'completed_workout' ? (
                          <Link to={`/workout/${activity.id}`} className="text-blue-600 hover:underline text-sm">
                            View Workout
                          </Link>
                        ) : activity.type === 'ai_coach' ? (
                          <Link to="/ai-coach" className="text-blue-600 hover:underline text-sm">
                            View Conversation
                          </Link>
                        ) : activity.type === 'exercise' ? (
                          <Link to={`/exercise/${activity.id}`} className="text-blue-600 hover:underline text-sm">
                            View Exercise
                          </Link>
                        ) : (
                          <Link to={`/workout/${activity.id}`} className="text-blue-600 hover:underline text-sm">
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
// src/pages/WorkoutSessionPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const WorkoutSessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [estimatedCalories, setEstimatedCalories] = useState(0);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [completionStats, setCompletionStats] = useState({
    duration: 0,
    caloriesBurned: 0
  });
  const API_URL = 'http://localhost:4000/api';

  // Fetch workout data
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        const data = await apiService.getWorkoutById(id as string);
        setWorkout(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching workout details:', err);
        setError('Failed to load workout details');
        setLoading(false);
      }
    };

    if (id) {
      fetchWorkout();
    }
  }, [id]);

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { profile } = await apiService.getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  // Timer functionality with calorie estimation
  useEffect(() => {
    // @ts-ignore
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer + 1;
          // Update calories estimation every minute
          if (newTimer % 60 === 0) {
            const durationMinutes = newTimer / 60;
            estimateCalories(durationMinutes);
          }
          return newTimer;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, workout, userProfile]);

  // Format time as MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Toggle timer
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Reset timer
  const resetTimer = () => {
    setTimer(0);
    setIsActive(false);
    setEstimatedCalories(0);
  };

  // Next exercise
  const nextExercise = () => {
    if (workout && currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  // Previous exercise
  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  // Estimate calories based on duration, workout type, and user profile
  const estimateCalories = (durationMinutes: number) => {
    if (!workout || !userProfile?.weight) {
      return 0; // Can't calculate without workout and weight
    }

    // Ensure duration is at least 1 minute
    durationMinutes = Math.max(1, durationMinutes);

    if (durationMinutes <= 0 || !workout || !userProfile?.weight) {
    return 0;
  }

    // Determine intensity based on workout level
    const intensity = workout.level === 'beginner' ? 'beginner' :
                      workout.level === 'intermediate' ? 'intermediate' : 'advanced';

    // Base MET values by intensity and workout type
    const metValues: Record<string, Record<string, number>> = {
      'strength': { 'beginner': 3.0, 'intermediate': 4.5, 'advanced': 6.0 },
      'cardio': { 'beginner': 4.0, 'intermediate': 7.0, 'advanced': 10.0 },
      'mixed': { 'beginner': 3.5, 'intermediate': 5.5, 'advanced': 8.0 },
      'general fitness': { 'beginner': 3.5, 'intermediate': 5.0, 'advanced': 6.5 }
    };

    // Get workout type or default to general fitness
    const workoutType = metValues[workout.goal] ? workout.goal : 'general fitness';

    // Calculate base MET
    const baseMet = metValues[workoutType][intensity];

    // Add bonus for more exercises (more varied workout)
    const exerciseBonus = Math.min(1.0, workout.exercises.length * 0.05);

    // Age adjustment
    let ageAdjustment = 1.0;
    if (userProfile.age) {
      if (userProfile.age > 50) ageAdjustment = 0.9;
      else if (userProfile.age > 40) ageAdjustment = 0.95;
    }

    // Gender adjustment
    let genderAdjustment = 1.0;
    if (userProfile.gender === 'female') genderAdjustment = 0.9;

    // Apply all adjustments
    const adjustedMet = baseMet * (1 + exerciseBonus) * ageAdjustment * genderAdjustment;

    // Calculate calories: MET * Weight (kg) * Duration (hours)
    const durationHours = durationMinutes / 60;
    const calories = adjustedMet * userProfile.weight * durationHours;

    // Update state with rounded value
    const estimatedCals = Math.round(calories);
    setEstimatedCalories(estimatedCals);

    return estimatedCals;
  };

  // Complete workout with calories data
  const completeWorkout = async () => {
  try {
    // Calculate duration in minutes, ensuring a minimum of 1 minute
    // if timer is active but less than 60 seconds
    const durationMinutes = Math.max(1, Math.ceil(timer / 60));

    // If timer is 0, set calories to 0 as well
    const caloriesBurned = timer === 0 ? 0 : estimateCalories(durationMinutes);

    console.log(`Completing workout ${id} with duration: ${durationMinutes} minutes, calories: ${caloriesBurned}`);

    // Use apiService to complete the workout
    const result = await apiService.completeWorkout(id as string, {
      duration: durationMinutes,
      caloriesBurned: caloriesBurned
    });

    // Show completion summary
    setCompletionStats({
      duration: durationMinutes,
      caloriesBurned: result.caloriesBurned || caloriesBurned
    });
    setShowCompletionSummary(true);
  } catch (error: any) {
    console.error('Error completing workout:', error);
    alert(`Failed to complete workout: ${error.message}`);
  }
};

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Failed to load workout"}
        </div>
        <Link to="/workouts" className="text-blue-600 hover:underline">
          Back to Workouts
        </Link>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/workouts" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Workouts
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">{workout.name}</h1>
          <p>{workout.description}</p>
        </div>

        <div className="p-6">
          {/* Timer control */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-center">
            <div className="text-3xl font-bold mb-4">{formatTime(timer)}</div>

            {/* Calories display */}
            {!userProfile?.weight ? (
              <div className="text-center bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 mb-2">
                  To see calorie estimates, add your weight to your profile
                </p>
                <Link
                  to="/profile"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg inline-block"
                >
                  Complete Profile
                </Link>
              </div>
            ) : (
              <div className="text-center mb-4">
                <span className="text-gray-600">Estimated calories: </span>
                <span className="font-bold text-orange-500 text-xl">{estimatedCalories}</span>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleTimer}
                className={`px-6 py-2 rounded-lg font-medium ${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                {isActive ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetTimer}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-medium"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Exercise navigation */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={prevExercise}
                disabled={currentExerciseIndex === 0}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={nextExercise}
                disabled={currentExerciseIndex === workout.exercises.length - 1}
                className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Current exercise */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <div className="bg-blue-50 p-4 border-b">
              <h3 className="text-lg font-bold">{currentExercise.name}</h3>
              <div className="text-sm text-gray-600">
                {currentExercise.sets} sets × {currentExercise.reps} reps | {currentExercise.rest_seconds} sec rest
              </div>
            </div>

            <div className="p-4">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500 font-medium">Equipment</div>
                  <div className="capitalize">{currentExercise.equipment}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 font-medium">Target Muscles</div>
                  <div className="capitalize">
                    {Array.isArray(currentExercise.primaryMuscles)
                      ? currentExercise.primaryMuscles.join(', ')
                      : currentExercise.primaryMuscles}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 font-medium">Secondary Muscles</div>
                  <div className="capitalize">
                    {Array.isArray(currentExercise.secondaryMuscles)
                      ? currentExercise.secondaryMuscles?.join(', ')
                      : currentExercise.secondaryMuscles || 'None'}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 font-medium mb-2">Instructions</div>
                <ol className="list-decimal list-inside space-y-1">
                  {Array.isArray(currentExercise.instructions) ? (
                    currentExercise.instructions.map((instruction: string, i: number) => (
                      <li key={i}>{instruction}</li>
                    ))
                  ) : (
                    <li>{currentExercise.instructions}</li>
                  )}
                </ol>
              </div>
            </div>
          </div>

          {/* Set tracker */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Set Tracker</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Set</th>
                    <th className="border p-2 text-left">Weight (kg)</th>
                    <th className="border p-2 text-left">Reps</th>
                    <th className="border p-2 text-left">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: currentExercise.sets }, (_, i) => (
                    <tr key={i} className="border">
                      <td className="border p-2">{i + 1}</td>
                      <td className="border p-2">
                        <input type="number" className="w-20 p-1 border rounded" min="0" />
                      </td>
                      <td className="border p-2">
                        <input type="number" className="w-20 p-1 border rounded" min="0" defaultValue={currentExercise.reps.split('-')[0]} />
                      </td>
                      <td className="border p-2">
                        <input type="checkbox" className="h-4 w-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Complete workout button */}
          <div className="text-center">
            <button
              onClick={completeWorkout}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete Workout
            </button>
          </div>
        </div>
      </div>

      {/* Workout Completion Summary Modal */}
      {showCompletionSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">Workout Complete!</h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">{completionStats.duration}</div>
                <div className="text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">{completionStats.caloriesBurned}</div>
                <div className="text-gray-600">Calories</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-green-600 font-medium mb-6">
                Great job! You've completed your workout.
              </p>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/workouts')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Back to Workouts
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutSessionPage;
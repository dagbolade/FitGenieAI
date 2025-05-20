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

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

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

  // Mark workout as completed (placeholder)
  const completeWorkout = () => {
    // Here you would call an API to mark the workout as completed
    // For now we'll just navigate back and show an alert
    alert("Workout completed! In a real app, this would be saved to your progress.");
    navigate('/workouts');
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
    </div>
  );
};

export default WorkoutSessionPage;
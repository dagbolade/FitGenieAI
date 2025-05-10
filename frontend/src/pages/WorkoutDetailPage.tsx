// frontend/src/pages/WorkoutDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  instructions: string[];
  images?: string[];
}

interface Workout {
  _id: string;
  name: string;
  description: string;
  goal: string;
  level: string;
  type: string;
  duration: number;
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
}

const WorkoutDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutDetail = async () => {
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
      fetchWorkoutDetail();
    }
  }, [id]);

  const handleStartWorkout = () => {
    alert(`Starting workout: ${workout?.name}`);
    // In a real app, this would navigate to a workout session page
    // or start a timer and tracking mechanism
  };

  const formatMusclesList = (muscles: string[] | string | undefined) => {
    if (!muscles) return '';
    if (typeof muscles === 'string') return muscles;
    return muscles.join(', ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/workouts" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Workouts
      </Link>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : workout ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">{workout.name}</h1>
            <p className="text-blue-100">{workout.description}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Level</div>
                <div className="font-medium capitalize">{workout.level}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Goal</div>
                <div className="font-medium capitalize">{workout.goal}</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">Type</div>
                <div className="font-medium capitalize">{workout.type}</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600">Duration</div>
                <div className="font-medium">{workout.duration} min</div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Exercises</h2>

              <div className="space-y-6">
                {workout.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <span className="inline-block bg-blue-600 text-white w-8 h-8 rounded-full mr-3 text-center leading-8">
                          {index + 1}
                        </span>
                        <h3 className="font-bold text-xl inline-block">{exercise.name}</h3>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium">
                        {exercise.sets} sets × {exercise.reps}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <div className="text-sm text-gray-500 font-medium mb-1">Equipment</div>
                          <div className="capitalize">{exercise.equipment}</div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 font-medium mb-1">Rest</div>
                          <div>{exercise.rest_seconds} seconds</div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 font-medium mb-1">Target Muscles</div>
                          <div>{formatMusclesList(exercise.primaryMuscles)}</div>
                        </div>
                      </div>

                      {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                        <div className="mb-6">
                          <div className="text-sm text-gray-500 font-medium mb-1">Secondary Muscles</div>
                          <div>{formatMusclesList(exercise.secondaryMuscles)}</div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm text-gray-500 font-medium mb-2">Instructions</div>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700">
                          {Array.isArray(exercise.instructions) ? (
                            exercise.instructions.map((instruction, i) => (
                              <li key={i} className="pl-2">
                                <span className="text-gray-800">{instruction}</span>
                              </li>
                            ))
                          ) : (
                            <li>{exercise.instructions}</li>
                          )}
                        </ol>
                      </div>

                      {/* Link to exercise detail if available */}
                      <div className="mt-4 text-right">
                        <Link
                          to={`/exercise/${exercise.id}`}
                          className="text-blue-600 hover:underline text-sm flex items-center justify-end"
                        >
                          <span>View exercise details</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleStartWorkout}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                Start Workout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <p className="text-yellow-800">Workout not found.</p>
          <Link to="/workouts" className="mt-4 inline-block text-blue-600 hover:underline">
            Browse all workouts
          </Link>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetailPage;
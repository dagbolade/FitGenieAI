// frontend/src/pages/WorkoutsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom'; // Add useNavigate
// Types
interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  equipment: string;
  primaryMuscles: string[];
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

interface GeneratorForm {
  goal: string;
  level: string;
  equipment: string[];
  duration: number;
  split_type: string;
  day: string;
}

const WorkoutsPage: React.FC = () => {
  // State for workouts and UI
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);


  const navigate = useNavigate();

  const handleStartWorkout = (workoutId: string) => {
    // Navigate to the workout session page with the workout ID
    navigate(`/workout-session/${workoutId}`);
  };

  // Form state for generator
  const [generatorForm, setGeneratorForm] = useState<GeneratorForm>({
    goal: 'general fitness',
    level: 'beginner',
    equipment: ['body only'],
    duration: 45,
    split_type: 'full body',
    day: 'push'
  });

  // Filter state
  const [filters, setFilters] = useState({
    level: '',
    goal: '',
    type: ''
  });

  // Equipment options
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);

  // Load equipment options from exercises
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        // Get unique equipment from exercises
        const exercisesData = await apiService.getExercises({ limit: 50 });
        const equipmentSet = new Set<string>();

        exercisesData.forEach((exercise: any) => {
          if (exercise.equipment) {
            equipmentSet.add(exercise.equipment);
          }
        });

        setEquipmentOptions(Array.from(equipmentSet).sort());
      } catch (err) {
        console.error('Error fetching equipment options:', err);
        // Fallback to static list if API fails
        setEquipmentOptions([
          'body only',
          'dumbbell',
          'barbell',
          'machine',
          'cable',
          'kettlebell',
          'bands'
        ]);
      }
    };

    fetchEquipment();
  }, []);

  // Load workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const data = await apiService.getWorkouts(filters);
        setWorkouts(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        setError('Failed to load workouts');
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [filters]);

  // Generate a workout
  const handleGenerateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Call the API to generate a workout
      const generatedWorkout = await apiService.generateWorkout(generatorForm);

      // Add the generated workout to our list
      setWorkouts(prevWorkouts => [generatedWorkout, ...prevWorkouts]);
      setShowGenerator(false);
      setLoading(false);

    } catch (err) {
      console.error('Error generating workout:', err);
      setError('Failed to generate workout. Please try again.');
      setLoading(false);
    }
  };

  // Handle form changes
  const handleGeneratorChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneratorForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle equipment selection (multiple select)
  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const options = e.target.options;
  const selectedEquipmentArray: string[] = []; // Add type annotation here

  for (let i = 0; i < options.length; i++) {
    if (options[i].selected) {
      selectedEquipmentArray.push(options[i].value);
    }
  }

  setGeneratorForm(prev => ({
    ...prev,
    equipment: selectedEquipmentArray
  }));
};

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteWorkout = async (workoutId: string) => {
  try {
    await apiService.deleteWorkout(workoutId);
    // Refresh workouts list after deletion
    setWorkouts(prev => prev.filter(w => w._id !== workoutId));
  } catch (error) {
    console.error('Error deleting workout:', error);
    setError('Failed to delete workout. Please try again.');
  }
};


  // Reset filters
  const resetFilters = () => {
    setFilters({
      level: '',
      goal: '',
      type: ''
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {showGenerator ? 'View All Workouts' : 'Create Custom Workout'}
        </button>
      </div>

      {showGenerator ? (
        // Workout Generator Form
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Generate Custom Workout</h2>

          <form onSubmit={handleGenerateWorkout}>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Fitness Goal</label>
                <select
                  name="goal"
                  value={generatorForm.goal}
                  onChange={handleGeneratorChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="general fitness">General Fitness</option>
                  <option value="strength">Strength</option>
                  <option value="muscle building">Muscle Building</option>
                  <option value="fat loss">Fat Loss</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Experience Level</label>
                <select
                  name="level"
                  value={generatorForm.level}
                  onChange={handleGeneratorChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">expert</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Workout Type</label>
                <select
                  name="split_type"
                  value={generatorForm.split_type}
                  onChange={handleGeneratorChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="full body">Full Body</option>
                  <option value="upper lower">Upper/Lower</option>
                  <option value="ppl">Push/Pull/Legs</option>
                </select>
              </div>

              {generatorForm.split_type === 'ppl' && (
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Day</label>
                  <select
                    name="day"
                    value={generatorForm.day}
                    onChange={handleGeneratorChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="push">Push</option>
                    <option value="pull">Pull</option>
                    <option value="legs">Legs</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Duration (minutes)</label>
                <select
                  name="duration"
                  value={generatorForm.duration.toString()}
                  onChange={handleGeneratorChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2 font-medium">Available Equipment</label>
                <select
                  name="equipment"
                  multiple
                  value={generatorForm.equipment}
                  onChange={handleEquipmentChange}
                  className="w-full p-3 border border-gray-300 rounded-lg h-36"
                  required
                >
                  {equipmentOptions.map(equipment => (
                    <option key={equipment} value={equipment}>
                      {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Generating Workout...' : 'Generate Workout'}
            </button>
          </form>
        </div>
      ) : (
        // Workouts List View
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Filter Workouts</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Level</label>
                <select
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">expert</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Goal</label>
                <select
                  name="goal"
                  value={filters.goal}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Goals</option>
                  <option value="general fitness">General Fitness</option>
                  <option value="strength">Strength</option>
                  <option value="muscle building">Muscle Building</option>
                  <option value="fat loss">Fat Loss</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Workout Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Types</option>
                  <option value="full body">Full Body</option>
                  <option value="push">Push</option>
                  <option value="pull">Pull</option>
                  <option value="legs">Legs</option>
                  <option value="upper lower">Upper/Lower</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Workouts Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          ) : workouts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">No workouts found. Generate your first workout!</p>
              <button
                onClick={() => setShowGenerator(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Workout
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {workouts.map(workout => (
                <div key={workout._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{workout.name}</h3>
                    <p className="text-gray-600 mb-4">{workout.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {workout.level}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {workout.goal}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {workout.type}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {workout.duration} min
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        {workout.exercises.length} exercises
                      </p>
                      <div className="mt-2 text-sm text-gray-600 overflow-hidden h-24">
                        <ul className="list-disc pl-5">
                          {workout.exercises.slice(0, 3).map(exercise => (
                              <li key={exercise.id}>{exercise.name}</li>
                          ))}
                          {workout.exercises.length > 3 && (
                              <li>...and {workout.exercises.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="flex mt-4 space-x-2">
                      <Link
                          to={`/workout/${workout._id}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                          onClick={() => handleStartWorkout(workout._id)}
                      >
                        Start Workout
                      </button>
                      <button
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this workout?')) {
                              handleDeleteWorkout(workout._id);
                            }
                          }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkoutsPage;
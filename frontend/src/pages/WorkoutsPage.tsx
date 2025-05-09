// src/pages/WorkoutsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

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
  id?: string;
  name: string;
  description: string;
  goal: string;
  level: string;
  type: string;
  duration: number;
  exercises: Exercise[];
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
  
  // Equipment options from database
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);
  
  // Get available equipment options
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        // If you have an API endpoint for equipment, use it
        // const data = await apiService.getEquipmentTypes();
        // setEquipmentOptions(data);
        
        // For now, use a static list
        setEquipmentOptions([
          'body only',
          'dumbbell',
          'barbell',
          'machine',
          'cable',
          'kettlebell',
          'bands',
          'medicine ball',
          'exercise ball',
          'foam roll'
        ]);
      } catch (err) {
        console.error('Error fetching equipment options:', err);
      }
    };
    
    fetchEquipment();
  }, []);
  
  // Load saved workouts (would connect to backend in real app)
  useEffect(() => {
    // In a real app, this would fetch from API
    // This is a mock implementation for now
    const mockWorkouts: Workout[] = [
      {
        id: '1',
        name: 'Full Body Strength',
        description: 'A complete workout to build strength across all major muscle groups.',
        goal: 'strength',
        level: 'intermediate',
        type: 'full body',
        duration: 60,
        exercises: [
          {
            id: 'ex1',
            name: 'Barbell Bench Press',
            sets: 5,
            reps: '5',
            rest_seconds: 180,
            equipment: 'barbell',
            primaryMuscles: ['chest'],
            instructions: [
              'Lie on a flat bench with your feet flat on the floor.',
              'Grip the barbell with hands slightly wider than shoulder-width.',
              'Lower the bar to your mid-chest.',
              'Press the bar back up to return to starting position.'
            ]
          },
          {
            id: 'ex2',
            name: 'Barbell Squat',
            sets: 5,
            reps: '5',
            rest_seconds: 180,
            equipment: 'barbell',
            primaryMuscles: ['quadriceps', 'glutes'],
            instructions: [
              'Stand with feet shoulder-width apart, barbell across upper back.',
              'Bend knees and lower hips back and down until thighs are parallel to floor.',
              'Return to standing position.'
            ]
          },
          {
            id: 'ex3',
            name: 'Pull-Up',
            sets: 3,
            reps: '8-10',
            rest_seconds: 120,
            equipment: 'body only',
            primaryMuscles: ['lats', 'biceps'],
            instructions: [
              'Hang from pull-up bar with hands shoulder-width apart.',
              'Pull yourself up until chin clears the bar.',
              'Lower back to starting position with control.'
            ]
          }
        ]
      },
      {
        id: '2',
        name: 'Push Day for Hypertrophy',
        description: 'Focus on chest, shoulders, and triceps for muscle growth.',
        goal: 'muscle building',
        level: 'intermediate',
        type: 'push',
        duration: 45,
        exercises: [
          {
            id: 'ex4',
            name: 'Dumbbell Bench Press',
            sets: 4,
            reps: '10-12',
            rest_seconds: 90,
            equipment: 'dumbbell',
            primaryMuscles: ['chest'],
            instructions: [
              'Lie on a flat bench with a dumbbell in each hand.',
              'Press the dumbbells upward until your arms are extended.',
              'Lower the dumbbells to your chest.'
            ]
          }
        ]
      }
    ];
    
    setWorkouts(mockWorkouts);
  }, []);
  
  // Generate a workout
  const handleGenerateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Call the API to generate a workout (in a real app)
      // const generatedWorkout = await apiService.generateWorkout(generatorForm);
      
      // Mock response for now
      const mockGeneratedWorkout: Workout = {
        id: `gen-${Date.now()}`,
        name: `${generatorForm.day.charAt(0).toUpperCase() + generatorForm.day.slice(1)} Day for ${
          generatorForm.goal.charAt(0).toUpperCase() + generatorForm.goal.slice(1)
        }`,
        description: `A personalized ${generatorForm.split_type} workout focused on ${generatorForm.goal} for ${generatorForm.level} level.`,
        goal: generatorForm.goal,
        level: generatorForm.level,
        type: generatorForm.day || generatorForm.split_type,
        duration: generatorForm.duration,
        exercises: [
          {
            id: 'gen-ex1',
            name: 'Dumbbell Bench Press',
            sets: 4,
            reps: '10-12',
            rest_seconds: 90,
            equipment: 'dumbbell',
            primaryMuscles: ['chest'],
            instructions: [
              'Lie on a flat bench with a dumbbell in each hand.',
              'Press the dumbbells upward until your arms are extended.',
              'Lower the dumbbells to your chest.'
            ]
          },
          {
            id: 'gen-ex2',
            name: 'Incline Dumbbell Press',
            sets: 3,
            reps: '10-12',
            rest_seconds: 90,
            equipment: 'dumbbell',
            primaryMuscles: ['chest', 'shoulders'],
            instructions: [
              'Set an adjustable bench to an incline of 30-45 degrees.',
              'Lie on the bench with a dumbbell in each hand.',
              'Press the dumbbells upward until your arms are extended.',
              'Lower the dumbbells to your upper chest.'
            ]
          },
          {
            id: 'gen-ex3',
            name: 'Tricep Pushdown',
            sets: 3,
            reps: '12-15',
            rest_seconds: 60,
            equipment: 'cable',
            primaryMuscles: ['triceps'],
            instructions: [
              'Stand facing a cable machine with a straight bar attachment.',
              'Grasp the bar with an overhand grip.',
              'Keeping your elbows at your sides, push the bar down until your arms are fully extended.',
              'Slowly return to the starting position.'
            ]
          }
        ]
      };
      
      setWorkouts(prevWorkouts => [mockGeneratedWorkout, ...prevWorkouts]);
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
    const selectedEquipment = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedEquipment.push(options[i].value);
      }
    }
    
    setGeneratorForm(prev => ({
      ...prev,
      equipment: selectedEquipment
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
  
  // Apply filters to workouts
  const getFilteredWorkouts = () => {
    return workouts.filter(workout => {
      if (filters.level && workout.level !== filters.level) return false;
      if (filters.goal && workout.goal !== filters.goal) return false;
      if (filters.type && workout.type !== filters.type) return false;
      return true;
    });
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
                  <option value="advanced">Advanced</option>
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
                  <option value="advanced">Advanced</option>
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
          ) : getFilteredWorkouts().length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">No workouts found matching your criteria.</p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
                <button 
                  onClick={() => setShowGenerator(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Workout
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {getFilteredWorkouts().map(workout => (
                <div key={workout.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                    
                    <div className="flex space-x-2">
                      <Link 
                        to={`/workout/${workout.id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                      >
                        View Details
                      </Link>
                      <button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                        onClick={() => alert('Start workout feature coming soon!')}
                      >
                        Start Workout
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
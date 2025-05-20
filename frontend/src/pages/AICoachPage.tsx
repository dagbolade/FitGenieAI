// src/pages/AICoachPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

// Types for our components
interface Message {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface RelevantExercise {
  _id: string;
  name: string;
  primaryMuscles: string[];
  equipment: string;
  level: string;
  mechanic?: string;
  instructions?: string[];
  images?: string[];
}

interface PopularQuestion {
  id: number;
  question: string;
  category: string;
}

const AICoachPage: React.FC = () => {
  // State for chat functionality
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [relevantExercises, setRelevantExercises] = useState<RelevantExercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [setError] = useState<string | null>(null);

  // State for popular questions
  const [popularQuestions] = useState<PopularQuestion[]>([
    {
      id: 1,
      question: "What are the best exercises for building chest muscles?",
      category: "muscle building"
    },
    {
      id: 2,
      question: "How many days per week should I work out?",
      category: "general fitness"
    },
    {
      id: 3,
      question: "What exercises can I do with just dumbbells?",
      category: "home workout"
    },
    {
      id: 4,
      question: "How can I improve my squat form?",
      category: "technique"
    },
    {
      id: 5,
      question: "What should I eat before and after a workout?",
      category: "nutrition"
    }
  ]);

  // State for workout creation
  const [showNewWorkoutDialog, setShowNewWorkoutDialog] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');

  // Auto-scroll to bottom of chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message on component mount
  useEffect(() => {
    setMessages([
      {
        type: 'ai',
        content: 'Hello! I\'m your AI fitness coach. Ask me about workouts, exercises, fitness goals, or anything related to your fitness journey.',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Handle form submission (sending a new question)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Call the backend AI coach endpoint
      const response = await apiService.askCoach(input);

      // Add AI response to chat
      const aiMessage: Message = {
        type: 'ai',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update relevant exercises if available
      if (response.relevant_exercises && response.relevant_exercises.length > 0) {
        setRelevantExercises(response.relevant_exercises);
      }
    } catch (err) {
      console.error('Error asking AI coach:', err);
      setError('Sorry, I\'m having trouble responding right now. Please try again later.');

      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: 'Sorry, I\'m having trouble responding right now. Please try again later.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding/removing exercises to selection
  const toggleExerciseSelection = (exerciseId: string) => {
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(prev => prev.filter(id => id !== exerciseId));
    } else {
      setSelectedExercises(prev => [...prev, exerciseId]);
    }
  };

  // Handle creating a new workout
  // Update this function in your AICoachPage.tsx
const handleCreateWorkout = async () => {
  if (!newWorkoutName.trim() || selectedExercises.length === 0) return;

  try {
    // Format the selected exercises in the correct structure
    const formattedExercises = selectedExercises.map(id => {
      const exercise = relevantExercises.find(ex => ex._id === id);
      return {
        id: exercise?._id || '',
        name: exercise?.name || '',
        sets: 3, // Default values
        reps: '10-12',
        rest_seconds: 60,
        equipment: exercise?.equipment || '',
        primaryMuscles: exercise?.primaryMuscles || [],
        instructions: exercise?.instructions || []
      };
    });

    // Create new workout with exercises already included
    // const newWorkout = await apiService.createWorkout({
    //   name: newWorkoutName,
    //   description: `Workout created from AI Coach recommendations`,
    //   goal: "custom",
    //   level: "beginner",
    //   type: "custom",
    //   duration: 45,
    //   exercises: formattedExercises // Include exercises directly here
    // });

    // Show success message
    setShowNewWorkoutDialog(false);
    setNewWorkoutName('');
    setSelectedExercises([]);

    // Show success message as an AI message
    setMessages(prev => [
      ...prev,
      {
        type: 'ai',
        content: `Great! I've created a new workout called "${newWorkoutName}" with ${selectedExercises.length} exercises. You can find it in your workouts section.`,
        timestamp: new Date()
      }
    ]);
  } catch (error) {
    console.error('Error creating workout:', error);
    setError('Failed to create workout. Please try again.');
  }
};

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Fitness Coach</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Chat interface */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4">
              <h2 className="font-bold text-xl">Ask Your Coach</h2>
              <p className="text-blue-100 text-sm">Get personalized advice on fitness, nutrition, and training</p>
            </div>

            <div className="p-6">
              {/* Chat messages */}
              <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg p-4 max-w-[80%] ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-scroll anchor */}
                <div ref={chatEndRef}></div>
              </div>

              {/* Input form */}
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="flex">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me about exercises, workouts, or fitness advice..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg disabled:bg-blue-300"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div>
          {/* Relevant exercises panel with improved UX */}
          {relevantExercises.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              {/* Redesigned header with a more prominent call to action */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5">
                <h2 className="font-bold text-xl mb-1">Recommended Exercises</h2>
                <p className="text-green-100 text-sm">Based on your fitness goals</p>
              </div>

              {/* Exercise selection counter and CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-3 border-b flex justify-between items-center">
                <div className="flex items-center">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                    selectedExercises.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  } text-xs font-medium mr-2`}>
                    {selectedExercises.length}
                  </span>
                  <span className="text-gray-700 font-medium">
                    {selectedExercises.length === 0
                      ? "Tap cards to select exercises"
                      : selectedExercises.length === 1
                        ? "1 exercise selected"
                        : `${selectedExercises.length} exercises selected`}
                  </span>
                </div>

                {selectedExercises.length > 0 && (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded-full flex items-center transition-all transform hover:scale-105 shadow-sm"
                    onClick={() => setShowNewWorkoutDialog(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Workout
                  </button>
                )}
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  {relevantExercises.map((exercise) => (
                    <div
                      key={exercise._id}
                      className={`group border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                        selectedExercises.includes(exercise._id) 
                          ? 'border-green-500 shadow-md transform translate-x-1' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow'
                      }`}
                      onClick={() => toggleExerciseSelection(exercise._id)}
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Exercise image or icon placeholder */}
                        <div className={`w-full sm:w-24 h-24 flex items-center justify-center ${
                          selectedExercises.includes(exercise._id) 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M12 4v16m8-8H4" />
                          </svg>
                        </div>

                        {/* Exercise details */}
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{exercise.name}</h3>

                            {/* "Add to Workout" button that appears on hover */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExerciseSelection(exercise._id);
                              }}
                              className={`ml-2 flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
                                selectedExercises.includes(exercise._id)
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity'
                              }`}
                            >
                              {selectedExercises.includes(exercise._id) ? 'Selected ✓' : 'Add +'}
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {exercise.level}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {exercise.equipment}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {Array.isArray(exercise.primaryMuscles)
                                ? exercise.primaryMuscles.join(', ')
                                : exercise.primaryMuscles}
                            </span>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <Link
                              to={`/exercise/${exercise._id}`}
                              className="text-blue-600 hover:underline text-sm flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>View details</span>
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

                            {/* Checkbox that shows on hover */}
                            <div
                              className={`w-6 h-6 flex items-center justify-center rounded-full cursor-pointer ${
                                selectedExercises.includes(exercise._id)
                                  ? 'bg-green-500 text-white'
                                  : 'border border-gray-300 group-hover:border-blue-400'
                              }`}
                            >
                              {selectedExercises.includes(exercise._id) && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fab button that appears when exercises are selected */}
                {selectedExercises.length > 0 && (
                  <div className="fixed bottom-6 right-6 z-10">
                    <button
                      onClick={() => setShowNewWorkoutDialog(true)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform hover:scale-105 transition-all hover:shadow-xl"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <div className="absolute -top-10 right-0 bg-white text-gray-800 rounded-lg px-3 py-1 shadow-md text-sm font-medium">
                      {selectedExercises.length} selected
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Example questions panel */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-yellow-500 text-white px-6 py-4">
              <h2 className="font-bold text-xl">Sample Questions</h2>
            </div>

            <div className="p-6">
              <ul className="space-y-3">
                {popularQuestions.map((q) => (
                  <li key={q.id}>
                    <button
                      onClick={() => setInput(q.question)}
                      className="text-left text-blue-600 hover:underline w-full"
                    >
                      {q.question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Workout Creation Dialog */}
      {showNewWorkoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-0 w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
            {/* Dialog header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4">
              <h3 className="text-xl font-bold">Create Your Custom Workout</h3>
              <p className="text-blue-100 text-sm mt-1">
                Using your {selectedExercises.length} selected exercise{selectedExercises.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="p-6">
              {/* Workout name input */}
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">Name Your Workout</label>
                <input
                  type="text"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="e.g., Chest Day, Full Body Blast..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Selected exercises list */}
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">Selected Exercises</label>
                <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                  {selectedExercises.map((id, index) => {
                    const exercise = relevantExercises.find(e => e._id === id);
                    return exercise ? (
                      <div key={id} className="flex items-center justify-between py-2 px-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-medium mr-3">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-800">{exercise.name}</p>
                            <p className="text-xs text-gray-500">{exercise.equipment} • {exercise.level}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleExerciseSelection(id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowNewWorkoutDialog(false)}
                  className="flex-1 py-3 px-5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkout}
                  disabled={!newWorkoutName.trim() || selectedExercises.length === 0}
                  className="flex-1 py-3 px-5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                >
                  Create Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoachPage;
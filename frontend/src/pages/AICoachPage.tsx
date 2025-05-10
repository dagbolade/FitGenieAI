// src/pages/AICoachPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

interface Message {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface RelevantExercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  equipment: string;
  level: string;
}

const AICoachPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [relevantExercises, setRelevantExercises] = useState<RelevantExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          {/* Relevant exercises panel */}
          {relevantExercises.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              <div className="bg-green-600 text-white px-6 py-4">
                <h2 className="font-bold text-xl">Recommended Exercises</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {relevantExercises.map((exercise, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-bold text-lg mb-2">{exercise.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Target: {Array.isArray(exercise.primaryMuscles)
                          ? exercise.primaryMuscles.join(', ')
                          : exercise.primaryMuscles}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Equipment: {exercise.equipment}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        Level: {exercise.level}
                      </p>
                      <Link
                        to={`/exercise/${exercise.id}`}
                        className="text-blue-600 hover:underline text-sm flex items-center"
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
                    </div>
                  ))}
                </div>
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
                <li>
                  <button
                    onClick={() => setInput("What's a good workout for building chest muscles?")}
                    className="text-left text-blue-600 hover:underline w-full"
                  >
                    What's a good workout for building chest muscles?
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setInput("How many days per week should I work out?")}
                    className="text-left text-blue-600 hover:underline w-full"
                  >
                    How many days per week should I work out?
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setInput("What exercises can I do with just dumbbells?")}
                    className="text-left text-blue-600 hover:underline w-full"
                  >
                    What exercises can I do with just dumbbells?
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setInput("How can I improve my squat form?")}
                    className="text-left text-blue-600 hover:underline w-full"
                  >
                    How can I improve my squat form?
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setInput("What should I eat before and after a workout?")}
                    className="text-left text-blue-600 hover:underline w-full"
                  >
                    What should I eat before and after a workout?
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoachPage;
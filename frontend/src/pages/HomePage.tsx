// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-6">
              Your AI-Powered <span className="text-yellow-300">Fitness Coach</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Get personalized workout plans, track your progress, and achieve your fitness goals with the help of artificial intelligence.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/workouts"
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-lg shadow-lg transition-all hover:shadow-xl"
              >
                Start Training
              </Link>
              <Link
                to="/dashboard"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold px-6 py-3 rounded-lg shadow-lg transition-all"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How FitGenieAI Works</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                🏋️
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Smart Workout Planner</h3>
              <p className="text-gray-600">
                Intelligent workout recommendations based on your goals, equipment, and fitness level.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                📊
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Progress Tracking</h3>
              <p className="text-gray-600">
                Visualize your fitness journey with detailed analytics and insights.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                🤖
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">AI Coach</h3>
              <p className="text-gray-600">
                Get personalized advice and answers to your fitness questions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Fitness Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who have achieved their fitness goals with FitGenieAI.
          </p>
          <Link
            to="/workouts"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-lg text-lg shadow-lg inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}
// frontend/src/components/ExerciseCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function ExerciseCard({ exercise }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image display */}
      <div className="h-48 bg-gray-200 relative">
        {exercise.images && exercise.images.length > 0 ? (
          <img
            src={exercise.images[0]}
            alt={exercise.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-exercise.jpg'; // Fallback image
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}

        {/* Multiple images indicator */}
        {exercise.images && exercise.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            +{exercise.images.length - 1} more
          </div>
        )}
      </div>

      {/* Exercise details */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{exercise.name}</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {exercise.level}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            {exercise.equipment}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          {exercise.primaryMuscles.join(', ')}
        </p>

        <Link
          to={`/exercise/${exercise.id}`}
          className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
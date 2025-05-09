// src/pages/ExerciseDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

const ExerciseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to correctly handle image paths
  const getImageUrl = (imagePath: string): string => {
    // Check if the path is a full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // For relative paths, add the /images/ prefix if not already there
    return imagePath.startsWith('/images/') ? imagePath : `/images/${imagePath}`;
  };

  useEffect(() => {
    const fetchExerciseDetail = async () => {
      try {
        setLoading(true);
        const data = await apiService.getExerciseById(id as string);

        // Process images array if needed
        if (data && data.images) {
          // Convert string representation of an array to actual array if needed
          if (typeof data.images === 'string' && data.images.includes('[')) {
            try {
              // Handle potential JSON format: ['path1', 'path2']
              const parsedImages = JSON.parse(data.images.replace(/'/g, '"'));
              data.images = parsedImages;
            } catch (e) {
              console.error('Error parsing image paths:', e);
              // If parsing fails, try simple string split
              data.images = data.images
                .replace(/[\[\]']/g, '')
                .split(',')
                .map((path: string) => path.trim());
            }
          } else if (typeof data.images === 'string') {
            // Handle comma-separated string format: path1,path2
            data.images = data.images.split(',').map((path: string) => path.trim());
          }
        }

        setExercise(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exercise details:', err);
        setError('Failed to load exercise details');
        setLoading(false);
      }
    };

    if (id) {
      fetchExerciseDetail();
    }
  }, [id]);

  // Handle image navigation
  const nextImage = () => {
    if (exercise?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % exercise.images.length);
    }
  };

  const prevImage = () => {
    if (exercise?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + exercise.images.length) % exercise.images.length);
    }
  };

  // Format array or string for display
  const formatArray = (arr: any): string => {
    if (Array.isArray(arr)) {
      return arr.join(', ');
    }
    return arr || '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/exercises" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Exercise Library
      </Link>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : exercise ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image gallery */}
          {exercise?.images && Array.isArray(exercise.images) && exercise.images.length > 0 ? (
            <div className="relative bg-gray-100 h-96 flex items-center justify-center">
              <img
                src={getImageUrl(exercise.images[currentImageIndex])}
                alt={`${exercise.name} demonstration`}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  // Fallback for image errors with detailed logging
                  console.error(`Failed to load image: ${exercise.images[currentImageIndex]}`);
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
                }}
              />

              {exercise.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    aria-label="Previous image"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    aria-label="Next image"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                    {currentImageIndex + 1} / {exercise.images.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No images available</span>
            </div>
          )}

          {/* Exercise details */}
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1">Level</h3>
                <p className="capitalize">{exercise.level}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-1">Equipment</h3>
                <p>{exercise.equipment}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-1">Type</h3>
                <p>{exercise.force} / {exercise.mechanic}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Muscles Worked</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-1">Primary</h3>
                  <p>{formatArray(exercise.primaryMuscles)}</p>
                </div>

                {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-1">Secondary</h3>
                    <p>{formatArray(exercise.secondaryMuscles)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Instructions</h2>
              <ol className="list-decimal pl-5 space-y-2">
                {Array.isArray(exercise.instructions) ? (
                  exercise.instructions.map((instruction: string, index: number) => (
                    <li key={index} className="text-gray-700">{instruction}</li>
                  ))
                ) : (
                  <li className="text-gray-700">{exercise.instructions}</li>
                )}
              </ol>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => alert('This feature will be implemented in the Workouts section!')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Add to Workout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <p className="text-yellow-800">Exercise not found.</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetailPage;
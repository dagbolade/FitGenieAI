// src/pages/ExercisesPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

const ExercisesPage: React.FC = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering states
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    muscle: '',
    equipment: '',
    level: ''
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(24);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        // Get all exercises
        const data = await apiService.getExercises({ limit: 1000 });
        setExercises(data);

        // Extract unique muscle groups and equipment types
        const muscles = new Set<string>();
        const equipment = new Set<string>();

        data.forEach((ex: any) => {
          if (Array.isArray(ex.primaryMuscles)) {
            ex.primaryMuscles.forEach((muscle: string) => muscles.add(muscle));
          } else if (typeof ex.primaryMuscles === 'string') {
            muscles.add(ex.primaryMuscles);
          }

          if (ex.equipment) equipment.add(ex.equipment);
        });

        setMuscleGroups(Array.from(muscles).sort());
        setEquipmentTypes(Array.from(equipment).sort());

        // Initially set filtered exercises to all exercises
        setFilteredExercises(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Failed to load exercises');
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Apply filtering and searching
  useEffect(() => {
    // Apply filters and search
    let result = [...exercises];

    // Filter by muscle
    if (filters.muscle) {
      result = result.filter((ex) => {
        if (Array.isArray(ex.primaryMuscles)) {
          return ex.primaryMuscles.includes(filters.muscle);
        } else if (typeof ex.primaryMuscles === 'string') {
          return ex.primaryMuscles === filters.muscle;
        }
        return false;
      });
    }

    // Filter by equipment
    if (filters.equipment) {
      result = result.filter((ex) => ex.equipment === filters.equipment);
    }

    // Filter by level
    if (filters.level) {
      result = result.filter((ex) => ex.level === filters.level);
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((ex) =>
        ex.name.toLowerCase().includes(term) ||
        (Array.isArray(ex.primaryMuscles) && ex.primaryMuscles.some((m: string) => m.toLowerCase().includes(term))) ||
        (typeof ex.primaryMuscles === 'string' && ex.primaryMuscles.toLowerCase().includes(term))
      );
    }

    // Set filtered exercises
    setFilteredExercises(result);

  }, [exercises, filters, searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  // Calculate pagination values
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      muscle: '',
      equipment: '',
      level: ''
    });
    setSearchTerm('');
  };

  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Exercise Library</h1>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Search Exercises</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by exercise name or muscle group..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Muscle Group</label>
            <select
              name="muscle"
              value={filters.muscle}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">All Muscle Groups</option>
              {muscleGroups.map(muscle => (
                <option key={muscle} value={muscle}>{muscle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Equipment</label>
            <select
              name="equipment"
              value={filters.equipment}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">All Equipment</option>
              {equipmentTypes.map(equipment => (
                <option key={equipment} value={equipment}>{equipment}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Level</label>
            <select
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">expert</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results count and top pagination */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          {loading ? (
            <p>Loading exercises...</p>
          ) : (
            <p className="text-gray-600">
              Showing {currentExercises.length} of {filteredExercises.length} exercises
            </p>
          )}
        </div>

        {/* Top Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              Previous
            </button>

            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Exercise grid */}
      <div id="exercise-list" className="mb-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
            <p className="text-yellow-800">No exercises found matching your criteria.</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentExercises.map((exercise: any) => (
              <Link
                to={`/exercise/${exercise.id}`}
                key={exercise.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">{exercise.name}</h3>
                <p className="text-sm text-gray-600">
                  {Array.isArray(exercise.primaryMuscles)
                    ? exercise.primaryMuscles.join(', ')
                    : exercise.primaryMuscles}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              First
            </button>

            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Show pages around current page
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              Next
            </button>

            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisesPage;
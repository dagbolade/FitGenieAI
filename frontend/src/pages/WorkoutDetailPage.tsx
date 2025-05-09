import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import WorkoutDetail from '../components/WorkoutDetail';

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkout, isLoading, error, fetchWorkoutById } = useWorkoutStore();

  useEffect(() => {
    if (id) {
      fetchWorkoutById(id);
    }
  }, [id, fetchWorkoutById]);

  const handleStartWorkout = () => {
    // In a real app, you'd track the workout session
    alert('Workout started! In a real app, this would begin tracking your session.');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <button
          className="mt-2 text-primary-500 hover:underline"
          onClick={() => navigate('/workouts')}
        >
          Back to Workouts
        </button>
      </div>
    );
  }

  if (!currentWorkout) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Workout not found</p>
        <button
          className="mt-4 btn btn-primary"
          onClick={() => navigate('/workouts')}
        >
          Back to Workouts
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        className="mb-4 text-primary-500 hover:underline flex items-center"
        onClick={() => navigate('/workouts')}
      >
        ← Back to Workouts
      </button>

      <WorkoutDetail
        workout={currentWorkout}
        onStartWorkout={handleStartWorkout}
      />
    </div>
  );
}
import type {Workout} from '../api/workoutService';

interface WorkoutCardProps {
  workout: Workout;
  onClick?: () => void;
}

export default function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <h3 className="text-xl font-bold mb-2">{workout.name}</h3>
      <p className="text-gray-600 mb-4">{workout.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          {workout.level}
        </span>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
          {workout.goal}
        </span>
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
          {workout.type}
        </span>
        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
          {workout.duration} min
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {workout.exercises.length} exercises
        </span>
        <button className="btn btn-primary">View Details</button>
      </div>
    </div>
  );
}
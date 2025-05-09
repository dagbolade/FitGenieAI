import type {Workout} from '../api/workoutService';

interface WorkoutDetailProps {
  workout: Workout;
  onStartWorkout?: () => void;
}

export default function WorkoutDetail({ workout, onStartWorkout }: WorkoutDetailProps) {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">{workout.name}</h2>
          <p className="text-gray-600">{workout.description}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={onStartWorkout}
        >
          Start Workout
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">Level</div>
          <div className="font-semibold">{workout.level}</div>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">Goal</div>
          <div className="font-semibold">{workout.goal}</div>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">Type</div>
          <div className="font-semibold">{workout.type}</div>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">Duration</div>
          <div className="font-semibold">{workout.duration} min</div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Exercises</h3>

      <div className="space-y-4">
        {workout.exercises.map((exercise, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <div className="flex justify-between">
              <h4 className="font-bold">{exercise.name}</h4>
              <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {exercise.sets} sets × {exercise.reps}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Equipment:</span> {exercise.equipment}
              </div>
              <div>
                <span className="text-gray-500">Rest:</span> {exercise.rest} sec
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Target muscles:</span> {exercise.muscleGroup.join(', ')}
              </div>
            </div>

            {exercise.instructions && (
              <details className="mt-2">
                <summary className="text-primary-500 cursor-pointer">Instructions</summary>
                <ol className="mt-2 pl-5 list-decimal space-y-1">
                  {exercise.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
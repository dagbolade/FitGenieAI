// backend/src/utils/exerciseUtils.ts
import Exercise from '../models/Exercise';

// Function to find exercises that are relevant to a query
export async function getSimilarExercises(query: string, limit: number = 5): Promise<any[]> {
  // Extract potential muscle groups from query
  const muscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'core'
  ];

  const matchedMuscles = muscleGroups.filter(muscle =>
    query.toLowerCase().includes(muscle)
  );

  // If muscle groups mentioned, prioritize exercises for those muscles
  if (matchedMuscles.length > 0) {
    const exercises = await Exercise.find({
      primaryMuscles: { $in: matchedMuscles }
    }).limit(limit);

    if (exercises.length > 0) {
      return exercises;
    }
  }

  // Extract potential equipment from query
  const equipmentTypes = [
    'barbell', 'dumbbell', 'machine', 'cable', 'body', 'kettlebell', 'bands'
  ];

  const matchedEquipment = equipmentTypes.filter(equipment =>
    query.toLowerCase().includes(equipment)
  );

  // If equipment mentioned, filter by equipment
  if (matchedEquipment.length > 0) {
    const exercises = await Exercise.find({
      equipment: { $in: matchedEquipment }
    }).limit(limit);

    if (exercises.length > 0) {
      return exercises;
    }
  }

  // Extract exercise types from query
  const exerciseTypes = [
    'compound', 'isolation', 'push', 'pull', 'press', 'curl', 'extension', 'raise'
  ];

  const matchedTypes = exerciseTypes.filter(type =>
    query.toLowerCase().includes(type)
  );

  // If exercise types mentioned, try to find relevant exercises
  if (matchedTypes.length > 0) {
    // For simplicity, just check if the name contains the type
    const exercises = await Exercise.find({
      $or: matchedTypes.map(type => ({ name: new RegExp(type, 'i') }))
    }).limit(limit);

    if (exercises.length > 0) {
      return exercises;
    }
  }

  // Default: return some popular exercises
  const defaultExercises = await Exercise.find({
    $or: [
      { level: 'beginner' },
      { mechanic: 'compound' }
    ]
  }).limit(limit);

  return defaultExercises;
}
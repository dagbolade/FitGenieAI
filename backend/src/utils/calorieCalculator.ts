// backend/src/utils/calorieCalculator.ts
/**
 * Calculate calories burned during a workout
 * Formula based on MET (Metabolic Equivalent of Task) values
 * taking into account user specific data
 */
export const calculateCaloriesBurned = (
  options: {
    duration: number; // in minutes
    exerciseCount: number;
    intensityLevel: string; // 'beginner', 'intermediate', 'advanced'
    exerciseType: string; // 'strength', 'cardio', 'mixed', etc.
    weight?: number; // in kg, optional
    age?: number; // optional
    gender?: string; // optional
  }
): number => {
  const {
    duration,
    exerciseCount,
    intensityLevel,
    exerciseType,
    weight = null,
    age = null,
    gender = null
  } = options;

  // If no weight provided, we can't calculate accurately
  if (weight === null) {
    return 0; // Return 0 to indicate calculation not possible
  }

  if (duration <= 0) {
    console.log('Zero or negative duration provided, returning 0 calories');
    return 0;
  }

  // Base MET values by intensity level and exercise type
  const metValuesByType: Record<string, Record<string, number>> = {
    'strength': {
      'beginner': 3.0,
      'intermediate': 4.5,
      'advanced': 6.0,
      'expert': 6.0 // Adding expert level to match your UserProfile model
    },
    'cardio': {
      'beginner': 4.0,
      'intermediate': 7.0,
      'advanced': 10.0,
      'expert': 10.0
    },
    'mixed': {
      'beginner': 3.5,
      'intermediate': 5.5,
      'advanced': 8.0,
      'expert': 8.0
    },
    'general fitness': {
      'beginner': 3.5,
      'intermediate': 5.0,
      'advanced': 6.5,
      'expert': 6.5
    },
  };

  // Default to 'general fitness' if exercise type is not found
  const typeKey = exerciseType && metValuesByType[exerciseType] ?
    exerciseType : 'general fitness';

  // Default to 'beginner' if intensity level not found
  const intensityKey = intensityLevel && metValuesByType[typeKey][intensityLevel] ?
    intensityLevel : 'beginner';

  let baseMet = metValuesByType[typeKey][intensityKey];

  // Add exercise variety bonus (more exercises = more varied workout = slightly higher intensity)
  const exerciseBonus = Math.min(1.0, exerciseCount * 0.05); // Up to 1.0 bonus

  // Age adjustment (older individuals burn slightly fewer calories per minute)
  let ageAdjustment = 1.0;
  if (age !== null) {
    if (age > 50) ageAdjustment = 0.9;
    else if (age > 40) ageAdjustment = 0.95;
  }

  // Gender adjustment (on average, males burn slightly more calories due to higher muscle mass)
  let genderAdjustment = 1.0;
  if (gender === 'female') genderAdjustment = 0.9;

  // Apply all adjustments
  const adjustedMet = baseMet * (1 + exerciseBonus) * ageAdjustment * genderAdjustment;

  // Calories = MET * weight (kg) * duration (hours)
  const durationHours = duration / 60;
  const calories = adjustedMet * weight * durationHours;

  // Round to nearest whole number
  return Math.round(calories);
};
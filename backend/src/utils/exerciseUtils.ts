// backend/src/utils/aiCoach.ts
import Exercise from '../models/Exercise';

// Function to find relevant exercises based on the user's query
export async function findRelevantExercises(query: string, limit: number = 5) {
  try {
    const queryLower = query.toLowerCase();

    // Extract muscle groups mentioned in the query
    const muscleTargets = extractMuscleTargets(queryLower);
    console.log('Detected muscle targets:', muscleTargets);

    // Extract equipment mentioned in the query
    const equipmentMentioned = extractEquipment(queryLower);
    console.log('Detected equipment:', equipmentMentioned);

    // Extract fitness goal from the query
    const goalMentioned = extractGoal(queryLower);
    console.log('Detected goal:', goalMentioned);

    // Extract experience level from the query
    const levelMentioned = extractLevel(queryLower);
    console.log('Detected level:', levelMentioned);

    // Build MongoDB query based on extracted information
    const mongoQuery: any = {};

    // Add muscle targets to query if found
    if (muscleTargets.length > 0) {
      mongoQuery.primaryMuscles = { $in: muscleTargets };
    }

    // Add equipment to query if found
    if (equipmentMentioned.length > 0) {
      mongoQuery.equipment = { $in: equipmentMentioned };
    }

    // Add level to query if found
    if (levelMentioned) {
      mongoQuery.level = levelMentioned;
    }

    console.log('MongoDB query:', JSON.stringify(mongoQuery));

    // If we have specific criteria, use them
    if (Object.keys(mongoQuery).length > 0) {
      const exercises = await Exercise.find(mongoQuery).limit(limit);

      // If we found exercises, return them
      if (exercises.length > 0) {
        return exercises;
      }
    }

    // If we're looking for a specific goal but didn't find specific muscles
    if (goalMentioned && muscleTargets.length === 0) {
      // Different exercise recommendations based on fitness goals
      if (goalMentioned === 'strength') {
        // For strength, focus on compound movements
        return await Exercise.find({
          mechanic: 'compound',
          equipment: { $in: ['barbell', 'dumbbell'] }
        }).limit(limit);
      }
      else if (goalMentioned === 'muscle') {
        // For muscle building, mix of compound and isolation
        return await Exercise.find({
          $or: [
            { mechanic: 'compound' },
            { mechanic: 'isolation', equipment: { $in: ['dumbbell', 'cable', 'machine'] } }
          ]
        }).limit(limit);
      }
      else if (goalMentioned === 'fat loss') {
        // For fat loss, include HIIT-friendly exercises
        return await Exercise.find({
          $or: [
            { equipment: 'body only' },
            { primaryMuscles: { $in: ['cardiovascular system'] } }
          ]
        }).limit(limit);
      }
    }

    // Default: return diverse exercises
    // Try to get a mix of different body parts and equipment
    const bodyParts = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'abdominals'];
    const randomBodyParts = bodyParts.sort(() => 0.5 - Math.random()).slice(0, 3);

    return await Exercise.find({
      primaryMuscles: { $in: randomBodyParts }
    }).limit(limit);
  } catch (error) {
    console.error('Error finding relevant exercises:', error);
    // Return empty array if there's an error
    return [];
  }
}

// Helper function to extract muscle targets from query
function extractMuscleTargets(query: string): string[] {
  const muscleKeywords: {[key: string]: string[]} = {
    'chest': ['chest', 'pectoral', 'pecs'],
    'back': ['back', 'lats', 'latissimus'],
    'shoulders': ['shoulder', 'deltoid', 'delts'],
    'biceps': ['bicep', 'biceps', 'arm'],
    'triceps': ['tricep', 'triceps'],
    'quadriceps': ['quad', 'quads', 'quadriceps', 'thigh', 'leg'],
    'hamstrings': ['hamstring', 'hamstrings', 'leg'],
    'abdominals': ['abs', 'abdomen', 'abdominal', 'core', 'six pack'],
    'glutes': ['glute', 'glutes', 'buttocks', 'butt'],
    'calves': ['calf', 'calves'],
    'forearms': ['forearm', 'forearms', 'grip']
  };

  const result: string[] = [];

  Object.entries(muscleKeywords).forEach(([muscle, keywords]) => {
    if (keywords.some(keyword => query.includes(keyword))) {
      result.push(muscle);
    }
  });

  return result;
}

// Helper function to extract equipment from query
function extractEquipment(query: string): string[] {
  const equipmentKeywords: {[key: string]: string[]} = {
    'barbell': ['barbell', 'bar'],
    'dumbbell': ['dumbbell', 'dumbbells'],
    'kettlebell': ['kettlebell', 'kettlebells'],
    'cable': ['cable', 'cables', 'pulley'],
    'machine': ['machine', 'machines'],
    'body only': ['bodyweight', 'body weight', 'no equipment', 'without equipment', 'body only'],
    'bands': ['band', 'bands', 'resistance band']
  };

  const result: string[] = [];

  Object.entries(equipmentKeywords).forEach(([equipment, keywords]) => {
    if (keywords.some(keyword => query.includes(keyword))) {
      result.push(equipment);
    }
  });

  return result;
}

// Helper function to extract fitness goal from query
function extractGoal(query: string): string | null {
  if (query.includes('strength') || query.includes('stronger') || query.includes('power')) {
    return 'strength';
  }
  else if (query.includes('muscle') || query.includes('hypertrophy') || query.includes('bigger') ||
           query.includes('mass') || query.includes('size') || query.includes('build')) {
    return 'muscle';
  }
  else if (query.includes('fat') || query.includes('weight loss') || query.includes('lose weight') ||
           query.includes('burn') || query.includes('slim') || query.includes('tone')) {
    return 'fat loss';
  }
  else if (query.includes('endurance') || query.includes('stamina') || query.includes('cardio')) {
    return 'endurance';
  }

  return null;
}

// Helper function to extract experience level from query
function extractLevel(query: string): string | null {
  if (query.includes('beginner') || query.includes('start') || query.includes('new') ||
      query.includes('basic') || query.includes('novice')) {
    return 'beginner';
  }
  else if (query.includes('intermediate') || query.includes('moderate') ||
           query.includes('some experience')) {
    return 'intermediate';
  }
  else if (query.includes('expert') || query.includes('expert') ||
           query.includes('hard') || query.includes('challenging')) {
    return 'expert';
  }

  return null;
}
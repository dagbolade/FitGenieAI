// backend/src/utils/gemini.ts
import dotenv from 'dotenv';
import Exercise from '../models/Exercise';

// Load environment variables
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
console.log('API Key exists:', !!apiKey);

// Function to generate responses using one of the available models
export async function generateAIResponse(query: string, relevantExercises: any[]) {
  try {
    // Format relevant exercises as context
    const exercisesContext = relevantExercises.map(ex =>
      `Exercise: ${ex.name}
      Type: ${ex.mechanic || 'N/A'} (Primary Muscles: ${Array.isArray(ex.primaryMuscles) ? ex.primaryMuscles.join(', ') : ex.primaryMuscles})
      Equipment: ${ex.equipment}
      Level: ${ex.level}`
    ).join('\n\n');

    // Create the prompt
    const prompt = `You are FitGenieAI, an expert fitness assistant powered by expert-level knowledge in exercise science, nutrition, and training optimization. 
    Your goal is to provide clear, structured, and highly targeted responses to user queries, avoiding repetition and focusing on actionable advice.
    
   When responding:
1. Begin with a **brief introduction** that explains the purpose of the exercise or recommendation.
2. Provide **step-by-step instructions** that are easy to follow and logically ordered.
3. Highlight **primary and secondary muscles** worked during the exercise.
4. Share **pro tips** for optimizing performance, avoiding injury, and improving form.
5. If the user is asking for workout plans, suggest **balanced routines** that prevent overtraining and encourage progressive overload.

For example:
    - If asked about "Best dumbbell exercises for upper body," respond with a structured list including:
        - Exercise Name
        - Muscles Worked
        - Step-by-Step Instructions
        - Pro Tips

Avoid:
- Overly repetitive phrasing
- Vague or generic advice
- Long-winded explanations

If necessary, reference the user's workout history and preferences to deliver more personalised recommendations.
    Here are some exercises that may be relevant to the user:
    ${exercisesContext}
    
    User question: ${query}
    
    Provide a personalized response focusing on answering the user's question directly. If appropriate, mention 1-2 specific exercises from the list above that would be helpful. Keep your response concise (around 4-6 sentences) and maintain a supportive, encouraging tone.`;

    // From the list we can see several valid models that support generateContent
    // Let's try with models/gemini-1.5-flash which is available and should be fast

    console.log('Trying to use model: models/gemini-1.5-flash');

    // Make direct API call
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 500) + '...');

    // Extract text from response - structure may vary by model
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ||
                data.candidates?.[0]?.output ||
                data.text ||
                '';

    if (!text) {
      console.error('Could not extract text from response:', data);
      throw new Error('Could not extract text from response');
    }

    return text;
  } catch (error) {
    console.error('Error generating response with Gemini API:', error);

    // Fall back to rule-based responses
    return generateRuleBasedResponse(query, relevantExercises);
  }
}

// Function to find relevant exercises for a query
export async function getSimilarExercises(query: string, limit: number = 5) {
  try {
    const queryLower = query.toLowerCase();

    // Extract potential muscle groups from query
    const muscleGroups = [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'core'
    ];

    const matchedMuscles = muscleGroups.filter(muscle =>
      queryLower.includes(muscle)
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
      queryLower.includes(equipment)
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

    // Default: return some popular exercises
    return await Exercise.find({
      $or: [
        { level: 'beginner' },
        { mechanic: 'compound' }
      ]
    }).limit(limit);
  } catch (error) {
    console.error('Error finding similar exercises:', error);
    // Return empty array if there's an error
    return [];
  }
}

// Fallback function to generate rule-based responses
function generateRuleBasedResponse(query: string, exercises: any[]) {
  try {
    const queryLower = query.toLowerCase();

    // Extract exercise names for recommendations
    const exerciseNames = exercises.slice(0, 3).map(ex => ex.name).join(', ');

    if (!exerciseNames || exercises.length === 0) {
      return "I'm having trouble connecting to my knowledge base right now, but I'd be happy to try answering a different fitness question for you.";
    }

    // Simple rule-based responses based on query keywords
    if (queryLower.includes('best exercise') || queryLower.includes('recommend') || queryLower.includes('good exercise')) {
      const muscleGroups = [
        'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs',
        'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'core'
      ];

      const targetMuscle = muscleGroups.find(muscle => queryLower.includes(muscle)) || 'those muscles';

      return `Based on your question, I'd recommend trying ${exerciseNames} for ${targetMuscle}. These exercises are effective for targeting the muscles you're interested in when performed with proper form and appropriate weight.`;
    }

    if (queryLower.includes('how many') && queryLower.includes('sets')) {
      return `For most exercises, 3-5 sets is typically recommended. If you're focused on strength, aim for 4-6 sets with heavier weights and fewer reps. For muscle growth (hypertrophy), 3-4 sets with moderate weights and 8-12 reps works well. For endurance, try 2-3 sets with lighter weights and higher reps (15+).`;
    }

    if (queryLower.includes('how many') && queryLower.includes('reps')) {
      return `The ideal rep range depends on your goal: For strength, aim for 1-5 reps with heavier weights. For muscle building, 8-12 reps is generally recommended. For endurance, 15+ reps with lighter weights works well. Remember to maintain proper form throughout all repetitions.`;
    }

    if (queryLower.includes('rest') && (queryLower.includes('between') || queryLower.includes('time'))) {
      return `Rest periods should be tailored to your training goal. For strength training, rest 2-5 minutes between sets. For hypertrophy (muscle building), 1-2 minutes is typically recommended. For endurance, keep rest periods shorter (30-60 seconds). Compound exercises generally require longer rest than isolation exercises.`;
    }

    if (queryLower.includes('beginner') && queryLower.includes('workout')) {
      return `For beginners, I recommend starting with a full-body workout routine 2-3 times per week. Focus on compound exercises like squats, deadlifts, bench press, rows, and overhead press. Start with lighter weights to learn proper form, and gradually increase the weight as you become more comfortable with the movements. Exercises like ${exerciseNames} would be great to include in your routine.`;
    }

    if (queryLower.includes('how often') || queryLower.includes('how many days')) {
      return `The ideal training frequency depends on your goals and recovery capacity. For general fitness, 3-5 days per week is typically recommended. If you're a beginner, start with 2-3 full-body workouts per week. For more expert trainees, a split routine might work better, training each muscle group 2-3 times per week. Always ensure you're getting adequate rest between sessions targeting the same muscle groups (typically 48-72 hours).`;
    }

    if (queryLower.includes('diet') || queryLower.includes('nutrition') || queryLower.includes('eat')) {
      return `A balanced diet is crucial for fitness success. Focus on consuming adequate protein (about 0.7-1g per pound of bodyweight), complex carbohydrates, healthy fats, and plenty of fruits and vegetables. Stay hydrated by drinking plenty of water throughout the day. For specific meal timing, try to eat a meal containing protein and carbs 1-2 hours before your workout and another meal with protein within an hour after your workout to support recovery.`;
    }

    if (queryLower.includes('lose weight') || queryLower.includes('fat loss')) {
      return `For weight loss, focus on creating a calorie deficit through a combination of diet and exercise. Incorporate both strength training (like ${exerciseNames}) and cardiovascular exercise into your routine. Strength training helps preserve muscle mass while losing fat, and cardio increases calorie burn. For diet, focus on whole, unprocessed foods, lean proteins, and plenty of vegetables. Remember that consistency is key - aim for sustainable changes rather than extreme approaches.`;
    }

    if (queryLower.includes('gain muscle') || queryLower.includes('build muscle')) {
      return `To build muscle, you need a combination of progressive overload in your training, adequate protein intake, and sufficient recovery. Focus on compound exercises like ${exerciseNames} and gradually increase the weight or reps over time. Aim to consume about 0.7-1g of protein per pound of bodyweight daily, and ensure you're eating enough total calories to support muscle growth (typically a small calorie surplus). Get 7-9 hours of sleep each night, as this is when much of your recovery and muscle building occurs.`;
    }

    // Generic response when no specific rule matches
    return `Based on your question, exercises like ${exerciseNames} might be helpful. Remember to always use proper form and start with weights you can handle comfortably, especially if you're new to these exercises. It's also important to maintain a balanced workout routine that targets all major muscle groups over the course of your training week.`;
  } catch (error) {
    console.error('Error generating rule-based response:', error);
    // Return a fallback response if something goes wrong
    return "I'm sorry, I encountered an error while generating a response. Please try asking your question in a different way or ask about another fitness topic.";
  }
}
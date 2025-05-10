// backend/src/utils/openai.ts
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add your key to .env file
});

export async function generateAIResponse(query: string, relevantExercises: any[]) {
  try {
    // Format relevant exercises as context
    const exercisesContext = relevantExercises.map(ex =>
      `Exercise: ${ex.name}
      Type: ${ex.mechanic || 'N/A'} (Primary Muscles: ${Array.isArray(ex.primaryMuscles) ? ex.primaryMuscles.join(', ') : ex.primaryMuscles})
      Equipment: ${ex.equipment}
      Level: ${ex.level}`
    ).join('\n\n');

    // Create system message with fitness expertise
    const systemMessage = `You are an expert fitness coach with deep knowledge about exercise, nutrition, and training. 
    Your goal is to provide helpful, science-based advice tailored to the user's needs. Consider the best appraches for different fitness levels and goals.
    When responding, consider the following relevant exercises from our database that may help answer the query:
    
    ${exercisesContext}`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can also use "gpt-4" if available
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    // Fallback to rule-based response if OpenAI API fails
    return generateFallbackResponse(query, relevantExercises);
  }
}

// Fallback function in case the OpenAI API call fails
function generateFallbackResponse(query: string, exercises: any[]) {
  // Same fallback logic you've already implemented
  const queryLower = query.toLowerCase();

  // Extract exercise names for recommendations
  const exerciseNames = exercises.map(ex => ex.name).slice(0, 3).join(', ');

  // Simple rule-based responses
  if (queryLower.includes('best exercise') || queryLower.includes('recommend')) {
    return `Based on your question, I'd recommend trying ${exerciseNames}. These exercises are effective for targeting the muscles you're interested in.`;
  }

  // Generic response
  return `While I can't provide a detailed answer right now, exercises like ${exerciseNames} might help with what you're looking for. Remember to always use proper form and consult with a professional if you have any health concerns.`;
}
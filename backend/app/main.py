# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import json
import os
import random
import ast
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI(title="FitGenieAI Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the exercise data
EXERCISES_CSV_PATH = "data/clean_exercises.csv"
EXERCISES_DATA = []


# In your backend code where you load the CSV data
def process_csv_data(df):
    """Process CSV data to handle lists stored as strings"""
    for col in ['primaryMuscles', 'secondaryMuscles', 'instructions']:
        if col in df.columns:
            df[col] = df[col].apply(
                lambda x: ast.literal_eval(x) if isinstance(x, str) and (x.startswith('[') or x.startswith('('))
                else (x.split(',') if isinstance(x, str) else [])
            )

    # Process image paths
    if 'images' in df.columns:
        df['images'] = df['images'].apply(
            lambda x: ast.literal_eval(x) if isinstance(x, str) and (x.startswith('[') or x.startswith('('))
            else (x.split(',') if isinstance(x, str) else [])
        )

    return df.to_dict('records')


try:
    # Load exercise data from CSV
    df = pd.read_csv(EXERCISES_CSV_PATH)
    EXERCISES_DATA = process_csv_data(df)
    print(f"Loaded {len(EXERCISES_DATA)} exercises from CSV")
except Exception as e:
    print(f"Error loading exercise data: {e}")
    # Fallback data if CSV is not available
    EXERCISES_DATA = []

# Initialize sentence transformer model for embeddings
try:
    # Using a smaller model that's free to use
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Loaded sentence transformer model")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Generate embeddings for all exercises
exercise_embeddings = []
if model and EXERCISES_DATA:
    exercise_texts = [
        f"{ex.get('name', '')} {ex.get('category', '')} {' '.join(ex.get('primaryMuscles', []))} {ex.get('equipment', '')}"
        for ex in EXERCISES_DATA
    ]
    exercise_embeddings = model.encode(exercise_texts)
    print(f"Generated embeddings for {len(exercise_embeddings)} exercises")


# Data models
class UserProfile(BaseModel):
    goal: str
    level: str
    equipment: List[str]
    duration: int
    split_type: str
    day: Optional[str] = None
    limitations: Optional[str] = None


class QueryRequest(BaseModel):
    query: str
    user_profile: Optional[UserProfile] = None


class WorkoutExercise(BaseModel):
    id: str
    name: str
    sets: int
    reps: str
    rest_seconds: int
    equipment: str
    primaryMuscles: List[str]
    instructions: List[str]
    images: List[str] = []


class Workout(BaseModel):
    name: str
    description: str
    goal: str
    level: str
    type: str
    duration: int
    exercises: List[WorkoutExercise]


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "FitGenieAI API is running"}


@app.get("/api/exercises")
async def get_exercises(
        equipment: Optional[str] = None,
        level: Optional[str] = None,
        muscle: Optional[str] = None,
        limit: int = 50
):
    """Get exercises with optional filtering"""
    filtered = EXERCISES_DATA

    if equipment:
        filtered = [ex for ex in filtered if ex.get("equipment") == equipment]

    if level:
        filtered = [ex for ex in filtered if ex.get("level") == level]

    if muscle:
        filtered = [ex for ex in filtered if muscle in ex.get("primaryMuscles", [])]

    return filtered[:limit]


@app.get("/api/exercise/{exercise_id}")
async def get_exercise(exercise_id: str):
    """Get a specific exercise by ID"""
    for exercise in EXERCISES_DATA:
        if exercise.get("id") == exercise_id:
            return exercise

    raise HTTPException(status_code=404, detail="Exercise not found")



@app.post("/api/generate-workout")
async def generate_workout(user_profile: UserProfile):
    """Generate a personalized workout based on user profile"""
    try:
        # Extract profile info
        goal = user_profile.goal.lower()
        level = user_profile.level.lower()
        equipment = user_profile.equipment
        duration = user_profile.duration
        split_type = user_profile.split_type.lower()
        day = user_profile.day.lower() if user_profile.day else None

        # Filter exercises based on equipment and level
        filtered_exercises = [
            ex for ex in EXERCISES_DATA
            if ex.get("equipment") in equipment and ex.get("level") == level
        ]

        # Further filter based on split type/day
        if split_type == "ppl" and day:
            if day == "push":
                filtered_exercises = [ex for ex in filtered_exercises if ex.get("force") == "push"]
            elif day == "pull":
                filtered_exercises = [ex for ex in filtered_exercises if ex.get("force") == "pull"]
            elif day == "legs":
                leg_muscles = ["quadriceps", "hamstrings", "calves", "glutes"]
                filtered_exercises = [
                    ex for ex in filtered_exercises
                    if any(muscle in leg_muscles for muscle in ex.get("primaryMuscles", []))
                ]

        # If not enough exercises match criteria, loosen equipment restriction
        if len(filtered_exercises) < 5:
            filtered_exercises = [
                ex for ex in EXERCISES_DATA
                if ex.get("level") == level
            ]

            # Apply split day filter again if needed
            if split_type == "ppl" and day:
                if day == "push":
                    filtered_exercises = [ex for ex in filtered_exercises if ex.get("force") == "push"]
                elif day == "pull":
                    filtered_exercises = [ex for ex in filtered_exercises if ex.get("force") == "pull"]
                elif day == "legs":
                    leg_muscles = ["quadriceps", "hamstrings", "calves", "glutes"]
                    filtered_exercises = [
                        ex for ex in filtered_exercises
                        if any(muscle in leg_muscles for muscle in ex.get("primaryMuscles", []))
                    ]

        # Determine number of exercises based on duration
        # Assuming about 10 minutes per exercise including rest
        num_exercises = max(3, min(8, duration // 10))

        # Select exercises with preference for compound movements
        compound_exercises = [ex for ex in filtered_exercises if ex.get("mechanic") == "compound"]
        isolation_exercises = [ex for ex in filtered_exercises if ex.get("mechanic") == "isolation"]

        # Aim for 60% compound, 40% isolation
        num_compound = max(1, int(num_exercises * 0.6))
        num_isolation = num_exercises - num_compound

        selected_compound = random.sample(compound_exercises, min(num_compound, len(compound_exercises))) if compound_exercises else []
        selected_isolation = random.sample(isolation_exercises, min(num_isolation, len(isolation_exercises))) if isolation_exercises else []

        # If we don't have enough of either type, fill with the other
        if len(selected_compound) < num_compound and isolation_exercises:
            additional_isolation = random.sample(
                isolation_exercises,
                min(num_compound - len(selected_compound), len(isolation_exercises))
            )
            selected_compound.extend(additional_isolation)

        if len(selected_isolation) < num_isolation and compound_exercises:
            additional_compound = random.sample(
                compound_exercises,
                min(num_isolation - len(selected_isolation), len(compound_exercises))
            )
            selected_isolation.extend(additional_compound)

        # Combine and shuffle
        selected_exercises = selected_compound + selected_isolation
        random.shuffle(selected_exercises)

        # Make sure we have enough exercises
        if not selected_exercises:
            # Just pick random exercises as a fallback
            selected_exercises = random.sample(
                EXERCISES_DATA,
                min(num_exercises, len(EXERCISES_DATA))
            )

        # Create workout structure
        workout_name = f"{day.capitalize() if day else split_type.capitalize()} Workout for {goal.capitalize()}"

        workout_description = ""
        if day == "push":
            workout_description = "Focus on chest, shoulders, and triceps with movements that involve pushing weight away from your body."
        elif day == "pull":
            workout_description = "Focus on back and biceps with movements that involve pulling weight toward your body."
        elif day == "legs":
            workout_description = "Focus on quadriceps, hamstrings, glutes, and calves to build lower body strength and power."
        else:
            workout_description = f"A {split_type} workout designed to help you achieve your {goal} goals."

        # Format exercises according to goal
        workout_exercises = []
        for ex in selected_exercises:
            # Default structure
            sets = 3
            reps = "10-12"
            rest_seconds = 60

            # Adjust based on goal
            if goal == "strength":
                sets = 5 if ex.get("mechanic") == "compound" else 3
                reps = "4-6" if ex.get("mechanic") == "compound" else "6-8"
                rest_seconds = 180 if ex.get("mechanic") == "compound" else 120
            elif goal == "muscle building" or goal == "hypertrophy":
                sets = 4 if ex.get("mechanic") == "compound" else 3
                reps = "8-12"
                rest_seconds = 90 if ex.get("mechanic") == "compound" else 60
            elif goal == "fat loss":
                sets = 3
                reps = "12-15"
                rest_seconds = 45
            elif goal == "endurance":
                sets = 3
                reps = "15-20"
                rest_seconds = 30

            exercise_entry = {
                "id": ex.get("id", ""),
                "name": ex.get("name", ""),
                "sets": sets,
                "reps": reps,
                "rest_seconds": rest_seconds,
                "equipment": ex.get("equipment", ""),
                "primaryMuscles": ex.get("primaryMuscles", []),
                "instructions": ex.get("instructions", []),
                "images": ex.get("images", [])
            }

            workout_exercises.append(exercise_entry)

        workout = {
            "name": workout_name,
            "description": workout_description,
            "goal": goal,
            "level": level,
            "type": day if day else split_type,
            "duration": duration,
            "exercises": workout_exercises
        }

        return workout

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating workout: {str(e)}")

@app.post("/api/ask-coach")
async def ask_coach(query_request: QueryRequest):
    """Ask the AI coach a fitness-related question"""
    try:
        query = query_request.query

        # If no sentence transformer model available, use rule-based responses
        if not model:
            return generate_rule_based_response(query)

        # Generate embedding for the query
        query_embedding = model.encode(query)

        # Find similar exercises based on embeddings
        similarities = cosine_similarity(
            [query_embedding],
            exercise_embeddings
        )[0]

        # Get top 5 most relevant exercises
        top_indices = similarities.argsort()[-5:][::-1]
        relevant_exercises = [EXERCISES_DATA[i] for i in top_indices]

        # Generate a response based on the query and relevant exercises
        response = generate_rag_response(query, relevant_exercises)

        return {"response": response, "relevant_exercises": relevant_exercises}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

def generate_rule_based_response(query: str) -> str:
    """Generate a rule-based response for common fitness questions"""
    query = query.lower()

    # Example rule-based responses
    if "best exercise for" in query:
        if "chest" in query:
            return "Bench press, push-ups, and dumbbell flyes are excellent exercises for chest development."
        elif "back" in query:
            return "Pull-ups, rows, and deadlifts are some of the best exercises for building a strong back."
        elif "legs" in query:
            return "Squats, deadlifts, and lunges are fundamental exercises for leg strength and growth."
        else:
            return "For most muscle groups, compound exercises that allow progressive overload are typically most effective."

    elif "how many" in query and "sets" in query:
        return "For most goals, 3-5 sets per exercise is effective. Strength training typically uses fewer sets (3-5) with heavier weights, while hypertrophy training often uses more volume (3-4 sets of multiple exercises)."

    elif "how many" in query and "rep" in query:
        return "Rep ranges depend on your goal: Strength: 1-5 reps, Hypertrophy: 8-12 reps, Endurance: 15+ reps. These are guidelines, as there's overlap between adaptations."

    elif "rest" in query and "between" in query:
        return "Rest periods should be based on your goal: Strength: 3-5 minutes, Hypertrophy: 1-2 minutes, Endurance: 30-60 seconds between sets."

    elif "protein" in query:
        return "Most research suggests consuming 1.6-2.2g of protein per kg of bodyweight for those training regularly. Spacing protein intake throughout the day (every 3-4 hours) may be optimal for muscle protein synthesis."

    elif "lose weight" in query or "fat loss" in query:
        return "Fat loss requires a caloric deficit - consuming fewer calories than you burn. This is best achieved through a combination of moderate calorie reduction (300-500 calories below maintenance) and increased physical activity. Strength training helps preserve muscle mass during weight loss."

    elif "build muscle" in query:
        return "Building muscle requires a combination of progressive resistance training, adequate protein intake (1.6-2.2g/kg), sufficient calories (slight surplus for optimal gains), and appropriate recovery between workouts."

    else:
        return "As your AI fitness coach, I'd be happy to help with specific questions about training, nutrition, or recovery strategies. Could you provide more details about what you're looking to learn?"

def generate_rag_response(query: str, relevant_exercises: List[Dict]) -> str:
    """Generate a response using retrieved exercise information"""
    query = query.lower()

    # Extract exercise names
    exercise_names = [ex.get("name", "") for ex in relevant_exercises]

    if "best exercise for" in query:
        muscles = []
        for ex in relevant_exercises:
            muscles.extend(ex.get("primaryMuscles", []))

        # Get most common muscles
        muscle_counts = {}
        for muscle in muscles:
            muscle_counts[muscle] = muscle_counts.get(muscle, 0) + 1

        target_muscles = [muscle for muscle, count in sorted(muscle_counts.items(), key=lambda x: x[1], reverse=True)][:2]

        return f"Based on your question, some effective exercises for {', '.join(target_muscles)} include {', '.join(exercise_names[:3])}. These exercises are great for targeting these muscle groups with proper form and progressive overload."

    elif "how to" in query and any(ex_name.lower() in query for ex_name in exercise_names):
        # Find which exercise is being asked about
        for ex in relevant_exercises:
            if ex.get("name", "").lower() in query:
                instructions = ex.get("instructions", [])
                if instructions:
                    return f"To perform {ex.get('name')}: \n- " + "\n- ".join(instructions)
                break

        return "When performing any exercise, focus on proper form, controlled movements, and appropriate weight for your experience level."

    elif "alternative" in query or "substitute" in query:
        return f"Some alternative exercises you might consider include {', '.join(exercise_names[:3])}. When selecting alternatives, look for exercises that target similar muscle groups and match the movement pattern as closely as possible."

    else:
        # Generic response with relevant exercise suggestions
        return f"Based on your question, you might want to consider exercises like {', '.join(exercise_names[:3])}. These can be effective additions to your workout routine, depending on your specific goals and fitness level."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
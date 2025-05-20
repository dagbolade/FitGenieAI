import { useState } from 'react';

interface GeneratorFormData {
  level: string;
  goal: string;
  type: string;
  duration: number;
  equipment: string[];
}

interface WorkoutGeneratorProps {
  onGenerateWorkout: (formData: GeneratorFormData) => void;
  isLoading?: boolean;
}

export default function WorkoutGenerator({ onGenerateWorkout, isLoading = false }: WorkoutGeneratorProps) {
  const [formData, setFormData] = useState<GeneratorFormData>({
    level: 'beginner',
    goal: 'general fitness',
    type: 'full body',
    duration: 45,
    equipment: ['body only']
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedEquipment: string[] = [];

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedEquipment.push(options[i].value);
      }
    }

    setFormData(prev => ({
      ...prev,
      equipment: selectedEquipment
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateWorkout(formData);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Generate Custom Workout</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Fitness Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">expert</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Fitness Goal</label>
            <select
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="general fitness">General Fitness</option>
              <option value="strength">Strength</option>
              <option value="muscle building">Muscle Building</option>
              <option value="fat loss">Fat Loss</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Workout Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="full body">Full Body</option>
              <option value="upper body">Upper Body</option>
              <option value="lower body">Lower Body</option>
              <option value="push">Push</option>
              <option value="pull">Pull</option>
              <option value="legs">Legs</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Duration (minutes)</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Available Equipment</label>
            <select
              name="equipment"
              multiple
              value={formData.equipment}
              onChange={handleEquipmentChange}
              className="w-full p-2 border rounded h-32"
              required
            >
              <option value="body only">Body Only</option>
              <option value="dumbbell">Dumbbells</option>
              <option value="barbell">Barbell</option>
              <option value="machine">Machines</option>
              <option value="cable">Cables</option>
              <option value="kettlebell">Kettlebell</option>
              <option value="bands">Resistance Bands</option>
              <option value="medicine ball">Medicine Ball</option>
              <option value="exercise ball">Exercise Ball</option>
              <option value="foam roll">Foam Roller</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full py-3"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Workout Plan'}
        </button>
      </form>
    </div>
  );
}
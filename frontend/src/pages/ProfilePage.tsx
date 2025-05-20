// frontend/src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const [setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    fitnessLevel: 'beginner',
    goals: [] as string[]
  });

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiService.getUserProfile();

        if (data.profile) {
          setProfile(data.profile);

          // Update form with existing data
          setFormData({
            weight: data.profile.weight || '',
            height: data.profile.height || '',
            age: data.profile.age || '',
            gender: data.profile.gender || '',
            fitnessLevel: data.profile.fitnessLevel || 'beginner',
            goals: data.profile.goals || []
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox/multi-select changes
  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    if (checked) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        goals: prev.goals.filter(goal => goal !== value)
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setLoading(true);
    setError(null);

    // Convert string values to numbers
    const profileData = {
      ...formData,
      weight: formData.weight ? Number(formData.weight) : null,
      height: formData.height ? Number(formData.height) : null,
      age: formData.age ? Number(formData.age) : null
    };

    const response = await apiService.updateUserProfile(profileData);

    setProfile(response.profile);
    setSuccess('Profile updated successfully!');

    // Add navigation options after saving
    window.scrollTo(0, 0); // Scroll to top to see success message

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);

    setLoading(false);
  } catch (err) {
    console.error('Error updating profile:', err);
    setError('Failed to update profile. Please try again.');
    setLoading(false);
  }
};


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Physical Information</h2>
            <p className="text-gray-600 mb-4">
              This information helps us calculate calories burned during your workouts more accurately.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Weight (kg)</label>
                <input
                    type="number"
                    name="weight"
                    min="30"
                    max="300"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter your weight"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Height (cm)</label>
                <input
                    type="number"
                    name="height"
                    min="100"
                    max="250"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter your height"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Age</label>
                <input
                    type="number"
                    name="age"
                    min="13"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter your age"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Gender</label>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Fitness Profile</h2>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Fitness Level</label>
              <select
                  name="fitnessLevel"
                  value={formData.fitnessLevel}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">expert</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Fitness Goals</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <label className="flex items-center">
                  <input
                      type="checkbox"
                      value="weight_loss"
                      checked={formData.goals.includes('weight_loss')}
                      onChange={handleGoalChange}
                      className="mr-2"
                  />
                  Weight Loss
                </label>

                <label className="flex items-center">
                  <input
                      type="checkbox"
                      value="muscle_gain"
                      checked={formData.goals.includes('muscle_gain')}
                      onChange={handleGoalChange}
                      className="mr-2"
                  />
                  Muscle Gain
                </label>

                <label className="flex items-center">
                  <input
                      type="checkbox"
                      value="strength"
                      checked={formData.goals.includes('strength')}
                      onChange={handleGoalChange}
                      className="mr-2"
                  />
                  Strength
                </label>

                <label className="flex items-center">
                  <input
                      type="checkbox"
                      value="endurance"
                      checked={formData.goals.includes('endurance')}
                      onChange={handleGoalChange}
                      className="mr-2"
                  />
                  Endurance
                </label>

                <label className="flex items-center">
                  <input
                      type="checkbox"
                      value="flexibility"
                      checked={formData.goals.includes('flexibility')}
                      onChange={handleGoalChange}
                      className="mr-2"
                  />
                  Flexibility
                </label>

                <label className="flex items-center">
                  <input
                      type="checkbox"
                      value="general_fitness"
                      checked={formData.goals.includes('general_fitness')}
                      onChange={handleGoalChange}
                      className="mr-2"
                  />
                  General Fitness
                </label>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            <Link
                to="/workouts"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Go to Workouts
            </Link>
            <Link
                to="/dashboard"
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              View Dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
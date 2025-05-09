export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6">Your Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-blue-50">
          <h3 className="text-blue-700 mb-1">Workouts</h3>
          <p className="text-3xl font-bold">12</p>
          <p className="text-sm text-gray-500">completed</p>
        </div>

        <div className="card bg-green-50">
          <h3 className="text-green-700 mb-1">Current Streak</h3>
          <p className="text-3xl font-bold">4</p>
          <p className="text-sm text-gray-500">days</p>
        </div>

        <div className="card bg-purple-50">
          <h3 className="text-purple-700 mb-1">Workout Time</h3>
          <p className="text-3xl font-bold">8.5</p>
          <p className="text-sm text-gray-500">hours this month</p>
        </div>

        <div className="card bg-yellow-50">
          <h3 className="text-yellow-700 mb-1">Favorite</h3>
          <p className="text-xl font-bold">Push Day</p>
          <p className="text-sm text-gray-500">workout type</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="mb-4">Recent Workouts</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border-b pb-3">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Push Day Workout</h3>
                    <p className="text-sm text-gray-500">20 May, 2023</p>
                  </div>
                  <span className="bg-green-100 text-green-800 h-fit px-2 py-1 rounded text-sm">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4">Upcoming Workouts</h2>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="border-b pb-3">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Leg Day Workout</h3>
                    <p className="text-sm text-gray-500">22 May, 2023</p>
                  </div>
                  <button className="text-primary-500 hover:text-primary-700">
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
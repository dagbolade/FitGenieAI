// src/router/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import HomePage from '../pages/HomePage';
import WorkoutsPage from '../pages/WorkoutsPage';
import WorkoutDetailPage from '../pages/WorkoutDetailPage';
import ExercisesPage from '../pages/ExercisesPage';
import ExerciseDetailPage from '../pages/ExerciseDetailPage';
import AICoachPage from '../pages/AICoachPage';
import DashboardPage from '../pages/DashboardPage';
import ErrorPage from '../pages/ErrorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/workouts',
        element: <WorkoutsPage />,
      },
      {
        path: '/workout/:id',
        element: <WorkoutDetailPage />,
      },
      {
        path: '/exercises',
        element: <ExercisesPage />,
      },
      {
        path: '/exercise/:id',
        element: <ExerciseDetailPage />,
      },
      {
        path: '/ai-coach',
        element: <AICoachPage />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
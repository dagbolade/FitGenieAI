// frontend/src/router/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import WorkoutsPage from '../pages/WorkoutsPage';
import WorkoutDetailPage from '../pages/WorkoutDetailPage';
import WorkoutSessionPage from '../pages/WorkoutSessionPage';
import ExercisesPage from '../pages/ExercisesPage';
import ExerciseDetailPage from '../pages/ExerciseDetailPage';
import AICoachPage from '../pages/AICoachPage';
import ProfilePage from '../pages/ProfilePage'; // Import ProfilePage
import ErrorPage from '../pages/ErrorPage';
import PrivateRoute from '../components/PrivateRoute';


const AppRouter = () => {


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
          path: '/login',
          element: <LoginPage />,
        },
        {
          path: '/register',
          element: <RegisterPage />,
        },
        {
          path: '/dashboard',
          element: <PrivateRoute><DashboardPage /></PrivateRoute>,
        },
        {
          path: '/workouts',
          element: <PrivateRoute><WorkoutsPage /></PrivateRoute>,
        },
        {
          path: '/workout/:id',
          element: <PrivateRoute><WorkoutDetailPage /></PrivateRoute>,
        },
        {
          path: '/workout-session/:id',
          element: <PrivateRoute><WorkoutSessionPage /></PrivateRoute>,
        },
        {
          path: '/profile', // Add ProfilePage route
          element: <PrivateRoute><ProfilePage /></PrivateRoute>,
        },
        {
          path: '/exercises',
          // Exercise library is publicly viewable
          element: <ExercisesPage />,
        },
        {
          path: '/exercise/:id',
          // Exercise details are publicly viewable
          element: <ExerciseDetailPage />,
        },
        {
          path: '/ai-coach',
          element: <PrivateRoute><AICoachPage /></PrivateRoute>,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRouter;
import { useRouteError, Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError() as any;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-500 mb-4">Oops!</h1>
        <p className="text-2xl mb-6">Something went wrong.</p>
        <p className="text-gray-600 mb-8">
          {error?.statusText || error?.message || 'An unexpected error occurred.'}
        </p>
        <Link to="/" className="btn btn-primary">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
import { Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

/**
 * Component for protecting routes based on authentication and user roles
 */
export default function ProtectedRoute({ children, role = 'admin' }) {
  const { user } = useStore();

  if (!user) {
    // Still loading or not logged in
    return <div className="p-8 text-center text-gray-500">Checking credentials...</div>;
  }

  if (user.role === 'guest') {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
        <p className="text-gray-400">You do not have permission to view this page.</p>
        <button 
           onClick={() => window.location.href = '/'}
           className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  return children;
}

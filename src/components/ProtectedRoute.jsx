import { Navigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser, checkPermission } = useData();
    // Assuming 'admin' role or specific permission is needed
    // For now, let's assume any logged in user with permission can access, or just 'admin' role check
    // logic inside checkPermission usually handles roles.

    // Check if user is logged in AND has admin privileges (or is explicitely admin)
    // Since checkPermission might return true for 'client' if permission is empty, let's be strict.

    // Quick check:
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'editor');

    if (!currentUser || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

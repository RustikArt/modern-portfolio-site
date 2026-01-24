import { Navigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const ProtectedRoute = ({ children, requiredPermission }) => {
    const { currentUser, checkPermission } = useData();

    if (!currentUser) return <Navigate to="/login" replace />;

    // If specific permission is required, check it
    if (requiredPermission && !checkPermission(requiredPermission)) {
        return <Navigate to="/login" replace />;
    }

    // Fallback: ensure user is at least an admin-ish role
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'editor');
    if (!isAdmin) return <Navigate to="/login" replace />;

    return children;
};

export default ProtectedRoute;

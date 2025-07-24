import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return <div className="text-center py-20 text-white">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;

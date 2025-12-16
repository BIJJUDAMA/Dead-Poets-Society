import AdminPage from '@/views/AdminPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Page() {
    return (
        <ProtectedRoute adminOnly={true}>
            <AdminPage />
        </ProtectedRoute>
    );
}

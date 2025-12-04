import SetupProfilePage from '@/views/SetupProfilePage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
    return (
        <ProtectedRoute>
            <SetupProfilePage />
        </ProtectedRoute>
    );
}

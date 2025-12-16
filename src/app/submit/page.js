import SubmitPage from '@/views/SubmitPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Page() {
    return (
        <ProtectedRoute>
            <SubmitPage />
        </ProtectedRoute>
    );
}

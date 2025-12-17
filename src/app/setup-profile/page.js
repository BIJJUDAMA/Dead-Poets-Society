import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const SetupProfilePage = dynamic(() => import('@/views/SetupProfilePage'), { ssr: false });

export default function Page() {
    return (
        <ProtectedRoute>
            <SetupProfilePage />
        </ProtectedRoute>
    );
}

import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const AdminPage = dynamic(() => import('@/views/AdminPage'), { ssr: false });

export default function Page() {
    return (
        <ProtectedRoute adminOnly={true}>
            <AdminPage />
        </ProtectedRoute>
    );
}

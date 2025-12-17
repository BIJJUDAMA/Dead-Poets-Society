import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const SubmitPage = dynamic(() => import('@/views/SubmitPage'), { ssr: false });

export default function Page() {
    return (
        <ProtectedRoute>
            <SubmitPage />
        </ProtectedRoute>
    );
}

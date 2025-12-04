"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (adminOnly && !isAdmin) {
                router.push('/');
            }
        }
    }, [user, isAdmin, loading, adminOnly, router]);

    if (loading) {
        return <div className="text-center py-20 text-white">Loading...</div>;
    }

    if (!user || (adminOnly && !isAdmin)) {
        return null;
    }

    return children;
};

export default ProtectedRoute;

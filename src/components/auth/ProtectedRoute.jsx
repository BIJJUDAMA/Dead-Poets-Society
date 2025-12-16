/**
 * A wrapper component for securing routes.
 * 
 * Purpose:
 * - Restricts access to authenticated users.
 * - Optionally checks for Admin privileges via `adminOnly` prop.
 * - Redirects unauthorized users to key pages (Login or Home).
 * - Shows a loading state while auth status is resolving.
 * 
 * Used In:
 * - `src/views/AdminPage.jsx`
 * - `src/views/SubmitPage.jsx`
 */

"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

// Wrapper component for routes requiring authentication or admin status
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

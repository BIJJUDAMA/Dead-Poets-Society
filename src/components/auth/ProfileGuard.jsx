/**
 * A logic-only component that enforces profile completion
 * 
 * Purpose:
 * - Checks if the authenticated user has completed their profile (specifically `display_name`)
 * - Redirects incomplete users to `/setup-profile` regardless of where they try to go
 * - Acts as a global gatekeeper in the layout
 * 
 * Used In:
 * - `app/layout.js`
 */

"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

// Helper component to enforce profile completion for new users
const ProfileGuard = () => {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && user) {
            if (userProfile?.isNew || !userProfile?.display_name) {
                if (pathname !== '/setup-profile') {
                    router.replace('/setup-profile');
                }
            }
        }
    }, [user, userProfile, loading, pathname, router]);

    return null;
};

export default ProfileGuard;

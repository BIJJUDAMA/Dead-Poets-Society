"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

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

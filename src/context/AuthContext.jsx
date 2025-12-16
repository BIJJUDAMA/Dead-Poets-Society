/**
 * The central authentication state manager for the application (Allowing access to admin/semi-admin features)
 * 
 * Purpose:
 * - Wraps the entire application to provide user session data
 * - Manages global state: `user`, `userProfile`, `isAdmin`, `isMainAdmin`
 * - Validates user roles against the `profiles` table in Supabase
 * - Sets up realtime subscriptions to keep profile data (applause count) in sync
 * - Handles "New User" detection for redirection logic in `ProfileGuard`
 */

"use client";
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../supabase/config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    // State for auth and profile data
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMainAdmin, setIsMainAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleUser = async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);

            // Fetch public profile if user exists
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching profile:", error);
            }

            if (profile) {
                if (!profile.display_name) {
                    setUserProfile({ ...profile, isNew: true });
                } else {
                    setUserProfile(profile);
                }
                // Determine admin roles based on email or DB role
                const mainAdmin = profile.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                setIsMainAdmin(mainAdmin);
                setIsAdmin(mainAdmin || profile.role === 'semi-admin' || profile.role === 'admin');
            } else {
                setUserProfile({ isNew: true });
                const mainAdmin = currentUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                setIsMainAdmin(mainAdmin);
                setIsAdmin(mainAdmin);
            }
        } else {
            setUser(null);
            setUserProfile(null);
            setIsAdmin(false);
            setIsMainAdmin(false);
        }
        setLoading(false);
    };

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            handleUser(session?.user);
        };
        getSession();

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            handleUser(session?.user);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        let profileListener;
        if (user?.id) {
            // Realtime subscription to profile changes
            profileListener = supabase
                .channel(`public:profiles:id=eq.${user.id}`)
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
                    const newProfile = payload.new;
                    setUserProfile(newProfile);
                    const mainAdmin = newProfile.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                    setIsMainAdmin(mainAdmin);
                    setIsAdmin(mainAdmin || newProfile.role === 'semi-admin' || newProfile.role === 'admin');
                })
                .subscribe();
        }

        return () => {
            if (profileListener) {
                supabase.removeChannel(profileListener);
            }
        };
    }, [user?.id]);


    const refreshUserProfile = async () => {
        if (user) {
            await handleUser(user);
        }
    };

    const value = { user, userProfile, isAdmin, isMainAdmin, loading, refreshUserProfile };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
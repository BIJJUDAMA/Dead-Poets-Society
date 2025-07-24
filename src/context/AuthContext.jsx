import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../supabase/config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMainAdmin, setIsMainAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await handleUser(session.user);
            }
            setLoading(false);
        };
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = session?.user;
            await handleUser(currentUser);
            setLoading(false);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const handleUser = async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);

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
                const mainAdmin = profile.email === import.meta.env.VITE_ADMIN_EMAIL;
                setIsMainAdmin(mainAdmin);
                setIsAdmin(mainAdmin || profile.role === 'semi-admin');
            } else {
                setUserProfile({ isNew: true });
                const mainAdmin = currentUser.email === import.meta.env.VITE_ADMIN_EMAIL;
                setIsMainAdmin(mainAdmin);
                setIsAdmin(mainAdmin);
            }
        } else {
            setUser(null);
            setUserProfile(null);
            setIsAdmin(false);
            setIsMainAdmin(false);
        }
    };

    const refreshUserProfile = async () => {
        if (user) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error) {
                console.error("Error refreshing profile:", error);
            } else {
                setUserProfile(profile);
            }
        }
    };

    const value = { user, userProfile, isAdmin, isMainAdmin, loading, refreshUserProfile };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

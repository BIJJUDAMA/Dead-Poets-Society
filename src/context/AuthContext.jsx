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
                setIsAdmin(mainAdmin || profile.role === 'semi-admin' || profile.role === 'admin');
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
        setLoading(false);
    };

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            handleUser(session?.user);
        };
        getSession();

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
            profileListener = supabase
                .channel(`public:profiles:id=eq.${user.id}`)
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
                    const newProfile = payload.new;
                    setUserProfile(newProfile);
                    const mainAdmin = newProfile.email === import.meta.env.VITE_ADMIN_EMAIL;
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
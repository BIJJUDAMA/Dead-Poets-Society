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
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        let profileListener;

        const fetchUserProfile = async () => {
            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching profile:", error);
                } else if (profile) {
                    setUserProfile(profile);
                    const mainAdmin = profile.email === import.meta.env.VITE_ADMIN_EMAIL;
                    setIsMainAdmin(mainAdmin);
                    setIsAdmin(mainAdmin || profile.role === 'semi-admin' || profile.role === 'admin');

                    profileListener = supabase
                        .channel(`public:profiles:id=eq.${user.id}`)
                        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
                            const newProfile = payload.new;
                            setUserProfile(newProfile);
                            const newMainAdmin = newProfile.email === import.meta.env.VITE_ADMIN_EMAIL;
                            setIsMainAdmin(newMainAdmin);
                            setIsAdmin(newMainAdmin || newProfile.role === 'semi-admin' || newProfile.role === 'admin');
                        })
                        .subscribe();

                } else {
                    setUserProfile({ isNew: true });
                }
            } else {
                setUserProfile(null);
                setIsAdmin(false);
                setIsMainAdmin(false);
            }
        };

        fetchUserProfile();

        return () => {
            if (profileListener) {
                supabase.removeChannel(profileListener);
            }
        };
    }, [user]);


    const refreshUserProfile = async () => {
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setUserProfile(profile);
        }
    };

    const value = { user, userProfile, isAdmin, isMainAdmin, loading, refreshUserProfile };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

/** 
 * Handles user authentication via Google OAuth
 * 
 * Purpose:
 * - Provides a secure entry point for new and returning users
 * - Uses Supabase Auth for backend authentication
 * - Redirects already logged-in users to the homepage to prevent redundant login flows
 * 
 * Key Features:
 * - Google Sign-In integration
 * - Auto-redirect loop if session exists
 */

"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase/config.js';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


const LoginPage = () => {

    const router = useRouter();
    const { user } = useAuth();

    /**
     * Handles the Google OAuth sign-in process.
     * Triggers a redirect to the Google login page. (Was a pain to set up and I have forgotten most about it so don't ask me about this. It WORKS and don't fix what already works)
     */
    // Initiate Google OAuth login via Supabase
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            console.error('Error logging in with Google:', error);
        }
    };

    /**
     * Effect Hook: Auth State Check
     * Monitors the `user` object from AuthContext. If a user is present immediately redirects them to the homepage
     */
    // Redirect to home if user is already authenticated
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20 px-4"
        >
            <Card className="w-full max-w-sm bg-gray-900 border-gray-700 text-white border-t-4 border-t-blue-600">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Join the Society</CardTitle>
                    <CardDescription>Continue with Google to begin your journey.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button onClick={handleGoogleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
                            Sign In with Google
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default LoginPage;

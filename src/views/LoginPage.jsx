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

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            console.error('Error logging in with Google:', error);
        }
    };

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

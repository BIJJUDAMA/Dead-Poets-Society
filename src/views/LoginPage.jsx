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
import DeadPoetsSignature from '@/components/common/DeadPoetsSignature';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
        <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.2 8.9 5 12 5z"
        />
        <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
        />
        <path
            fill="#FBBC05"
            d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
        />
        <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.2-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z"
        />
    </svg>
);

const LoginPage = () => {
    const router = useRouter();
    const { user } = useAuth();

    // Initiate Google OAuth login via Supabase
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            console.error('Error logging in with Google:', error);
        }
    };

    // Redirect to home if user is already authenticated
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-black text-white flex flex-col items-center justify-center py-6 px-4 sm:px-6 relative overflow-hidden selection:bg-amber-900/40 selection:text-amber-100">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-600/10 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-yellow-600/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10 flex flex-col items-center"
            >
                {/* Calligraphic Signature Seal */}
                <div className="w-full flex justify-center mb-3 sm:mb-4 z-20 pointer-events-none">
                    <DeadPoetsSignature className="w-60 sm:w-72 md:w-80" />
                </div>

                {/* Login Content Container (Seamless without card outline) */}
                <div className="w-full text-center px-2 sm:px-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400 mb-2 tracking-wide">
                        Enter the Society
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-400 font-serif italic mb-6 leading-relaxed max-w-sm mx-auto">
                        Gather among fellow spirits and share your verses with the world.
                    </p>

                    {/* Decorative rule */}
                    <div className="flex items-center justify-center gap-3 mb-7">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-700/60" />
                        <span className="text-amber-500/60 text-xs">✦</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-700/60" />
                    </div>

                    {/* Google OAuth Button Container */}
                    <div className="max-w-sm mx-auto">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full py-3.5 px-5 bg-stone-900/90 hover:bg-stone-900 border border-stone-700/80 hover:border-amber-600/60 text-stone-100 hover:text-white rounded-xl font-medium text-sm sm:text-base flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(217,119,6,0.15)] active:scale-[0.98] group"
                        >
                            <GoogleIcon />
                            <span className="group-hover:text-amber-100 transition-colors">Continue with Google</span>
                        </button>
                    </div>

                    {/* Poetic quote footnote */}
                    <p className="mt-8 text-[11px] sm:text-xs text-stone-500 font-serif italic tracking-wide">
                        "Carpe diem. Seize the day, make your lives extraordinary."
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;

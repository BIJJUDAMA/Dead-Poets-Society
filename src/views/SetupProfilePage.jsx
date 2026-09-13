/**
 * Onboarding screen for new users to configure their identity
 * 
 * Purpose:
 * - Collecting Display Name (Required)
 * - Collecting Bio (Optional, max 50 words)
 * - Profile Picture upload via `ImageUpload` component (If not uploaded the users google account image will be used)
 * 
 * Logic:
 * - Redirects if profile is already complete
 * - Updates the `profiles` table in Supabase
 */

"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase/config.js';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '@/components/common/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const countWords = (str) => str ? str.trim().split(/\s+/).filter(Boolean).length : 0;

const SetupProfilePage = () => {
    const { user, userProfile, refreshUserProfile } = useAuth();
    const router = useRouter();

    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [photoUrl, setPhotoUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const displayNameMax = 50;
    const displayNameValid = displayName.trim().length > 0 && displayName.length <= displayNameMax;

    const bioWordCount = useMemo(() => countWords(bio), [bio]);
    const isBioValid = bioWordCount <= 50;

    useEffect(() => {
        if (userProfile && userProfile.display_name) {
            router.push('/');
        }
    }, [userProfile, router]);

    /**
     * Form Submission:
     * Validates inputs locally before sending an UPDATE request to Supabase
     * Upon success, refreshes the global auth state and redirects to Home
     */
    // Saves the profile data to Supabase
    const handleProfileSetup = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!displayNameValid) {
            setErrorMessage("Please enter a valid display name.");
            return;
        }

        if (!isBioValid) {
            setErrorMessage("Bio exceeds word limit.");
            return;
        }

        setIsLoading(true);

        const profileUpdate = {
            display_name: displayName.trim(),
            bio: bio.trim(),
            photo_url: photoUrl || user.user_metadata.avatar_url,
            updated_at: new Date(),
        };

        const { error } = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', user.id);

        if (error) {
            console.error("Error updating profile:", error);
            setErrorMessage(error.message);
        } else {
            await refreshUserProfile();
            router.push('/');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-black text-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden selection:bg-amber-900/40 selection:text-amber-100">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-600/10 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-yellow-600/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="w-full bg-stone-950/90 border border-stone-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400 mb-2 tracking-wide">
                            Complete Your Profile
                        </h1>
                        <p className="text-xs sm:text-sm text-stone-400 font-serif italic">
                            Welcome, poet. Inscribe your name into the society rolls.
                        </p>
                        {/* Decorative rule */}
                        <div className="flex items-center justify-center gap-3 mt-4 mb-2">
                            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-700/60" />
                            <span className="text-amber-500/60 text-xs">✦</span>
                            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-700/60" />
                        </div>
                    </div>

                    <form onSubmit={handleProfileSetup} className="space-y-6">
                        <ImageUpload
                            onImageUploaded={(url) => setPhotoUrl(url)}
                            initialImage={user?.user_metadata?.avatar_url || '/defaultPfp.png'}
                        />

                        {errorMessage && (
                            <div className="bg-red-950/40 border border-red-800/60 text-red-300 p-3.5 rounded-xl text-xs sm:text-sm font-serif">
                                {errorMessage}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="displayName" className="flex justify-between items-center text-xs sm:text-sm text-stone-300 font-serif mb-1.5">
                                <span>Your Poet Name <span className="text-amber-500">*</span></span>
                                <span className={`text-xs font-mono ${displayName.length > displayNameMax ? 'text-red-400' : 'text-stone-500'}`}>
                                    {displayName.length}/{displayNameMax}
                                </span>
                            </Label>
                            <Input
                                id="displayName"
                                type="text"
                                placeholder="e.g. John Keats, Walt Whitman..."
                                value={displayName}
                                onChange={(e) => {
                                    setDisplayName(e.target.value);
                                    if (errorMessage) setErrorMessage(null);
                                }}
                                required
                                className="w-full bg-stone-900/90 border border-stone-800 text-stone-100 placeholder:text-stone-600 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 rounded-xl px-4 py-2.5 transition-colors text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="bio" className="flex justify-between items-center text-xs sm:text-sm text-stone-300 font-serif mb-1.5">
                                <span>Bio</span>
                                <span className={`text-xs font-mono ${isBioValid ? 'text-stone-500' : 'text-red-400'}`}>
                                    {bioWordCount}/50 words
                                </span>
                            </Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                placeholder="A few words on what stirs your verse..."
                                onChange={(e) => setBio(e.target.value)}
                                rows="3"
                                className="w-full bg-stone-900/90 border border-stone-800 text-stone-100 placeholder:text-stone-600 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 rounded-xl p-3.5 transition-colors resize-none text-sm font-serif leading-relaxed"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !isBioValid || !displayNameValid}
                            className="w-full py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-serif font-bold tracking-wide rounded-xl transition-all shadow-md hover:shadow-[0_0_20px_rgba(217,119,6,0.2)] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isLoading ? 'Inscribing...' : 'Save and Enter Society'}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default SetupProfilePage;

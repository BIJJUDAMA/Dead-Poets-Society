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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20 px-4"
        >
            <Card className="w-full max-w-lg bg-gray-900 border-gray-700 text-white">
                <CardHeader>
                    <CardTitle className="text-3xl">Complete Your Profile</CardTitle>
                    <CardDescription>Welcome, poet. Tell us about yourself.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileSetup} className="space-y-6">
                        <ImageUpload
                            onImageUploaded={(url) => setPhotoUrl(url)}
                            initialImage={user?.user_metadata?.avatar_url || '/defaultPfp.png'}
                        />

                        {errorMessage && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm">
                                {errorMessage}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="displayName" className="flex justify-between">
                                <span>Your Poet Name <span className="text-red-400">*</span></span>
                                <span className={displayName.length > displayNameMax ? 'text-red-500' : 'text-gray-400'}>
                                    {displayName.length}/{displayNameMax}
                                </span>
                            </Label>
                            <Input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => {
                                    setDisplayName(e.target.value);
                                    if (errorMessage) setErrorMessage(null);
                                }}
                                required
                                className="w-full bg-gray-800 p-2 rounded mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="bio" className="flex justify-between">
                                <span>Bio</span>
                                <span className={isBioValid ? 'text-gray-400' : 'text-red-500'}>{bioWordCount}/50 words</span>
                            </Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows="3"
                                className="w-full bg-gray-800 p-2 rounded mt-1"
                            ></Textarea>
                        </div>

                        <Button type="submit" disabled={isLoading || !isBioValid || !displayNameValid} className="w-full">
                            {isLoading ? 'Saving...' : 'Save and Enter Society'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default SetupProfilePage;

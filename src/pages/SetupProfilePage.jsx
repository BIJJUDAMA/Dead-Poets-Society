import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config.js';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const countWords = (str) => str ? str.trim().split(/\s+/).filter(Boolean).length : 0;

const SetupProfilePage = () => {
    const { user, userProfile, refreshUserProfile } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [photoUrl, setPhotoUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const bioWordCount = useMemo(() => countWords(bio), [bio]);
    const isBioValid = bioWordCount <= 50;

    useEffect(() => {
        if (userProfile && userProfile.display_name) {
            navigate('/');
        }
    }, [userProfile, navigate]);

    const handleProfileSetup = async (e) => {
        e.preventDefault();
        if (!displayName.trim() || !isBioValid) return;
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
            alert(`Error: ${error.message}`);
        } else {
            await refreshUserProfile();
            navigate('/');
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
                        <div>
                            <Label htmlFor="displayName">Your Poet Name</Label>
                            <Input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full bg-gray-800 p-2 rounded mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="bio" className="flex justify-between">
                                <span>Bio</span>
                                <span className={isBioValid ? 'text-gray-400' : 'text-red-500'}>{bioWordCount}/50 words</span>
                            </Label>
                            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows="3" className="w-full bg-gray-800 p-2 rounded mt-1"></Textarea>
                        </div>
                        <Button type="submit" disabled={isLoading || !isBioValid || !displayName.trim()} className="w-full">
                            {isLoading ? 'Saving...' : 'Save and Enter Society'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default SetupProfilePage;

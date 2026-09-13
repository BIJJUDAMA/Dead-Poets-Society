/**
 * A form for users to update their profile information
 * 
 * Purpose:
 * - Allows updating Display Name, Bio, and Profile Picture
 * - Integrates `ImageUpload` for avatar management
 * - Validates input limits (Bio word count)
 * 
 * Used In:
 * - `src/views/ProfilePage.jsx`
 */

"use client";
import { useState, useMemo } from 'react';
import { supabase } from '../../supabase/config.js';
import { useAuth } from '../../context/AuthContext';
import ImageUpload from '../common/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const countWords = (str) => str ? str.trim().split(/\s+/).filter(Boolean).length : 0;
const EditProfileModal = ({ onClose }) => {
    const { user, userProfile, refreshUserProfile } = useAuth();
    const [displayName, setDisplayName] = useState(userProfile.display_name || '');
    const [bio, setBio] = useState(userProfile.bio || '');
    const [photoUrl, setPhotoUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const bioWordCount = useMemo(() => countWords(bio), [bio]);
    const isBioValid = bioWordCount <= 50;

    // Updates user profile information
    const handleSaveChanges = async () => {
        if (!displayName.trim() || !isBioValid) return;
        setIsLoading(true);

        const profileUpdate = {
            display_name: displayName.trim(),
            bio: bio.trim(),
            updated_at: new Date(),
        };

        if (photoUrl) {
            profileUpdate.photo_url = photoUrl;
        }

        const { error } = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', user.id);

        if (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        } else {
            await refreshUserProfile();
            onClose();
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-5 pt-1">
            <div className="flex justify-center pb-2">
                <ImageUpload
                    onImageUploaded={(url) => setPhotoUrl(url)}
                    initialImage={userProfile.photo_url || '/defaultPfp.png'}
                />
            </div>
            <div>
                <Label className="block text-xs font-cinzel text-amber-200/90 font-semibold tracking-wider mb-1.5">
                    Your Poet Name
                </Label>
                <Input 
                    type="text" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    required 
                    className="w-full bg-stone-900/90 border-stone-800 text-stone-100 rounded-xl h-11 focus:border-amber-600/70" 
                    placeholder="e.g. John Keats"
                />
            </div>
            <div>
                <Label className="flex justify-between text-xs font-cinzel text-amber-200/90 font-semibold tracking-wider mb-1.5">
                    <span>Bio</span>
                    <span className={isBioValid ? 'text-stone-500 font-mono' : 'text-red-400 font-mono'}>
                        {bioWordCount}/50 words
                    </span>
                </Label>
                <Textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    rows="3" 
                    className="w-full bg-stone-900/90 border-stone-800 text-stone-100 rounded-xl font-serif italic focus:border-amber-600/70 resize-none p-3"
                    placeholder="A brief soul sketch..."
                />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-stone-900">
                <Button onClick={onClose} variant="ghost" className="text-stone-400 hover:text-white rounded-xl">
                    Cancel
                </Button>
                <Button 
                    onClick={handleSaveChanges} 
                    disabled={isLoading || !isBioValid || !displayName.trim()}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold rounded-xl px-6 shadow-md active:scale-95"
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
};

export default EditProfileModal;

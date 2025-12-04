"use client";
import { useState, useMemo } from 'react';
import { supabase } from '../supabase/config.js';
import { useAuth } from '../context/AuthContext';
import ImageUpload from './ImageUpload';
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
        <div className="space-y-6">
            <ImageUpload
                onImageUploaded={(url) => setPhotoUrl(url)}
                initialImage={userProfile.photo_url || '/defaultPfp.png'}
            />
            <div>
                <Label>Your Poet Name</Label>
                <Input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full bg-gray-700 p-2 rounded mt-1" />
            </div>
            <div>
                <Label className="flex justify-between">
                    <span>Bio</span>
                    <span className={isBioValid ? 'text-gray-400' : 'text-red-500'}>{bioWordCount}/50 words</span>
                </Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="3" className="w-full bg-gray-700 p-2 rounded mt-1"></Textarea>
            </div>
            <div className="flex justify-end gap-4">
                <Button onClick={onClose} variant="ghost">Cancel</Button>
                <Button onClick={handleSaveChanges} disabled={isLoading || !isBioValid}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
};

export default EditProfileModal;

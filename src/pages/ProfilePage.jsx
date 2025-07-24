import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/config.js';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import NotesGrid from '@/components/NotesGrid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EditProfileModal from '@/components/EditProfileModal';
import FollowListModal from '@/components/FollowListModal';

const ProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user, userProfile, refreshUserProfile } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [userContent, setUserContent] = useState({ poems: [] });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [followList, setFollowList] = useState({ visible: false, title: '', userIds: [] });

    const isFollowing = userProfile?.following?.includes(userId);
    const isOwnProfile = user?.id === userId;

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') throw profileError;

                if (profile) {
                    setProfileData(profile);
                    const { data: poems, error: poemsError } = await supabase
                        .from('notes')
                        .select('*')
                        .eq('user_id', userId);

                    if (poemsError) throw poemsError;
                    setUserContent({ poems: poems || [] });
                } else {
                    setProfileData({ deleted: true });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
            finally { setLoading(false); }
        };
        if (userId) {
            fetchProfile();
        }
    }, [userId, refreshUserProfile]);

    const handleFollow = async () => {
        if (!user || isOwnProfile) return;
        const { error } = await supabase.rpc('handle_follow', {
            p_target_user_id: userId,
            p_is_following: isFollowing
        });
        if (error) {
            console.error("Follow error:", error);
        } else {
            await refreshUserProfile();
            const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            setProfileData(updatedProfile);
        }
    };

    const handleDeleteAccount = async () => {
        if (!isOwnProfile) return;
        alert("Account deletion is a sensitive operation and should be handled by a secure Edge Function. This UI button is a placeholder.");
    };

    if (loading) return <div className="text-center py-20 text-white">Loading Profile...</div>;
    if (profileData?.deleted) return <div className="text-center py-20"><h1 className="text-4xl font-bold">A Poet Has Departed</h1><p className="text-gray-400 mt-4">This user's profile has been deleted.</p></div>;
    if (!profileData) return <div className="text-center py-20">User not found.</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto py-12 px-4">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader><DialogTitle>Edit Your Profile</DialogTitle></DialogHeader>
                    <EditProfileModal onClose={() => setIsEditing(false)} />
                </DialogContent>
            </Dialog>

            {followList.visible && <FollowListModal title={followList.title} userIds={followList.userIds} onClose={() => setFollowList({ visible: false, title: '', userIds: [] })} />}

            <div className="flex flex-col md:flex-row items-center gap-8 border-b border-gray-700 pb-8">
                <img src={profileData.photo_url || '/defaultPfp.png'} alt={profileData.display_name} className="w-32 h-32 rounded-full object-cover" />
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold font-cinzel">{profileData.display_name}</h1>
                    <p className="text-gray-400 mt-2 max-w-lg">{profileData.bio}</p>

                    {/* **FIX:** Restyled this section to use button-like elements with better spacing and white text */}
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                        <div className="bg-transparent text-white font-medium py-2 px-4 rounded-md">
                            <strong className="text-white mr-1">{userContent.poems.length}</strong> Poems
                        </div>
                        <button className="bg-transparent hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors" onClick={() => setFollowList({ visible: true, title: 'Followers', userIds: profileData.followers || [] })}>
                            <strong className="text-white mr-1">{profileData.followers?.length || 0}</strong> Followers
                        </button>
                        <button className="bg-transparent hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors" onClick={() => setFollowList({ visible: true, title: 'Following', userIds: profileData.following || [] })}>
                            <strong className="text-white mr-1">{profileData.following?.length || 0}</strong> Following
                        </button>
                    </div>

                    {isOwnProfile && (
                        <div className="flex gap-4 mt-4 justify-center md:justify-start">
                            <Button onClick={() => setIsEditing(true)} className="bg-gray-700 hover:bg-gray-600">Edit Profile</Button>
                            <Dialog>
                                <DialogTrigger asChild><Button variant="destructive">Delete Account</Button></DialogTrigger>
                                <DialogContent className="bg-gray-900 border-gray-700">
                                    <DialogHeader><DialogTitle>Are you absolutely sure?</DialogTitle><DialogDescription>This action cannot be undone. This will permanently delete your account and all associated poems.</DialogDescription></DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                        <Button variant="destructive" onClick={handleDeleteAccount}>Yes, Delete Account</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                    {!isOwnProfile && user && (
                        <Button onClick={handleFollow} variant={isFollowing ? 'secondary' : 'default'}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-3xl font-bold text-center mb-8">Published Poems</h2>
                {userContent.poems.length > 0 ? <NotesGrid notes={userContent.poems} /> : <p className="text-center text-gray-500">No poems published yet.</p>}
            </div>
        </motion.div>
    );
};

export default ProfilePage;

/**
 * Displays a user's public profile and their published work
 * 
 * Purpose:
 * - Shows user details (Bio, Photo, Stats)
 * - Lists all poems authored by the user
 * - Provides "Follow/Unfollow" functionality
 * - If the viewer is the owner, provides "Edit Profile" and "Delete Account" options
 * 
 * Key Features:
 * - Dynamic fetching based on `userId` param
 * - Real-time follow status updates
 * - "Delete Account" implementation via Supabase Edge Function (`delete-user`)
 */

"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/supabase/config.js';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import NotesGrid from '@/components/poems/NotesGrid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EditProfileModal from '@/components/modals/EditProfileModal';
import FollowListModal from '@/components/modals/FollowListModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const ProfilePage = ({ initialProfile, initialPoems = [] }) => {
    const { userId } = useParams();
    const router = useRouter();
    const { user, userProfile, refreshUserProfile } = useAuth();
    const [profileData, setProfileData] = useState(initialProfile);
    const [userContent, setUserContent] = useState({ poems: initialPoems });
    const [loading, setLoading] = useState(!initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [followList, setFollowList] = useState({ visible: false, title: '', userIds: [] });

    // State for bookmarked poems
    const [savedPoems, setSavedPoems] = useState([]);
    const [savedLoading, setSavedLoading] = useState(false);
    const [hasFetchedSaved, setHasFetchedSaved] = useState(false);

    const isFollowing = userProfile?.following?.includes(userId);
    const isOwnProfile = user?.id === userId;

    /**
     * Data Fetching:
     * Retrieves the profile metadata and the list of poems (notes) 
     * for the specific user ID.
     */
    // Fetches profile information and their poems
    const fetchProfileData = useCallback(async () => {
        if (!userId) return;
        // If we already have initial data and it matches the ID (implicit via SSR), we might skip loading state visual
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
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (poemsError) throw poemsError;
                setUserContent({ poems: poems || [] });
            } else {
                setProfileData({ deleted: true });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
        finally { setLoading(false); }
    }, [userId]);

    useEffect(() => {
        // Only fetch if we don't have initial data (navigation from client) or we need to refresh
        if (!initialProfile) {
            fetchProfileData();
        }
    }, [fetchProfileData, initialProfile]);

    /**
     * Fetch saved (bookmarked) poems for the current user
     */
    const fetchSavedPoems = async () => {
        if (!isOwnProfile || hasFetchedSaved) return;

        setSavedLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookmarks')
                .select('note_id, notes(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Extract the nested 'notes' objects into a flat array
            const formattedSavedPoems = data
                .map(item => item.notes)
                .filter(note => note !== null); // Remove nulls if a note was deleted

            setSavedPoems(formattedSavedPoems);
            setHasFetchedSaved(true);
        } catch (error) {
            console.error("Error fetching saved poems:", error);
        } finally {
            setSavedLoading(false);
        }
    };

    /**
     * Follow Logic:
     * Calls a database RPC function `handle_follow` to toggle the relationship
     * securely on the server side, ensuring data consistency.
     */
    // Handles follow/unfollow functionality using a Supabase RPC
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
            fetchProfileData();
        }
    };


    // Permanently deletes the user account via Edge Function
    const handleDeleteAccount = async () => {
        if (!isOwnProfile) return;


        const { error } = await supabase.functions.invoke('delete-user');

        if (error) {
            alert("Error deleting account: " + error.message);
            console.error("Delete error:", error);
        } else {

            await supabase.auth.signOut();
            alert("Your account has been successfully deleted.");
            router.push('/');
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Loading Profile...</div>;
    if (profileData?.deleted) return <div className="text-center py-20"><h1 className="text-4xl font-bold">A Poet Has Departed</h1><p className="text-gray-400 mt-4">This user's profile has been deleted.</p></div>;
    if (!profileData) return <div className="text-center py-20">User not found.</div>;


    const followerCount = profileData?.followers?.length || 0;
    const followingCount = profileData?.following?.length || 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto py-10 sm:py-14 px-4 text-white">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="w-[94vw] sm:w-[90vw] max-w-lg bg-stone-950 border border-stone-800 text-stone-100 rounded-2xl p-5 sm:p-6 shadow-2xl">
                    <DialogHeader className="pb-3 border-b border-stone-800/80">
                        <DialogTitle className="font-cinzel text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400">
                            Edit Your Profile
                        </DialogTitle>
                        <DialogDescription className="text-stone-400 font-serif italic text-xs sm:text-sm">
                            Make changes to your identity here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <EditProfileModal onClose={() => {
                        setIsEditing(false);
                        fetchProfileData();
                    }} />
                </DialogContent>
            </Dialog>

            {followList.visible && <FollowListModal title={followList.title} userIds={profileData[followList.title.toLowerCase()] || []} onClose={() => setFollowList({ visible: false, title: '', userIds: [] })} />}

            <div className="flex flex-col md:flex-row items-center gap-8 border-b border-stone-800/90 pb-8">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-stone-800 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex-shrink-0">
                    <Image src={profileData.photo_url || '/defaultPfp.png'} alt={profileData.display_name} fill className="object-cover" />
                </div>
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl sm:text-4xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400">
                        {profileData.display_name}
                    </h1>
                    {profileData.bio && (
                        <p className="text-stone-300 font-serif italic mt-2 max-w-lg leading-relaxed text-sm sm:text-base">
                            "{profileData.bio}"
                        </p>
                    )}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                        <div className="bg-stone-900/90 border border-stone-800 text-stone-200 font-medium py-1.5 px-3.5 rounded-xl flex items-center text-sm">
                            <strong className="text-amber-400 font-cinzel font-bold mr-1.5">{userContent.poems.length}</strong>
                            <span className="text-stone-400">Poems</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/50 text-stone-200 py-1.5 px-3.5 rounded-xl h-auto text-sm transition-all" 
                            onClick={() => setFollowList({ visible: true, title: 'Followers', userIds: profileData.followers || [] })}
                        >
                            <strong className="text-amber-400 font-cinzel font-bold mr-1.5">{followerCount}</strong>
                            <span className="text-stone-400">Followers</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/50 text-stone-200 py-1.5 px-3.5 rounded-xl h-auto text-sm transition-all" 
                            onClick={() => setFollowList({ visible: true, title: 'Following', userIds: profileData.following || [] })}
                        >
                            <strong className="text-amber-400 font-cinzel font-bold mr-1.5">{followingCount}</strong>
                            <span className="text-stone-400">Following</span>
                        </Button>
                    </div>

                    {isOwnProfile && (
                        <div className="flex items-center gap-3 mt-5 justify-center md:justify-start">
                            <Button 
                                onClick={() => setIsEditing(true)} 
                                className="bg-stone-900 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-600/60 text-stone-200 hover:text-white rounded-xl px-5 h-9 text-xs sm:text-sm font-medium transition-all shadow-sm"
                            >
                                Edit Profile
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl px-3 h-9 text-xs transition-colors">
                                        Delete Account
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[92vw] sm:w-[90vw] max-w-md bg-stone-950 border border-stone-800 text-stone-100 rounded-2xl p-6 shadow-2xl">
                                    <DialogHeader className="pb-2">
                                        <DialogTitle className="font-cinzel text-lg font-bold text-amber-100">Are you absolutely sure?</DialogTitle>
                                        <DialogDescription className="text-stone-400 font-serif italic text-sm mt-1">
                                            This action cannot be undone. This will permanently delete your identity and all your published verses.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="mt-4 gap-2">
                                        <DialogClose asChild>
                                            <Button variant="ghost" className="text-stone-400 hover:text-white rounded-xl">Cancel</Button>
                                        </DialogClose>
                                        <Button 
                                            variant="destructive" 
                                            onClick={handleDeleteAccount}
                                            className="bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-xl"
                                        >
                                            Yes, Delete Account
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    {!isOwnProfile && user && (
                        <Button 
                            onClick={handleFollow} 
                            className={`mt-5 rounded-xl px-6 h-10 text-sm font-medium transition-all ${
                                isFollowing 
                                    ? 'bg-stone-900/90 hover:bg-stone-800 border border-amber-600/60 text-amber-200 shadow-sm' 
                                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold shadow-md active:scale-95'
                            }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <Tabs defaultValue="published" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[360px] mx-auto bg-stone-900/90 border border-stone-800 rounded-xl p-1 mb-8">
                        <TabsTrigger 
                            value="published" 
                            className="rounded-lg text-stone-400 data-[state=active]:bg-stone-800 data-[state=active]:text-amber-200 font-cinzel text-xs sm:text-sm tracking-wide transition-all"
                        >
                            Published Verses
                        </TabsTrigger>
                        {isOwnProfile && (
                            <TabsTrigger 
                                value="saved" 
                                className="rounded-lg text-stone-400 data-[state=active]:bg-stone-800 data-[state=active]:text-amber-200 font-cinzel text-xs sm:text-sm tracking-wide transition-all" 
                                onClick={fetchSavedPoems}
                            >
                                Saved Verses
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="published">
                        {userContent.poems.length > 0 ? (
                            <NotesGrid notes={userContent.poems} />
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-stone-500 font-serif italic text-base">No verses published yet.</p>
                            </div>
                        )}
                    </TabsContent>

                    {isOwnProfile && (
                        <TabsContent value="saved">
                            {savedLoading ? (
                                <div className="text-center py-12 text-stone-400 font-serif italic">Loading saved verses...</div>
                            ) : savedPoems.length > 0 ? (
                                <NotesGrid notes={savedPoems} count={savedPoems.length} />
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-stone-400 font-serif italic text-base mb-4">You have not bookmarked any verses yet.</p>
                                    <Button 
                                        onClick={() => router.push('/poems')}
                                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold rounded-xl px-6 shadow-md active:scale-95"
                                    >
                                        Explore the Collection
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </motion.div>
    );
};

export default ProfilePage;

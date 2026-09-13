/**
 * A modal dialog that displays a list of users (Followers or Following)
 * 
 * Purpose:
 * - Shows a scrollable list of user avatars and display names in Dark Academia theme
 * - Fetches user details dynamically based on a passed array of `userIds`
 * - Navigates to the selected user's profile upon click
 * 
 * Used In:
 * - `src/views/ProfilePage.jsx`
 */

"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/config.js';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const FollowListModal = ({ title, userIds, onClose }) => {
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user profiles for the list of IDs
        const fetchUsers = async () => {
            if (!userIds || userIds.length === 0) {
                setUserList([]);
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', userIds);

                if (error) throw error;
                setUserList(data || []);
            } catch (error) {
                console.error("Error fetching user list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [userIds]);

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[92vw] sm:w-[90vw] max-w-md bg-stone-950 border border-stone-800 text-stone-100 rounded-2xl p-5 sm:p-6 shadow-2xl">
                <DialogHeader className="pb-3 border-b border-stone-800/80">
                    <DialogTitle className="font-cinzel text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400 flex items-center justify-between">
                        <span>{title}</span>
                        <span className="text-xs font-serif font-normal text-amber-500/80 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/40">
                            {userList.length}
                        </span>
                    </DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="py-8 text-center text-sm font-serif italic text-stone-400">
                        Gathering souls...
                    </div>
                ) : (
                    <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1 mt-3">
                        {userList.length > 0 ? userList.map(u => (
                            <Link 
                                href={`/profile/${u.id}`} 
                                onClick={onClose} 
                                key={u.id} 
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-900/90 border border-transparent hover:border-stone-800/80 transition-all group"
                            >
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-stone-800 group-hover:border-amber-500/50 flex-shrink-0">
                                    <Image src={u.photo_url || '/defaultPfp.png'} alt={u.display_name || 'User'} fill className="object-cover" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-serif font-medium text-stone-200 group-hover:text-amber-200 transition-colors truncate text-sm">
                                        {u.display_name || 'Anonymous Poet'}
                                    </span>
                                    {u.bio && (
                                        <span className="text-xs text-stone-500 italic truncate max-w-xs">
                                            {u.bio}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        )) : (
                            <p className="text-stone-500 text-sm font-serif italic text-center py-6">No souls to display.</p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default FollowListModal;

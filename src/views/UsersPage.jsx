/**
 * A directory of all poets (users) on the platform
 * 
 * Purpose:
 * - Allows users to discover other poets
 * - Provides search functionality by name
 * - Enables quick "Follow" actions directly from the list
 * 
 * Data:
 * - Fetches all profiles with a non-null display_name (Null display names were allowed before frontend checking was enforced) <---- Moved to server component
 */

"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/config.js';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const UsersPage = ({ initialUsers = [] }) => {
    const { user, userProfile, refreshUserProfile } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // Toggles follow status for a target user
    const handleFollow = async (targetUserId, isCurrentlyFollowing) => {
        if (!user) return;

        const { error: rpcError } = await supabase.rpc('handle_follow', {
            p_target_user_id: targetUserId,
            p_is_following: isCurrentlyFollowing
        });

        if (rpcError) {
            console.error("Follow/unfollow error:", rpcError);
        } else {
            await refreshUserProfile();
        }
    };

    const filteredUsers = initialUsers.filter(u =>
        u && u.display_name && u.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold text-center mb-8 font-cinzel text-white">Find a Poet</h1>
            <div className="relative mb-8">
                <Input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#1f2937] border-gray-700 h-12"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="space-y-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map(poet => {
                        const isFollowing = userProfile?.following?.includes(poet.id);
                        const isOwnProfile = user?.id === poet.id;
                        return (
                            <div key={poet.id} className="flex items-center justify-between gap-4 p-4 bg-gray-900 rounded-lg">
                                <Link href={`/profile/${poet.id}`} className="flex items-center gap-4 flex-grow min-w-0">
                                    <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border border-gray-700">
                                        <Image
                                            src={poet.photo_url || '/defaultPfp.png'}
                                            alt={poet.display_name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-bold text-white truncate">{poet.display_name}</h2>
                                        <p className="text-sm text-gray-400 truncate">{poet.bio}</p>
                                    </div>
                                </Link>
                                {user && !isOwnProfile && (
                                    <Button
                                        onClick={() => handleFollow(poet.id, isFollowing)}
                                        variant={isFollowing ? "secondary" : "default"}
                                        size="sm"
                                        className="flex-shrink-0"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </Button>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500">No poets found in the society yet.</p>
                )}
            </div>
        </motion.div>
    );
};

export default UsersPage;

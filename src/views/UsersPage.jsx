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
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase/config.js';
import Image from 'next/image';
import Link from 'next/link';
import { Search, UserPlus, UserCheck, X, Feather, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';

const PoetCard = React.memo(({ poet, index = 0, isFollowing, isOwnProfile, isLoading, onFollow, user, isSearching }) => {
    return (
        <div
            className={`group relative bg-stone-950/60 hover:bg-stone-900/80 border border-stone-800/90 hover:border-amber-700/60 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:scale-[1.015] ${
                !isSearching ? 'animate-poet-card' : ''
            }`}
            style={!isSearching ? { animationDelay: `${Math.min(index * 0.05, 0.45)}s` } : undefined}
        >
            <div className="flex items-start gap-4">
                {/* Profile Avatar */}
                <Link href={`/profile/${poet.id}`} className="relative flex-shrink-0 group/avatar">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-stone-700 group-hover:border-amber-500/70 transition-colors shadow-inner">
                        <Image
                            src={poet.photo_url || '/defaultPfp.png'}
                            alt={poet.display_name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                        />
                    </div>
                </Link>

                {/* Poet Details */}
                <div className="flex-1 min-w-0">
                    <Link href={`/profile/${poet.id}`} className="block group/name">
                        <h2 className="text-lg font-cinzel font-bold text-stone-100 group-hover:text-amber-200 transition-colors truncate">
                            {poet.display_name}
                        </h2>
                    </Link>
                    <p className="text-xs sm:text-sm text-stone-400 font-serif italic line-clamp-2 mt-1 leading-relaxed">
                        {poet.bio || "A quiet spirit in the society's hall."}
                    </p>
                </div>
            </div>

            {/* Card Footer: Follow Action & View Profile */}
            <div className="mt-4 pt-3.5 border-t border-stone-900 flex items-center justify-between">
                <Link 
                    href={`/profile/${poet.id}`}
                    className="text-xs font-serif text-stone-400 group-hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                    <span>View verses</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </Link>

                {user && !isOwnProfile && (
                    <button
                        onClick={() => onFollow(poet.id, isFollowing)}
                        disabled={isLoading}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border active:scale-95 disabled:opacity-50 ${
                            isFollowing
                                ? 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-700'
                                : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border-amber-600/60 hover:border-amber-500 shadow-[0_0_10px_rgba(217,119,6,0.15)]'
                        }`}
                    >
                        {isFollowing ? (
                            <>
                                <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                                <span>Following</span>
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                                <span>Follow</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
});

PoetCard.displayName = "PoetCard";

const UsersPage = ({ initialUsers = [] }) => {
    const { user, userProfile, refreshUserProfile } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [followingLoading, setFollowingLoading] = useState({});

    // Toggles follow status for a target user
    const handleFollow = useCallback(async (targetUserId, isCurrentlyFollowing) => {
        if (!user) return;

        setFollowingLoading(prev => ({ ...prev, [targetUserId]: true }));
        try {
            const { error: rpcError } = await supabase.rpc('handle_follow', {
                p_target_user_id: targetUserId,
                p_is_following: isCurrentlyFollowing
            });

            if (rpcError) {
                console.error("Follow/unfollow error:", rpcError);
            } else {
                await refreshUserProfile();
            }
        } finally {
            setFollowingLoading(prev => ({ ...prev, [targetUserId]: false }));
        }
    }, [user, refreshUserProfile]);

    const filteredUsers = initialUsers.filter(u =>
        u && u.display_name && u.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-black text-white">
            {/* Header */}
            <div className="text-center mb-10 animate-poet-header">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400 mb-2 tracking-wide">
                    Find a Poet
                </h1>
                
                {/* Decorative rule */}
                <div className="flex items-center justify-center gap-3 mt-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-700/60" />
                    <span className="text-amber-500/60 text-xs">✦</span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-700/60" />
                </div>
            </div>

            {/* Search Bar */}
            <div 
                className="max-w-2xl mx-auto mb-10 animate-poet-card"
                style={{ animationDelay: '0.1s' }}
            >
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Search poets by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 pr-10 bg-stone-900/90 hover:bg-stone-900 border-stone-800 focus:border-amber-600/70 focus:ring-amber-500/20 h-12 rounded-xl text-stone-100 placeholder:text-stone-500 text-sm sm:text-base transition-all shadow-inner"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500/70 w-5 h-5 pointer-events-none" />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                
                {/* Poet Count Subtitle */}
                <div className="flex items-center justify-between text-xs text-stone-500 px-2 mt-2 font-serif italic">
                    <span>
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'poet' : 'poets'} in the society
                    </span>
                    {searchTerm && (
                        <span>Searching for "{searchTerm}"</span>
                    )}
                </div>
            </div>

            {/* Poets Grid */}
            {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredUsers.map((poet, index) => {
                        const isFollowing = userProfile?.following?.includes(poet.id);
                        const isOwnProfile = user?.id === poet.id;
                        const isLoading = !!followingLoading[poet.id];

                        return (
                            <PoetCard
                                key={poet.id}
                                poet={poet}
                                index={index}
                                isFollowing={isFollowing}
                                isOwnProfile={isOwnProfile}
                                isLoading={isLoading}
                                onFollow={handleFollow}
                                user={user}
                                isSearching={!!searchTerm}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 px-4">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-stone-900/80 border border-stone-800 flex items-center justify-center text-amber-500/70">
                        <Feather className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-cinzel text-stone-200 mb-1">No Poets Discovered</h3>
                    <p className="text-sm font-serif italic text-stone-500 max-w-sm mx-auto">
                        No voices matching "{searchTerm}" echo in the halls. Try searching with a different name.
                    </p>
                </div>
            )}
        </div>
    );
};

export default UsersPage;

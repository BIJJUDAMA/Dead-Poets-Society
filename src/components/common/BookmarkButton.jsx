"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/config.js';
import { useAuth } from '../../context/AuthContext';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const BookmarkButton = ({ noteId, compact = false }) => {
    const { user } = useAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Check if the current user has already bookmarked this note
        const checkBookmark = async () => {
            if (user && noteId) {
                const { data } = await supabase
                    .from('bookmarks')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('note_id', noteId)
                    .single();

                if (data) {
                    setIsBookmarked(true);
                } else {
                    setIsBookmarked(false);
                }
            }
        };
        checkBookmark();
    }, [user, noteId]);

    // Toggles bookmark status
    const handleBookmark = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please log in to save a poem.");
            return;
        }
        if (isAnimating) return;

        setIsAnimating(true);
        const newBookmarkState = !isBookmarked;
        setIsBookmarked(newBookmarkState);

        if (newBookmarkState) {
            // Add bookmark
            const { error } = await supabase
                .from('bookmarks')
                .insert([{ user_id: user.id, note_id: noteId }]);

            if (error) {
                console.error("Error adding bookmark:", error);
                setIsBookmarked(false); // Revert on error
                alert("Could not save poem. Please try again.");
            }
        } else {
            // Remove bookmark
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('user_id', user.id)
                .eq('note_id', noteId);

            if (error) {
                console.error("Error removing bookmark:", error);
                setIsBookmarked(true); // Revert on error
                alert("Could not remove bookmark. Please try again.");
            }
        }

        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <motion.button
            onClick={handleBookmark}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={
                compact
                    ? `p-1.5 rounded-full border shadow-sm flex items-center justify-center transition-all duration-300 ${
                        isBookmarked
                            ? 'opacity-100 bg-[#852221] border-[#5a1413] text-[#fce7bb] shadow-[0_2px_6px_rgba(133,34,33,0.5)]'
                            : 'opacity-0 group-hover:opacity-100 bg-[#d8c3a5]/90 hover:bg-[#e4d4bd] border-[#8c6d48]/70 text-[#422c16] hover:text-[#261709] shadow-[0_2px_5px_rgba(50,30,10,0.25)]'
                    }`
                    : `p-2 rounded-lg border transition-all duration-300 flex items-center gap-2 ${
                        isBookmarked
                            ? 'bg-[#852221]/20 border-[#852221]/60 text-yellow-500'
                            : 'bg-stone-900/60 border-stone-700/60 text-stone-400 hover:text-stone-200 hover:border-stone-500'
                    }`
            }
            disabled={!user || isAnimating}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark poem"}
            title={!user ? "Log in to save poem" : isBookmarked ? "Saved to your bookmarks" : "Bookmark this poem"}
        >
            {isBookmarked ? (
                <BookmarkCheck
                    className={compact ? 'w-4 h-4 fill-current' : 'w-5 h-5 fill-yellow-500/20'}
                    strokeWidth={2.5}
                />
            ) : (
                <Bookmark
                    className={compact ? 'w-4 h-4' : 'w-5 h-5'}
                    strokeWidth={compact ? 2.2 : 1.8}
                />
            )}
        </motion.button>
    );
};

export default BookmarkButton;

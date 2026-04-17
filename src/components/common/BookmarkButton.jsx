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
            whileTap={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className={`transition-colors ${isBookmarked
                ? 'text-yellow-500'
                : 'text-gray-400 hover:text-white'
                }`}
            disabled={!user || isAnimating}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark poem"}
            title={!user ? "Log in to save poem" : ""}
        >
            {isBookmarked ? (
                <BookmarkCheck className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} fill-yellow-500/20`} strokeWidth={2.5} />
            ) : (
                <Bookmark className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`} strokeWidth={compact ? 2 : 1.5} />
            )}
        </motion.button>
    );
};

export default BookmarkButton;

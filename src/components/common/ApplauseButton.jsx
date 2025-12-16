/*
 * A like button of sorts
 * 
 * Purpose:
 * - Tracks user appreciation for a poem
 * - Syncs state with Supabase `applauses` table via RPC `toggle_applause`
 * - Animates on click for feedback
 * 
 * Used In:
 * - `src/views/NotePage.jsx`
 */

"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/config.js';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const ApplauseButton = ({ note }) => {
    const { user } = useAuth();
    const [applauseCount, setApplauseCount] = useState(note.applause_count || 0);
    const [isApplauded, setIsApplauded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Check if the current user has already applauded this note
        const checkApplause = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('applauses')
                    .select('note_id')
                    .eq('user_id', user.id)
                    .eq('note_id', note.id)
                    .single();

                if (data) {
                    setIsApplauded(true);
                } else {
                    setIsApplauded(false);
                }
            }
        };
        checkApplause();
    }, [user, note.id]);

    // Toggles applause status via RPCC
    const handleApplause = async () => {
        if (!user) {
            alert("Please log in to applaud a poem.");
            return;
        }
        if (isAnimating) return;

        setIsAnimating(true);

        setApplauseCount(prev => isApplauded ? prev - 1 : prev + 1);
        setIsApplauded(!isApplauded);

        const { error } = await supabase.rpc('toggle_applause', {
            p_note_id: note.id,
            p_is_applauded: isApplauded
        });

        if (error) {
            console.error("Error updating applause:", error);
            setApplauseCount(prev => isApplauded ? prev + 1 : prev - 1);
            setIsApplauded(isApplauded);
            alert("Could not register applause. Please try again.");
        }

        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <div className="flex items-center gap-2">
            <motion.button
                onClick={handleApplause}
                whileTap={{ scale: 1.5, rotate: -15 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className={`text-2xl transition-colors ${isApplauded ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                disabled={!user || isAnimating}
                aria-label="Applaud poem"
            >
                👏
            </motion.button>
            <span className="font-bold text-lg text-white">{applauseCount}</span>
        </div>
    );
};

export default ApplauseButton;

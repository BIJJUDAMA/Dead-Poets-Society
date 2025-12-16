/**
 * A flexible grid layout for displaying collections of poems.
 * 
 * Purpose:
 * - Renders a responsive grid of `NoteCard` components
 * - Can operate in two modes:
 *   1. **Controlled Mode:** Displays `notes` passed via props
 *   2. **Autonomous Mode:** Fetches `count` most recent notes internally 
 * 
 * Used In:
 * - `src/views/HomePage.jsx`
 * - `src/views/PoemsPage.jsx`
 * - `src/views/ProfilePage.jsx`
 */

"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/config.js';
import NoteCard from './NoteCard';
import SkeletonCard from '../common/SkeletonCard.jsx';

const NotesGrid = ({ notes: passedNotes, count = 8 }) => {
    const [internalNotes, setInternalNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (passedNotes) {
            return;
        }

        const fetchRecentNotes = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(count);

            if (error) {
                console.error("Error fetching recent notes:", error);
            } else {
                setInternalNotes(data || []);
            }
            setLoading(false);
        };

        // Fetch notes internally if not passed as prop
        fetchRecentNotes();
    }, [count, passedNotes]);

    const notesToDisplay = passedNotes || internalNotes;

    if (loading && !passedNotes) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {/* Render skeletons while loading */}
                {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {notesToDisplay.map((note) => (
                <NoteCard key={note.id} note={note} />
            ))}
        </div>
    );
};

export default NotesGrid;

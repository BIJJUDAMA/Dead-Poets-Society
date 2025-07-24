import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config.js';
import NoteCard from './NoteCard';
import SkeletonCard from './SkeletonCard.jsx';

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

        fetchRecentNotes();
    }, [count, passedNotes]);

    const notesToDisplay = passedNotes || internalNotes;

    if (loading && !passedNotes) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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

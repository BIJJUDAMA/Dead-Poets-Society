/**
 * A reusable card component for displaying a poem preview
 * 
 * Purpose:
 * - Renders a single poem's Title, Author, and Preview text
 * - Uses a custom "Post-It" style background image (`/postIt.png`)
 * - Encapsulated in `React.memo` for performance optimization in large lists
 * 
 * Used In:
 * - `src/components/NotesGrid.jsx`
 */

"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import BookmarkButton from '../common/BookmarkButton';

const NoteCard = React.memo(({ note }) => {
    // Animation variants for the card entrance
    const cardVariants = {
        hidden: { opacity: 0, y: 50, rotate: 5 },
        visible: { opacity: 1, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
            <Link href={`/note/${note.id}`} className="block relative group">
                {/* Floating Bookmark Button */}
                <div
                    className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        // Prevent the click from bubbling up to the Link component
                        e.preventDefault();
                    }}
                >
                    <BookmarkButton noteId={note.id} compact={true} />
                </div>

                <Card className="w-full h-72 border-none bg-transparent bg-no-repeat bg-center bg-contain flex flex-col justify-center transition-transform hover:scale-105" style={{ backgroundImage: "url('/postIt.png')" }}>
                    <CardContent className="text-center text-black font-handwriting p-6 pt-10">
                        <h3 className="text-2xl font-bold mb-2 truncate px-2">{note.title || "Poem"}</h3>

                        {/* Truncated author name */}
                        <p className="text-lg font-semibold mb-2 truncate">by {note.poet_name}</p>
                        <p className="text-lg overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                            {note.preview}
                        </p>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
});

export default NoteCard;

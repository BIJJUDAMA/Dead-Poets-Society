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
            <Link href={`/note/${note.id}`} className="block relative group h-72">
                {/* Floating Bookmark Button */}
                <div
                    className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => {
                        // Prevent the click from bubbling up to the Link component
                        e.preventDefault();
                    }}
                >
                    <BookmarkButton noteId={note.id} compact={true} />
                </div>

                <Card className="relative w-full h-full border-none bg-transparent flex flex-col justify-center overflow-hidden">
                    {/* Parallax Background Layer */}
                    <div
                        className="absolute inset-0 bg-no-repeat bg-center bg-contain transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                        style={{ backgroundImage: "url('/postIt.png')" }}
                    />

                    <CardContent className="relative z-10 text-center text-black font-handwriting h-full w-full flex items-center justify-center p-8">

                        {/*Default View: Title & Author (Fades out and up on hover) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:-translate-y-8 px-6 pt-4">
                            <h3 className="text-3xl font-bold mb-3 w-full px-2 leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {note.title || "Untitled Poem"}
                            </h3>
                            <p className="text-xl font-medium text-stone-800 truncate w-full px-4">
                                by {note.poet_name}
                            </p>
                        </div>

                        {/* Hover View: Poem Text (Fades in and up from below on hover) */}
                        <div className="absolute inset-0 flex flex-col justify-center items-center transition-all duration-500 ease-in-out opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 px-8 pt-4 pointer-events-none">
                            <p className="text-xl leading-relaxed text-stone-900 overflow-hidden text-ellipsis italic" style={{ display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' }}>
                                "{note.preview}"
                            </p>
                        </div>

                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
});

export default NoteCard;

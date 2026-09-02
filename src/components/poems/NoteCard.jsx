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

const NoteCard = React.memo(({ note, animate = true }) => {
    // Animation variants for the card entrance
    const cardVariants = {
        hidden: { opacity: 0, y: 50, rotate: 5 },
        visible: { opacity: 1, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    const initial = animate ? "hidden" : "visible";
    const animateState = animate ? "visible" : "visible";

    return (
        <motion.div 
            variants={cardVariants} 
            initial={initial} 
            animate={animateState}
            whileInView={animate ? "visible" : "visible"} 
            viewport={{ once: true, amount: 0.5 }}
            className="flex justify-center"
        >
            <Link href={`/note/${note.id}`} className="block relative group w-full max-w-[280px] h-72">
                <Card className="relative w-full h-full border-none bg-transparent flex flex-col justify-center items-center overflow-hidden p-0 shadow-none">
                    {/* Parallax Background Layer */}
                    <div
                        className="absolute inset-0 bg-no-repeat bg-center bg-contain transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-1 pointer-events-none"
                        style={{ backgroundImage: "url('/postIt.png')" }}
                    />

                    {/* Rustic Bookmark Button - Positioned diagonally inward on the parchment paper */}
                    <div
                        data-boneyard-ignore
                        className="absolute top-7 right-7 sm:top-8 sm:right-8 z-20"
                        onClick={(e) => {
                            // Prevent click from bubbling up to the Link component
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <BookmarkButton noteId={note.id} compact={true} />
                    </div>

                    <CardContent className="relative z-10 text-center text-black font-handwriting h-full w-full flex items-center justify-center p-0 select-none">

                        {/* Default View: Title & Author (Fades out and up on hover) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:-translate-y-6 px-7 pt-9 pb-6 pointer-events-none">
                            <h3 
                                className="text-xl sm:text-2xl font-bold mb-2 text-[#24170a] leading-tight w-full max-w-[88%] break-words" 
                                style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            >
                                {note.title || "Untitled Poem"}
                            </h3>
                            <p className="text-sm sm:text-base font-medium text-[#4e3820] truncate w-full max-w-[80%]">
                                by {note.poet_name || "Anonymous"}
                            </p>
                        </div>

                        {/* Hover View: Poem Text (Fades in and up from below on hover) */}
                        <div className="absolute inset-0 flex flex-col justify-center items-center transition-all duration-500 ease-in-out opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 px-7 pt-9 pb-6 pointer-events-none">
                            <p 
                                className="text-sm sm:text-base leading-relaxed text-[#24170a] overflow-hidden text-ellipsis italic w-full max-w-[88%] break-words" 
                                style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' }}
                            >
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

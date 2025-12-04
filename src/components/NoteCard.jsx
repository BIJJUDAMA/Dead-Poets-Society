"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const NoteCard = React.memo(({ note }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 50, rotate: 5 },
        visible: { opacity: 1, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
            <Link href={`/note/${note.id}`}>
                <Card className="w-full h-72 border-none bg-transparent bg-no-repeat bg-center bg-contain flex flex-col justify-center transition-transform hover:scale-105" style={{ backgroundImage: "url('/postIt.png')" }}>
                    <CardContent className="text-center text-black font-handwriting p-6">
                        <h3 className="text-2xl font-bold mb-2 truncate">{note.title || "Poem"}</h3>
                        {/* **FIX:** Use snake_case for poet_name */}
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

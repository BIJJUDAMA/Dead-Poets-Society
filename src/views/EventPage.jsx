/**
 * EventPage View
 * 
 * Displays the gallery of events conducted by the club
 * 
 * Purpose:
 * - Lists events from the static `eventDb` (src/data/eventDb.js) <----- File to be moved to src/data/eventDb.js (Right now it's a single source of truth for events. If size gets too big and a lot of images need to be stored, we can think of moving to a CMS or database)
 * - Provides entry points to detailed event reports (`EventDetailPage`)
 * - Uses responsive grid layout for event cards
 */

"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { eventDb } from '@/data/eventDb';


const EventPage = () => {
    // Convert eventDb object to an array for mapping
    const eventsList = Object.entries(eventDb).map(([slug, event]) => ({
        slug,
        ...event
    }));

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-cinzel font-bold text-center mb-12"
            >
                Society's Events
            </motion.h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {eventsList.map((event) => (
                    <motion.div
                        key={event.slug}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        viewport={{ once: true }}
                    >
                        <Link href={`/event/${event.slug}`}>
                            <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-colors cursor-pointer h-full flex flex-col">
                                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                    <img
                                        src={event.mainImage}
                                        alt={event.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                                        {event.category}
                                    </div>
                                </div>
                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <CardTitle className="text-xl font-bold mb-2 text-gray-100">{event.name}</CardTitle>
                                    <div className="text-sm text-gray-400 mb-4 flex justify-between items-center">
                                        <span>{event.displayDate}</span>
                                        <span className="truncate max-w-[50%]">{event.venue}</span>
                                    </div>
                                    <CardDescription className="text-gray-400 line-clamp-3">
                                        {event.report}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default EventPage;

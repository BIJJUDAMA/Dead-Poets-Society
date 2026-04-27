/**
 * EventPage View
 * 
 * Displays the gallery of events conducted by the club
 * 
 * Purpose:
 * - Lists events from the static `eventDb` (src/data/eventDb.js)
 * - Provides entry points to detailed event reports (`EventDetailPage`)
 * - Uses the `eventcardpng.png` parchment card template as the card background
 *   to give each event a vintage, handwritten aesthetic.
 */

"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';

const EventCard = ({ event, index }) => {
    const truncatedReport = event.report
        ? event.report.substring(0, 120) + (event.report.length > 120 ? '...' : '')
        : 'Coming soon...';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative w-full max-w-sm mx-auto"
            style={{ aspectRatio: '460 / 640' }}
        >
            <Link href={`/event/${event.slug}`} className="block w-full h-full group">
                {/* Parchment card background */}
                <div
                    className="relative w-full h-full"
                    style={{
                        backgroundImage: 'url(/eventcardpng.png)',
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Photo inset — positioned to match the rectangular cutout in the PNG */}
                    <div
                        className="absolute overflow-hidden"
                        style={{
                            top: '5%',
                            left: '8%',
                            right: '8%',
                            height: '43%',
                        }}
                    >
                        <img
                            src={event.mainImage}
                            alt={event.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>

                    {/* Text content area — below the photo, matching the parchment's lower half */}
                    <div
                        className="absolute flex flex-col"
                        style={{
                            top: '51%',
                            left: '10%',
                            right: '10%',
                            bottom: '12%',
                        }}
                    >
                        {/* Event name in Homemade Apple cursive */}
                        <h2
                            className="text-2xl sm:text-3xl text-stone-800 mb-1 leading-tight"
                            style={{ fontFamily: 'var(--font-homemade-apple)' }}
                        >
                            {event.name}
                        </h2>

                        {/* Underline */}
                        <div className="border-b border-stone-700/60 mb-3" />

                        {/* Date & Venue row */}
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1.5 text-stone-700 text-xs">
                                <Calendar className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                                <span style={{ fontFamily: 'var(--font-homemade-apple)', fontSize: '0.7rem' }}>
                                    {event.displayDate}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-700 text-xs">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                                <span style={{ fontFamily: 'var(--font-homemade-apple)', fontSize: '0.7rem' }}>
                                    {event.venue}
                                </span>
                            </div>
                        </div>

                        {/* Report snippet */}
                        <p
                            className="text-stone-700 leading-snug"
                            style={{ fontFamily: 'var(--font-homemade-apple)', fontSize: '0.68rem' }}
                        >
                            {truncatedReport}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

const EventPage = ({ eventsList }) => {
    return (
        <div className="min-h-screen bg-black text-white px-6 py-12">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-cinzel font-bold text-center mb-16"
            >
                Society's Events
            </motion.h1>

            <div className="flex flex-wrap justify-center gap-10 max-w-5xl mx-auto">
                {eventsList.map((event, index) => (
                    <div key={event.slug} className="w-full sm:w-[320px]">
                        <EventCard event={event} index={index} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventPage;

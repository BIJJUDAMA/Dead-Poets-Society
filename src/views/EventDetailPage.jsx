/**
 * EventDetailPage View
 * 
 * Renders the full details of a specific event
 * 
 * Purpose:
 * - Shows comprehensive information: Report, Date, Venue, Category
 * - Displays multimedia: Hero image, Gallery collage, and Poster
 * - Handles invalid IDs with a "Not Found" state
 * 
 * Architecture:
 * - Dynamic routing based on `id` prop (passed from Next.js page wrapper)
 * - Component composition with `GalleryCollage` <---- Dyanmic collage making component (Supports MAX 10 IMAGES)
 */

"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Tag, Feather } from 'lucide-react';
import GalleryCollage from '@/components/common/GalleryCollage';

const EventDetailPage = ({ event }) => {
    // Event data is passed from the Server Component via SSG
    if (!event) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-amber-900/40 selection:text-amber-100">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none" />
                <h1 className="text-4xl font-cinzel font-bold text-stone-100 mb-4">Event Not Found</h1>
                <Link href="/event">
                    <Button variant="outline" className="bg-stone-900 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-600/60 text-stone-200 hover:text-white rounded-xl font-serif">
                        Back to Events
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-serif relative overflow-hidden selection:bg-amber-900/40 selection:text-amber-100">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-yellow-600/5 blur-[140px] rounded-full pointer-events-none" />

            {/* Hero Image Section */}
            <div className="relative h-[50vh] min-h-[360px] w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 z-10 pointer-events-none" />
                <img
                    src={event.mainImage}
                    alt={event.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full pb-8 z-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7 }}
                                >
                                    <span className="bg-amber-950/70 border border-amber-600/60 text-amber-200 text-xs font-serif italic px-3.5 py-1 rounded-full shadow-[0_0_12px_rgba(217,119,6,0.25)] mb-3 inline-block">
                                        {event.category}
                                    </span>
                                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-cinzel font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400 tracking-wide">
                                        {event.name}
                                    </h1>
                                    <p className="block lg:hidden text-stone-300 font-serif italic mt-2 text-sm sm:text-base">
                                        {event.displayDate} | {event.venue}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
                <Link href="/event">
                    <Button variant="ghost" className="mb-8 px-4 py-2 hover:bg-stone-900/80 text-stone-400 hover:text-amber-300 border border-stone-800/80 rounded-xl transition-all font-serif text-sm inline-flex items-center gap-2 group">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                    </Button>
                </Link>

                {/* Main Content Areas: Report/Gallery and Details/Poster */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {event.report && (
                                <>
                                    <h2 className="text-2xl font-cinzel font-bold text-amber-100 mb-4">About The Event</h2>
                                    <div className="bg-stone-950/80 backdrop-blur-md rounded-2xl border border-stone-800 p-6 sm:p-8 shadow-2xl mb-8">
                                        <p className="text-stone-300 font-serif text-base sm:text-lg leading-relaxed whitespace-pre-line">
                                            {event.report}
                                        </p>
                                    </div>
                                </>
                            )}

                            {event.gallery && event.gallery.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-2xl font-cinzel font-bold text-amber-100 mb-4">Gallery</h3>
                                    <GalleryCollage images={event.gallery} />
                                </div>
                            )}
                        </motion.div>
                    </div>

                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="hidden lg:block bg-stone-950/80 backdrop-blur-md p-6 rounded-2xl border border-stone-800 shadow-2xl"
                        >
                            <h3 className="text-xl font-cinzel font-bold text-white mb-4">Event Details</h3>

                            <div className="flex items-start mb-4">
                                <Calendar className="mr-3 h-5 w-5 text-amber-400/90 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-stone-200">Date</p>
                                    <p className="text-stone-400">{event.displayDate}</p>
                                </div>
                            </div>

                            <div className="flex items-start mb-6">
                                <MapPin className="mr-3 h-5 w-5 text-amber-400/90 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-stone-200">Venue</p>
                                    <p className="text-stone-400">{event.venue}</p>
                                </div>
                            </div>

                            <div className="flex items-start mb-6">
                                <Tag className="mr-3 h-5 w-5 text-amber-400/90 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-stone-200">Category</p>
                                    <p className="text-stone-400">{event.category}</p>
                                </div>
                            </div>
                        </motion.div>

                        {event.poster && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-8 bg-stone-950/80 backdrop-blur-md p-4 rounded-2xl border border-stone-800 shadow-2xl"
                            >
                                <h3 className="text-xl font-cinzel font-bold text-white mb-4">Poster</h3>
                                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-stone-800/80 shadow-inner group">
                                    <img
                                        src={event.poster}
                                        alt="Event Poster"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;

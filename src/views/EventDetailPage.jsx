"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { eventDb } from '../data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Tag } from 'lucide-react';
import GalleryCollage from '@/components/GalleryCollage';

const EventDetailPage = ({ id }) => {
    const event = eventDb[id];

    if (!event) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl mb-4">Event Not Found</h1>
                <Link href="/event">
                    <Button variant="outline" className="text-black">Back to Events</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <div className="relative h-[50vh] w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
                <img
                    src={event.mainImage}
                    alt={event.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full pb-8 z-20">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                                        {event.category}
                                    </span>
                                    <h1 className="text-4xl md:text-6xl font-cinzel font-bold mb-4">
                                        {event.name}
                                    </h1>
                                    <p className="block lg:hidden text-gray-200 mt-2 text-lg font-medium">
                                        {event.displayDate} | {event.venue}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Link href="/event">
                    <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-gray-300 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                    </Button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >


                            <h2 className="text-2xl font-bold mb-4 text-gray-200">Event Report</h2>
                            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line mb-8">
                                {event.report}
                            </p>

                            {event.gallery && event.gallery.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold mb-4 text-gray-200">Gallery</h3>
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
                            className="hidden lg:block bg-gray-900 p-6 rounded-lg border border-gray-800"
                        >
                            <h3 className="text-xl font-bold mb-4 text-white">Event Details</h3>

                            <div className="flex items-start mb-4">
                                <Calendar className="mr-3 h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="font-semibold text-gray-200">Date</p>
                                    <p className="text-gray-400">{event.displayDate}</p>
                                </div>
                            </div>

                            <div className="flex items-start mb-6">
                                <MapPin className="mr-3 h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="font-semibold text-gray-200">Venue</p>
                                    <p className="text-gray-400">{event.venue}</p>
                                </div>
                            </div>

                            <div className="flex items-start mb-6">
                                <Tag className="mr-3 h-5 w-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="font-semibold text-gray-200">Category</p>
                                    <p className="text-gray-400">{event.category}</p>
                                </div>
                            </div>
                        </motion.div>

                        {event.poster && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-8 bg-gray-900 p-4 rounded-lg border border-gray-800"
                            >
                                <h3 className="text-xl font-bold mb-4 text-white">Poster</h3>
                                <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                                    <img
                                        src={event.poster}
                                        alt="Event Poster"
                                        className="w-full h-full object-cover"
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

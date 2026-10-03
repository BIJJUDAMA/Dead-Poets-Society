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
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
const EventCard = React.memo(({ event, index = 0, animate = true }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [photoLoaded, setPhotoLoaded] = useState(false);
    const [frameLoaded, setFrameLoaded] = useState(false);
    const photoRef = useRef(null);
    const frameRef = useRef(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (photoRef.current?.complete && photoRef.current?.naturalWidth !== 0) {
            setPhotoLoaded(true);
        }
        if (frameRef.current?.complete && frameRef.current?.naturalWidth !== 0) {
            setFrameLoaded(true);
        }
    }, [event.mainImage]);

    const isReady = photoLoaded && frameLoaded;

    const truncatedReport = event.report
        ? event.report.substring(0, isMobile ? 80 : 120) + (event.report.length > (isMobile ? 80 : 120) ? '...' : '')
        : 'Coming soon...';

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: index * 0.15 } }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial={animate ? "hidden" : "visible"}
            animate="visible"
            whileHover={animate && isReady ? { scale: 1.02, y: -4, transition: { duration: 0.25, ease: "easeOut" } } : undefined}
            className="relative w-full max-w-sm mx-auto cursor-pointer drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] hover:drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] transition-[filter] duration-300"
            style={{ aspectRatio: '460 / 640' }}
        >
            {/* Skeleton placeholder shown while either image is loading */}
            {!isReady && (
                <div className="absolute inset-0 bg-stone-900/60 border border-stone-800/80 rounded-2xl animate-pulse flex flex-col justify-between p-6 z-30 pointer-events-none">
                    <div className="w-full h-[48%] bg-stone-800/50 rounded-xl" />
                    <div className="space-y-3">
                        <div className="w-2/3 h-6 bg-stone-800/50 rounded mx-auto" />
                        <div className="w-1/2 h-4 bg-stone-800/40 rounded mx-auto" />
                        <div className="w-full h-10 bg-stone-800/30 rounded" />
                    </div>
                </div>
            )}

            <Link
                href={`/event/${event.slug}`}
                className={`block w-full h-full transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="relative w-full h-full">
                    {/* Photo sits at z-0, beneath the parchment frame */}
                    <div
                        className="absolute overflow-hidden"
                        style={{
                            top: '4%',
                            left: '6%',
                            right: '6%',
                            height: '50%',
                            zIndex: 0,
                        }}
                    >
                        <img
                            ref={photoRef}
                            src={event.mainImage}
                            alt={event.name}
                            onLoad={() => setPhotoLoaded(true)}
                            className="w-full h-full object-cover"
                            loading="eager"
                        />
                    </div>

                    {/* Parchment card overlaid on top of the photo so torn edges frame it */}
                    <img
                        ref={frameRef}
                        src="/eventcardpng.png"
                        alt=""
                        onLoad={() => setFrameLoaded(true)}
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                        style={{ zIndex: 10 }}
                        loading="eager"
                    />

                    {/* Text content area — above parchment layer */}
                    <div
                        className="absolute flex flex-col"
                        style={{
                            top: '51%',
                            left: '10%',
                            right: '10%',
                            bottom: '12%',
                            zIndex: 20,
                        }}
                    >
                        {/* Event name in Homemade Apple cursive */}
                        <h2
                            className="text-3xl sm:text-4xl text-stone-800 mb-1 leading-tight text-center"
                            style={{ fontFamily: 'var(--font-homemade-apple)' }}
                        >
                            {event.name}
                        </h2>

                        {/* Underline */}
                        <div className="border-b border-stone-700/60 mb-3" />

                        {/* Date & Venue row */}
                        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                            <div className="flex items-center gap-1 sm:gap-1.5 text-stone-700">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={1.5} />
                                <span style={{ fontFamily: 'var(--font-homemade-apple)', fontSize: isMobile ? '0.75rem' : '1rem' }}>
                                    {event.displayDate}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5 text-stone-700">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={1.5} />
                                <span style={{ fontFamily: 'var(--font-homemade-apple)', fontSize: isMobile ? '0.75rem' : '1rem' }}>
                                    {event.venue}
                                </span>
                            </div>
                        </div>

                        {/* Report snippet */}
                        <p
                            className="text-stone-700 leading-snug"
                            style={{ fontFamily: 'var(--font-homemade-apple)', fontSize: isMobile ? '0.7rem' : '0.95rem' }}
                        >
                            {truncatedReport}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
});

const EventPage = ({ eventsList = [] }) => {
    return (
        <div className="min-h-screen bg-black text-white px-6 py-12 relative overflow-hidden selection:bg-amber-900/40 selection:text-amber-100">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-yellow-600/5 blur-[140px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-12 sm:mb-16 relative z-10"
            >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400 mb-2 tracking-wide">
                    Society's Events
                </h1>
                
                {/* Decorative rule */}
                <div className="flex items-center justify-center gap-3 mt-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-700/60" />
                    <span className="text-amber-500/60 text-xs">✦</span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-700/60" />
                </div>
            </motion.div>

            {eventsList && eventsList.length > 0 ? (
                <div className="relative z-10 flex flex-wrap justify-center gap-12 max-w-7xl mx-auto">
                    {eventsList.map((event, index) => (
                        <div key={event?.slug || index} className="w-full sm:w-[420px]">
                            <EventCard event={event} index={index} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="relative z-10 text-center py-16 px-4">
                    <h3 className="text-xl font-cinzel text-stone-300">No Events Found</h3>
                </div>
            )}
        </div>
    );
};

export default EventPage;

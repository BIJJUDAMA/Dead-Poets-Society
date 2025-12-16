/**
 * GalleryCollage Component
 * 
 * A smart, responsive image gallery that adapts its layout based on the content of the images
 * It automatically detects whether images are predominantly portrait or landscape and chooses
 * the best display mode:
 * - 'portrait': Uses a masonry-style column layout
 * - 'landscape': Uses a uniform grid layout
 * - 'mixed': Uses a justified flexbox layout that respects aspect ratios
 * 
 * Features:
 * - Preloads images to calculate dimensions and aspect ratios
 * - Shows a skeleton loading state while analyzing images
 * - Uses Framer Motion for smooth entrance animations
 * 
 * Used In:
 * - `src/views/EventDetailPage.jsx`
 */

"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const GalleryCollage = ({ images }) => {
    // State to hold image data enhanced with orientation and aspect ratio
    const [processedImages, setProcessedImages] = useState([]);
    // Loading state to show skeletons while calculating layouts
    const [loading, setLoading] = useState(true);
    // Determines the visual structure: 'mixed', 'portrait', or 'landscape'
    const [layoutMode, setLayoutMode] = useState('mixed');

    useEffect(() => {
        const loadImages = async () => {
            setLoading(true);
            /**
             * Load all images asynchronously to get their natural dimensions.
             * This allows us to calculate aspect ratios and determine orientation
             * BEFORE rendering, preventing layout shifts and enabling smart layout choices.
             */
            // Load images and determine orientation/aspect ratio
            const loadedImages = await Promise.all(
                images.map(src => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.src = src;
                        img.onload = () => {
                            resolve({
                                src,
                                orientation: img.width > img.height ? 'landscape' : 'portrait',
                                aspectRatio: img.width / img.height
                            });
                        };
                        img.onerror = () => {
                            resolve({
                                src,
                                orientation: 'landscape',
                                aspectRatio: 1.5
                            });
                        };
                    });
                })
            );


            /**
             * Analyze the composition of the gallery
             * If > 70% of images are portrait, switch to a column-based masonry layout
             * If > 70% of images are landscape, use a grid layout
             * Otherwise, default to a mixed "justified" layout that handles both well
             */
            const portraitCount = loadedImages.filter(img => img.orientation === 'portrait').length;
            const landscapeCount = loadedImages.filter(img => img.orientation === 'landscape').length;
            const total = loadedImages.length;

            let mode = 'mixed';
            if (portraitCount / total > 0.7) mode = 'portrait';
            else if (landscapeCount / total > 0.7) mode = 'landscape';

            // Determine the layout mode based on image composition
            setLayoutMode(mode);
            setProcessedImages(loadedImages);
            setLoading(false);
        };

        if (images && images.length > 0) {
            loadImages();
        }
    }, [images]);

    // Display skeleton loaders while images are being processed
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
                {images.map((_, idx) => (
                    <Skeleton
                        key={idx}
                        className="w-full h-full rounded-lg bg-gray-800 min-h-[200px]"
                    />
                ))}
            </div>
        );
    }
    // Portrait Mode: Best for vertical images 
    // Uses CSS columns to create a masonry effect where items stack vertically
    if (layoutMode === 'portrait') {
        return (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                <AnimatePresence>
                    {processedImages.map((img, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="break-inside-avoid rounded-lg overflow-hidden relative group"
                        >
                            <img
                                src={img.src}
                                alt={`Gallery ${idx}`}
                                className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        );
    }
    // Landscape Mode: Best for horizontal images 
    // Uses a standard grid for a clean, uniform look
    if (layoutMode === 'landscape') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {processedImages.map((img, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="rounded-lg overflow-hidden relative group aspect-video"
                        >
                            <img
                                src={img.src}
                                alt={`Gallery ${idx}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        );
    }

    // Mixed Mode: Best for mixed content
    // Uses a flexbox technique to create rows of equal height but varying widths
    // The trick involves setting flex-grow proportional to the aspect ratio
    return (
        <div className="flex flex-wrap gap-4 justify-center">
            <AnimatePresence>
                {processedImages.map((img, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="relative rounded-lg overflow-hidden group flex-grow"
                        style={{
                            // Width calculation ensures rows fill up nicely
                            width: `${img.aspectRatio * 250}px`,
                            flexGrow: img.aspectRatio,
                        }}
                    >
                        {/* 
                          padding-bottom hack isn't strictly necessary with flex-grow here, 
                          but can help preserve space if images load slowly in some contexts
                          However, since we preload, this acts mainly as a container sizer
                        */}
                        <div style={{ paddingBottom: `${(1 / img.aspectRatio) * 100}%` }}></div>
                        <img
                            src={img.src}
                            alt={`Gallery ${idx}`}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default GalleryCollage;

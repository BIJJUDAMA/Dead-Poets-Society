"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const GalleryCollage = ({ images }) => {
    const [processedImages, setProcessedImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [layoutMode, setLayoutMode] = useState('mixed');

    useEffect(() => {
        const loadImages = async () => {
            setLoading(true);
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

            // Analyze orientations
            const portraitCount = loadedImages.filter(img => img.orientation === 'portrait').length;
            const landscapeCount = loadedImages.filter(img => img.orientation === 'landscape').length;
            const total = loadedImages.length;

            let mode = 'mixed';
            if (portraitCount / total > 0.7) mode = 'portrait';
            else if (landscapeCount / total > 0.7) mode = 'landscape';

            setLayoutMode(mode);
            setProcessedImages(loadedImages);
            setLoading(false);
        };

        if (images && images.length > 0) {
            loadImages();
        }
    }, [images]);

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

                            width: `${img.aspectRatio * 250}px`,
                            flexGrow: img.aspectRatio,
                        }}
                    >

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

"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';

const ShareQuoteModal = ({ isOpen, onClose, selectedText, title, author }) => {
    const graphicRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [canWebShare, setCanWebShare] = useState(false);

    // Check if the browser supports the Web Share API with files
    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.canShare) {
            // A pseudo-check to see if file sharing is supported
            setCanWebShare(true);
        }
    }, []);

    // Helper to extract a clean excerpt if it's too long
    const excerpt = selectedText?.length > 300
        ? selectedText.substring(0, 300) + "..."
        : selectedText;

    const generateImage = async () => {
        if (!graphicRef.current) return null;
        try {
            const canvas = await html2canvas(graphicRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: null, // Let the inline styles handle it
            });
            return canvas;
        } catch (error) {
            console.error("Error generating image:", error);
            return null;
        }
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        const canvas = await generateImage();
        if (canvas) {
            const link = document.createElement('a');
            link.download = `quote-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        setIsGenerating(false);
    };

    const handleNativeShare = async () => {
        if (!canWebShare) return;
        setIsGenerating(true);
        const canvas = await generateImage();
        if (canvas) {
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], 'quote.png', { type: 'image/png' });
                try {
                    await navigator.share({
                        title: `Snippet from ${title}`,
                        text: `A beautiful verse by ${author}`,
                        files: [file],
                    });
                } catch (error) {
                    console.log("Error sharing natively:", error);
                } finally {
                    setIsGenerating(false);
                }
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-lg w-[95vw] p-4 sm:p-6 sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-center">Share Quote</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-2 mb-4">
                    {/* The Graphic Element (1080x1080 ratio, responsive scaling) */}
                    <div
                        className="relative w-full aspect-square max-w-[400px] shadow-2xl overflow-hidden rounded-md transition-all select-none"
                    >
                        {/* Hidden Graphic that html2canvas will target */}
                        <div
                            ref={graphicRef}
                            className="absolute top-0 left-0 w-[1080px] h-[1080px] bg-gradient-to-br from-neutral-900 via-stone-900 to-black p-24 flex flex-col justify-center items-center text-center font-serif text-white opacity-100"
                            style={{
                                transform: 'scale(0.3)', // Scale down for preview
                                transformOrigin: 'top left',
                                // Make the preview container roughly 320x320
                                width: '1080px',
                                height: '1080px',
                            }}
                        >
                            {/* Decorative Grain Overlay */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                            {/* Gold Quote Marks */}
                            <div className="text-[150px] leading-none text-yellow-600/50 absolute top-20 left-20 font-serif">"</div>

                            <div className="z-10 w-full max-w-[800px] flex flex-col items-center gap-12">
                                <p className="text-[52px] leading-relaxed italic text-stone-200" dangerouslySetInnerHTML={{ __html: excerpt?.replace(/\n/g, '<br/>') }} />

                                <div className="mt-8 flex flex-col items-center border-t border-stone-700 pt-10 w-1/2">
                                    <h3 className="text-[36px] font-bold tracking-widest uppercase text-stone-400 mb-2">{title}</h3>
                                    <p className="text-[28px] text-stone-500 italic">— {author}</p>
                                </div>
                            </div>

                            {/* Watermark */}
                            <div className="absolute bottom-16 w-full text-center text-stone-600 text-[24px] uppercase tracking-[0.3em] font-sans">
                                Dead Poets Society
                            </div>
                        </div>

                        {/* Visible Preview Container */}
                        <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-stone-900 to-black overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8 rounded-md border border-gray-700 relative">
                            {/* Decorative Grain Overlay */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                            <div className="text-4xl text-yellow-600/50 absolute top-4 left-4 font-serif">"</div>
                            <p className="z-10 text-lg sm:text-xl font-serif italic text-stone-200 text-center relative overflow-hidden line-clamp-[8]">
                                {excerpt}
                            </p>
                            <div className="z-10 mt-6 pt-4 border-t border-stone-700 flex flex-col items-center text-center">
                                <span className="text-sm font-bold tracking-widest uppercase text-stone-400">{title}</span>
                                <span className="text-xs text-stone-500 italic mt-1">— {author}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={handleDownload}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold"
                        disabled={isGenerating}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {isGenerating ? "Generating..." : "Download Graphic"}
                    </Button>

                    {canWebShare && (
                        <Button
                            onClick={handleNativeShare}
                            variant="secondary"
                            className="flex-1"
                            disabled={isGenerating}
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Direct
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareQuoteModal;

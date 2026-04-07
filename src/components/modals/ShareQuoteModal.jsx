"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

const ShareQuoteModal = ({ isOpen, onClose, selectedText, title, author }) => {
    const graphicRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [canWebShare, setCanWebShare] = useState(false);
    const [pageUrl, setPageUrl] = useState('');

    // Check if the browser supports the Web Share API with files
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPageUrl(window.location.hostname);
        }
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
            // Using html-to-image with defensive filtering and font embedding bypass to stop the trim() crash
            const dataUrl = await toPng(graphicRef.current, {
                pixelRatio: 2,
                cacheBust: true,
                skipFonts: false,
                fontEmbedCSS: '',
                filter: (node) => {
                    const tagName = node.tagName ? node.tagName.toLowerCase() : '';
                    return tagName !== 'script' && tagName !== 'noscript' && tagName !== 'style';
                },
            });
            return dataUrl;
        } catch (error) {
            console.error("Error generating image:", error);
            return null;
        }
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        const dataUrl = await generateImage();
        if (dataUrl) {
            const link = document.createElement('a');
            link.download = `quote-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = dataUrl;
            link.click();
        }
        setIsGenerating(false);
    };

    const dataUrlToBlob = (dataUrl) => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    const handleNativeShare = async () => {
        if (!canWebShare) return;
        setIsGenerating(true);
        const dataUrl = await generateImage();
        if (dataUrl) {
            const blob = dataUrlToBlob(dataUrl);
            const file = new File([blob], 'quote.png', { type: 'image/png' });
            try {
                await navigator.share({
                    title: `Snippet from ${title}`,
                    text: `"${excerpt}" — ${author}\n\nRead the full poem here:`,
                    url: window.location.href,
                    files: [file],
                });
            } catch (error) {
                console.log("Error sharing natively:", error);
            } finally {
                setIsGenerating(false);
            }
        } else {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-lg w-[95vw] p-4 sm:p-6 sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-center">Share Quote</DialogTitle>
                    <DialogDescription className="text-center text-gray-400 text-xs">
                        Generate a beautiful graphic to share this poem on social media.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-2 mb-4">
                    {/* The Graphic Element */}
                    <div
                        ref={graphicRef}
                        className="relative w-full aspect-square max-w-[400px] shadow-2xl rounded-md overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-stone-900 to-black border border-gray-700 select-none"
                    >
                        {/* Gold Quote Marks */}
                        <div className="text-4xl text-yellow-600/50 absolute top-6 left-6 font-serif">"</div>

                        {/* Quote Content */}
                        <p className="z-10 text-lg sm:text-xl font-serif italic text-stone-200 text-center relative overflow-hidden line-clamp-[6] w-full px-4">
                            {excerpt}
                        </p>

                        {/* Author Info */}
                        <div className="z-10 mt-8 pt-4 w-3/4 border-t border-stone-700 flex flex-col items-center text-center">
                            <span className="text-sm font-bold tracking-widest uppercase text-stone-400 mb-1">{title}</span>
                            <span className="text-xs text-stone-500 italic">— {author}</span>
                        </div>

                        {/* Footer: QR Code, Watermark, and Link */}
                        <div className="absolute bottom-4 w-full px-6 flex items-center justify-between">
                            {/* Option 2: QR Code inside the graphic */}
                            <div className="bg-white p-1 rounded-sm shadow-md">
                                <QRCodeSVG
                                    value={typeof window !== 'undefined' ? window.location.href : 'https://dead-poets-society.com'}
                                    size={36}
                                    bgColor={"#ffffff"}
                                    fgColor={"#000000"}
                                    level={"L"}
                                />
                            </div>

                            <div className="flex flex-col items-end text-right">
                                <div className="text-stone-600 text-[10px] sm:text-xs uppercase tracking-[0.3em] font-sans">
                                    Dead Poets Society
                                </div>
                                <div className="text-stone-700 text-[8px] sm:text-[10px] tracking-widest font-sans mt-0.5 opacity-60">
                                    {pageUrl}
                                </div>
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

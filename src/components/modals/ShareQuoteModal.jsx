"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';

const ShareQuoteModal = ({ isOpen, onClose, selectedText, title, author }) => {
    const graphicRef = useRef(null);
    const hiddenGraphicRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [canWebShare, setCanWebShare] = useState(false);
    const [pageUrl, setPageUrl] = useState('');
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    // Check if the browser supports the Web Share API
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPageUrl(window.location.hostname);
        }
        if (typeof navigator !== 'undefined' && navigator.canShare) {
            setCanWebShare(true);
        }

        const updateScale = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                setScale(width / 600);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        const timer = setTimeout(updateScale, 100);
        
        return () => {
            window.removeEventListener('resize', updateScale);
            clearTimeout(timer);
        };
    }, [isOpen]);

    const excerpt = selectedText?.length > 300
        ? selectedText.substring(0, 300) + "..."
        : selectedText;

    const generateImage = async () => {
        if (!hiddenGraphicRef.current) return null;
        try {
            return await toPng(hiddenGraphicRef.current, {
                pixelRatio: 2,
                cacheBust: true,
                skipFonts: false,
                fontEmbedCSS: '',
                filter: (node) => {
                    const tagName = node.tagName ? node.tagName.toLowerCase() : '';
                    return tagName !== 'script' && tagName !== 'noscript' && tagName !== 'style';
                },
            });
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
        while (n--) u8arr[n] = bstr.charCodeAt(n);
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
                        A beautiful graphic to share this poem on social media.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center mb-4">
                    {/* Scale Wrapper: Responsive UI Preview */}
                    <div 
                        ref={containerRef}
                        className="w-full aspect-square max-w-[400px] overflow-hidden relative rounded-md shadow-2xl border border-gray-800"
                    >
                        <div
                            ref={graphicRef}
                            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
                            className="bg-gradient-to-br from-neutral-900 via-stone-900 to-black select-none flex flex-col items-center justify-center absolute left-1/2 top-1/2"
                            style={{
                                width: '600px',
                                height: '600px',
                                transform: `translate(-50%, -50%) scale(${scale})`,
                                transformOrigin: 'center center',
                                userSelect: 'none',
                                touchAction: 'none'
                            }}
                        >
                            <div className="absolute top-10 left-10 text-5xl text-yellow-600/40 font-serif">"</div>
                            <p className="z-10 text-[32px] leading-relaxed font-serif italic text-stone-100 text-center px-16 line-clamp-[6] w-full">
                                {excerpt}
                            </p>
                            <div className="z-10 mt-12 pt-6 w-[400px] border-t border-stone-800/80 flex flex-col items-center text-center">
                                <span className="text-[20px] font-bold tracking-[0.2em] uppercase text-stone-400 mb-2">{title}</span>
                                <span className="text-[16px] text-stone-500 italic font-serif">— {author}</span>
                            </div>
                            <div className="absolute bottom-8 w-full px-10 flex items-center justify-between">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-white p-1.5 rounded-sm shadow-md flex items-center justify-center">
                                        <QRCodeSVG
                                            value={typeof window !== 'undefined' ? window.location.href : 'https://dead-poets-society.com'}
                                            size={500}
                                            style={{ width: 75, height: 75 }}
                                            bgColor={"#ffffff"}
                                            fgColor={"#000000"}
                                            level={"H"}
                                            includeMargin={false}
                                        />
                                    </div>
                                    <span className="text-[10px] text-stone-500 font-sans tracking-widest uppercase opacity-80">Scan Me</span>
                                </div>
                                <div className="flex flex-col items-end text-right">
                                    <div className="text-stone-600 text-[16px] uppercase tracking-[0.4em] font-sans font-medium">Dead Poets Society</div>
                                    <div className="text-stone-700 text-[12px] tracking-widest font-sans mt-1 opacity-50">{pageUrl}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden Shadow Canvas: The 1:1 master copy for clean captures */}
                <div className="fixed left-[-9999px] top-[-9999px] pointer-events-none border-none outline-none ring-0">
                    <div
                        ref={hiddenGraphicRef}
                        className="bg-gradient-to-br from-neutral-900 via-stone-900 to-black flex flex-col items-center justify-center relative overflow-hidden"
                        style={{ width: '600px', height: '600px' }}
                    >
                        <div className="absolute top-10 left-10 text-5xl text-yellow-600/40 font-serif">"</div>
                        <p className="z-10 text-[32px] leading-relaxed font-serif italic text-stone-100 text-center px-16 line-clamp-[6] w-full">
                            {excerpt}
                        </p>
                        <div className="z-10 mt-12 pt-6 w-[400px] border-t border-stone-800/80 flex flex-col items-center text-center">
                            <span className="text-[20px] font-bold tracking-[0.2em] uppercase text-stone-400 mb-2">{title}</span>
                            <span className="text-[16px] text-stone-500 italic font-serif">— {author}</span>
                        </div>
                        <div className="absolute bottom-8 w-full px-10 flex items-center justify-between">
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-white p-1.5 rounded-sm shadow-md flex items-center justify-center">
                                    <QRCodeSVG
                                        value={typeof window !== 'undefined' ? window.location.href : 'https://dead-poets-society.com'}
                                        size={500}
                                        style={{ width: 75, height: 75 }}
                                        bgColor={"#ffffff"}
                                        fgColor={"#000000"}
                                        level={"H"}
                                        includeMargin={false}
                                    />
                                </div>
                                <span className="text-[10px] text-stone-500 font-sans tracking-widest uppercase opacity-80">Scan Me</span>
                            </div>
                            <div className="flex flex-col items-end text-right">
                                <div className="text-stone-600 text-[16px] uppercase tracking-[0.4em] font-sans font-medium">Dead Poets Society</div>
                                <div className="text-stone-700 text-[12px] tracking-widest font-sans mt-1 opacity-50">{pageUrl}</div>
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

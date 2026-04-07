/**
 * Dynamic route component for displaying a single poem (Note)
 * 
 * Purpose:
 * - Renders the full content of a poem
 * - Provides owner-specific actions: Edit and Delete
 * - Enables social interaction: Applause/Like and Share
 * 
 * Key Features:
 * - Server-Side Rendering (SSR) via `initialNote` prop
 * - "Edit" functionality opening a modal (`EditPoemModal`)
 * - "Delete" functionality with a confirmation dialog
 * - Whitespace-preserved rendering for poetic formatting
 * 
 * @param {Object} initialNote - Prop passed containing poem data from SSR.
 */

"use client";
import { useState, useEffect, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/supabase/config.js';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import ApplauseButton from '@/components/common/ApplauseButton';
import BookmarkButton from '@/components/common/BookmarkButton';
import SocialShareButtons from '@/components/layout/SocialShareButtons';
import DOMPurify from 'dompurify';
import ShareQuoteModal from '@/components/modals/ShareQuoteModal';
import EditPoemModal from '@/components/modals/EditPoemModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash, Share2, Quote } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const formatDate = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB');
};

/**
 * Memoized Poem Content component to prevent re-renders of the text 
 * when the parent's selection state changes. This is critical for 
 * maintaining text selection stability.
 */
const PoemContent = memo(({ content }) => {
    return (
        <div
            className="prose prose-sm sm:prose-base max-w-none text-gray-200 prose-headings:text-white prose-strong:text-white whitespace-pre-wrap poem-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
    );
});
PoemContent.displayName = 'PoemContent';


const NotePage = ({ initialNote }) => {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();


    const [note, setNote] = useState(initialNote);
    const [isEditing, setIsEditing] = useState(false);

    // State for Shareable Quotes functionality
    const [activeSelectionText, setActiveSelectionText] = useState(''); // Live text being highlighted
    const [selectedText, setSelectedText] = useState(''); // Text locked in for the modal
    const [selectionPosition, setSelectionPosition] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    /**
     * Ownership Check:
     * Compares logged-in user's ID with the poem's author ID.
     * Unlocks Edit/Delete buttons if they match.
     */
    // Check if the current logged-in user is the author of the poem
    const isOwnPoem = user?.id === note?.user_id;

    useEffect(() => {
        if (initialNote) {
            setNote(initialNote);
        }
    }, [initialNote]);

    // Handle text selection for the Share Quote feature
    useEffect(() => {
        let hideTimeout;

        const handleSelection = () => {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text.length > 5) {
                if (hideTimeout) clearTimeout(hideTimeout);
                // Simple text tracking - no coordinate math needed anymore
                setActiveSelectionText(text);
            } else if (!isShareModalOpen) {
                // Debounce hiding to allow for handle adjustments
                if (hideTimeout) clearTimeout(hideTimeout);
                hideTimeout = setTimeout(() => {
                    setActiveSelectionText('');
                }, 200);
            }
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('touchend', handleSelection);
        document.addEventListener('selectionchange', handleSelection);

        return () => {
            if (hideTimeout) clearTimeout(hideTimeout);
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('touchend', handleSelection);
            document.removeEventListener('selectionchange', handleSelection);
        };
    }, [isShareModalOpen]);

    /**
     * Deletion Handler:
     * Permanently removes the poem from Supabase 'notes' table.
     * Redirects the user to their profile page upon success.
     */
    // Allows the author to delete their own poem
    const handleDeletePoem = async () => {
        if (!isOwnPoem) return;
        const { error } = await supabase.from('notes').delete().eq('id', note.id);
        if (error) {
            alert("Failed to delete poem.");
            console.error("Delete error:", error);
        } else {
            router.push(`/profile/${user.id}`);
        }
    };

    if (!note) return <div className="text-center py-20 text-white">Poem not found.</div>;

    const pageUrl = window.location.href;
    const formattedDate = formatDate(note.created_at);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto py-8 sm:py-12 px-4" // Reverting relative for absolute positioning relative to body
        >
            {/* Modal for editing the poem */}
            {isEditing && (
                <EditPoemModal
                    note={note}
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    onPoemUpdated={(updatedPoem) => setNote(updatedPoem)}
                />
            )}

            {/* Main poem display area with a subtle background - removed missing poemBackground.png */}
            <div className="bg-gray-800/10 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-inner">
                <div className="bg-black/70 backdrop-blur-md p-4 sm:p-8 rounded-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-white">{note.title}</h1>
                            <div className="text-base sm:text-lg text-gray-300 mb-4">
                                by <Link href={`/profile/${note.user_id}`} className="hover:underline font-semibold">{note.poet_name || 'Anonymous'}</Link>
                                {formattedDate && <span>, {formattedDate}</span>}
                            </div>
                        </div>
                        {isOwnPoem && (
                            <div className="flex gap-2 flex-shrink-0 self-start sm:self-center">
                                <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                                    <Edit className="h-5 w-5" />
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="icon" variant="destructive">
                                            <Trash className="h-5 w-5" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-gray-900 border-gray-700">
                                        <DialogHeader>
                                            <DialogTitle>Are you sure?</DialogTitle>
                                            <DialogDescription>This action cannot be undone and will permanently delete your poem.</DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                            <Button variant="destructive" onClick={handleDeletePoem}>Delete</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </div>

                    {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 my-6">
                            {note.tags.map(tag => (
                                <span key={tag} className="bg-yellow-500/20 text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tag}</span>
                            ))}
                        </div>
                    )}

                    <p className="text-base sm:text-lg text-gray-300 italic mb-8">{note.preview}</p>

                    {/* Hint for Shareable Quote - Moved to top */}
                    <div className="mb-8 text-center text-stone-500 text-sm opacity-80 select-none">
                        💡 Highlight/Select any part of this poem to create a shareable quote graphic.
                    </div>

                    {/* Renders the poem content with whitespace preservation - Memoized */}
                    <PoemContent content={note.content} />

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-4 mt-10 border-t border-gray-700 pt-6">

                        <div className="flex items-center gap-6">
                            <ApplauseButton note={note} />
                            <BookmarkButton noteId={note.id} />
                        </div>
                        <SocialShareButtons url={pageUrl} title={`Check out this poem: ${note.title}`} />
                    </div>
                </div>
            </div>

            {/* Share Quote UI - Fixed Bars */}
            <AnimatePresence>
                {activeSelectionText.length > 5 && !isShareModalOpen && !isEditing && (
                    <>
                        {/* Mobile Top Bar */}
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            className="fixed top-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-xl border-b border-white/10 px-4 py-4 sm:hidden rounded-b-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-stone-500 text-[10px] uppercase tracking-wider mb-1">Selected Quote</p>
                                    <p className="text-white text-sm line-clamp-1 italic font-serif">"{activeSelectionText}"</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setSelectedText(activeSelectionText);
                                        setIsShareModalOpen(true);
                                    }}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-black rounded-full px-6 flex-shrink-0 shadow-lg"
                                >
                                    Share
                                </Button>
                            </div>
                        </motion.div>

                        {/* Desktop Bottom Bar - Centered and Compact */}
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="hidden sm:flex fixed bottom-10 left-0 right-0 z-[100] pointer-events-none items-center justify-center p-4"
                        >
                            <div className="bg-black/90 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center gap-6 pointer-events-auto max-w-[90vw]">
                                <div className="border-r border-white/10 pr-6 overflow-hidden">
                                    <p className="text-stone-500 text-[9px] uppercase tracking-[0.2em] mb-0.5 font-bold whitespace-nowrap">Share Selection</p>
                                    <p className="text-white text-sm line-clamp-1 italic font-serif opacity-90 max-w-[300px]">"{activeSelectionText}"</p>
                                </div>
                                <Button
                                    onClick={() => {
                                        setSelectedText(activeSelectionText);
                                        setIsShareModalOpen(true);
                                    }}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-black rounded-full px-6 py-2 h-auto text-sm font-bold shadow-xl active:scale-95 transition-transform flex-shrink-0"
                                >
                                    Share Quote
                                </Button>
                            </div>
                        </motion.div>

                    </>
                )}
            </AnimatePresence>



            {/* Share Quote Modal */}
            <ShareQuoteModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                selectedText={selectedText}
                title={note.title}
                author={note.poet_name}
            />

        </motion.div>
    );
};

export default NotePage;

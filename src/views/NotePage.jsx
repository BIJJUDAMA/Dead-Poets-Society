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
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/supabase/config.js';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import ApplauseButton from '@/components/common/ApplauseButton';
import SocialShareButtons from '@/components/layout/SocialShareButtons';
import EditPoemModal from '@/components/modals/EditPoemModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash } from 'lucide-react';

const formatDate = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB');
};


const NotePage = ({ initialNote }) => {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();


    const [note, setNote] = useState(initialNote);
    const [isEditing, setIsEditing] = useState(false);

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
            className="max-w-4xl mx-auto py-8 sm:py-12 px-4"
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

            {/* Main poem display area with background */}
            <div className="bg-cover bg-center rounded-lg" style={{ backgroundImage: "url('/poemBackground.png')" }}>
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


                    {/* Renders the poem content with whitespace preservation */}
                    <div
                        className="prose prose-sm sm:prose-base max-w-none text-gray-200 prose-headings:text-white prose-strong:text-white whitespace-pre-wrap"
                    >{note.content}</div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-4 mt-10 border-t border-gray-700 pt-6">
                        <ApplauseButton note={note} />
                        <SocialShareButtons url={pageUrl} title={`Check out this poem: ${note.title}`} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default NotePage;

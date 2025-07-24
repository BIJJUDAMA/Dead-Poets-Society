import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/config.js';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import ApplauseButton from '@/components/ApplauseButton';
import SocialShareButtons from '@/components/SocialShareButtons';
import EditPoemModal from '@/components/EditPoemModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash } from 'lucide-react';

const formatDate = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB');
};

const NotePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const isOwnPoem = user?.id === note?.user_id;

    useEffect(() => {
        const getNote = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('notes')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setNote(data);
            } catch (error) {
                console.error("Error fetching note:", error);
                setNote(null);
            } finally {
                setLoading(false);
            }
        };
        getNote();
    }, [id]);

    const handleDeletePoem = async () => {
        if (!isOwnPoem) return;
        const { error } = await supabase.from('notes').delete().eq('id', note.id);
        if (error) {
            alert("Failed to delete poem.");
            console.error("Delete error:", error);
        } else {
            navigate(`/profile/${user.id}`);
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Loading verse...</div>;
    if (!note) return <div className="text-center py-20 text-white">Poem not found.</div>;

    const pageUrl = window.location.href;
    const formattedDate = formatDate(note.created_at);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto py-12 px-4"
        >
            {isEditing && (
                <EditPoemModal
                    note={note}
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    onPoemUpdated={(updatedPoem) => setNote(updatedPoem)}
                />
            )}

            <div className="bg-cover bg-center p-8 sm:p-12 rounded-lg" style={{ backgroundImage: "url('/poemBackground.png')" }}>
                <div className="bg-black/60 backdrop-blur-sm p-8 rounded-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">{note.title}</h1>
                            <div className="text-lg text-gray-300 mb-4">
                                {/* **FIX:** Use snake_case for poet_name */}
                                by <Link to={`/profile/${note.user_id}`} className="hover:underline font-semibold">{note.poet_name || 'Anonymous'}</Link>
                                {formattedDate && <span>, {formattedDate}</span>}
                            </div>
                        </div>
                        {isOwnPoem && (
                            <div className="flex gap-2 flex-shrink-0">
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

                    <p className="text-lg text-gray-300 italic mb-8">{note.preview}</p>
                    <div
                        className="prose prose-lg max-w-none text-gray-200 prose-headings:text-white prose-strong:text-white whitespace-pre-wrap"
                    >{note.content}</div>

                    <div className="flex justify-between items-center mt-10 border-t border-gray-700 pt-6">
                        <ApplauseButton note={note} />
                        <SocialShareButtons url={pageUrl} title={`Check out this poem: ${note.title}`} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default NotePage;

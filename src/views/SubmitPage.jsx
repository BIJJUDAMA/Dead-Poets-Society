/**
 * A form for users to submit new poems to the platform
 * 
 * Features:
 * - Real-time character count validation for Title and Description
 * - Multi-select dropdown for Tags (src/lib/constants/constants.js)
 * - Submission handling to Supabase 'poem_submissions' table (pending approval from admin/semi-admins)
 */

"use client";
import { useState } from 'react';
import { supabase } from '@/supabase/config.js';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Send, CheckCircle, SlidersHorizontal, Search, Check, X } from 'lucide-react';
import { POEM_TAGS } from '@/lib/constants.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/common/RichTextEditor';

const PoemSubmissionForm = () => {
    const { user, userProfile } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
    const [tagSearch, setTagSearch] = useState('');

    const isTitleValid = title.length <= 50;
    const isDescriptionValid = description.length <= 150;

    const filteredTagsList = POEM_TAGS.filter(tag => 
        tag.toLowerCase().includes(tagSearch.toLowerCase())
    );

    /**
     * Handles the form submission process.
     * Prevents default browser behavior, validates inputs again,
     * and sends data to Supabase.
     */
    // Handles form submission to Supabase
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isTitleValid || !isDescriptionValid || !content) return;
        setIsLoading(true);
        setMessage('');
        try {
            // Insert new poem with 'pending' status
            const { error } = await supabase.from('poem_submissions').insert([{
                title,
                content,
                description,
                tags: selectedTags,
                user_id: user.id,
                poet_name: userProfile.display_name,
                status: 'pending',
            }]);
            if (error) throw error;

            setMessage('Your poem has been submitted for review!');
            setTitle(''); setContent(''); setDescription(''); setSelectedTags([]);
        } catch (err) {
            console.error(err);
            setMessage('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className="bg-emerald-950/40 border border-emerald-600/50 text-emerald-200 p-4 rounded-xl flex items-center gap-3 shadow-inner">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm font-serif italic">{message}</p>
                </div>
            )}
            <div>
                <Label className="flex justify-between text-xs font-cinzel tracking-wider text-amber-200/90 font-semibold mb-1.5">
                    <span>Poem Title</span>
                    <span className={isTitleValid ? 'text-stone-500 font-mono' : 'text-red-400 font-mono'}>{title.length}/50</span>
                </Label>
                <Input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Enter the title of your work..."
                    className="bg-stone-900/90 hover:bg-stone-900 border-stone-800 focus:border-amber-600/70 focus:ring-amber-500/20 h-11 rounded-xl text-stone-100 placeholder:text-stone-600 shadow-inner" 
                    required 
                />
            </div>
            <div>
                <Label className="flex justify-between text-xs font-cinzel tracking-wider text-amber-200/90 font-semibold mb-1.5">
                    <span>Description / Preview</span>
                    <span className={isDescriptionValid ? 'text-stone-500 font-mono' : 'text-red-400 font-mono'}>{description.length}/150</span>
                </Label>
                <Textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="A brief excerpt or prelude to your verses..."
                    className="bg-stone-900/90 hover:bg-stone-900 border-stone-800 focus:border-amber-600/70 focus:ring-amber-500/20 rounded-xl text-stone-100 placeholder:text-stone-600 shadow-inner resize-none font-serif italic" 
                    required 
                    rows="3" 
                />
            </div>
            <div>
                <Label className="block text-xs font-cinzel tracking-wider text-amber-200/90 font-semibold mb-1.5">
                    Full Poem Content
                </Label>
                <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Start composing your poem..."
                />
            </div>
            <div>
                <Label className="block text-xs font-cinzel tracking-wider text-amber-200/90 font-semibold mb-2">
                    Theme
                </Label>
                
                {/* Theme Trigger Button */}
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => setIsThemePickerOpen(true)}
                        className={`inline-flex items-center gap-2.5 px-4 h-11 rounded-xl text-sm font-medium border transition-all w-fit ${
                            selectedTags.length > 0
                                ? 'bg-amber-950/70 border-amber-600/70 text-amber-200 shadow-[0_0_15px_rgba(217,119,6,0.2)]'
                                : 'bg-stone-900/90 hover:bg-stone-800 border-stone-800 text-stone-300 hover:text-white'
                        }`}
                    >
                        <SlidersHorizontal className="w-4 h-4 text-amber-400/90" />
                        <span>Select Themes</span>
                        {selectedTags.length > 0 && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-stone-950 font-bold">
                                {selectedTags.length}
                            </span>
                        )}
                    </button>

                    {/* Active Theme Badges Tray */}
                    {selectedTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {selectedTags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif italic bg-amber-950/60 border border-amber-600/50 text-amber-200 shadow-sm"
                                >
                                    <span>{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                                        className="text-amber-400/70 hover:text-amber-200 p-0.5 rounded-full hover:bg-amber-900/50 transition-colors"
                                        aria-label={`Remove ${tag} theme`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <button
                                type="button"
                                onClick={() => setSelectedTags([])}
                                className="text-xs text-stone-400 hover:text-amber-300 underline underline-offset-4 ml-1 transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Theme Selector Modal */}
                {isThemePickerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div 
                            className="relative w-full max-w-lg bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-stone-800/80 mb-4">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                                    <h3 className="text-lg font-cinzel font-bold text-amber-100">Select Themes</h3>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setIsThemePickerOpen(false)}
                                    className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tag Search Input */}
                            <div className="relative mb-4">
                                <Input
                                    type="text"
                                    placeholder="Find a theme (e.g. Love, Hope, Nature)..."
                                    value={tagSearch}
                                    onChange={(e) => setTagSearch(e.target.value)}
                                    className="pl-9 h-10 bg-stone-900 border-stone-800 text-stone-200 text-sm placeholder:text-stone-500 rounded-xl"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
                            </div>

                            {/* Tags Grid / Chips */}
                            <div className="max-h-64 overflow-y-auto pr-1 flex flex-wrap gap-2 py-1 select-none">
                                {filteredTagsList.map((tag) => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                setSelectedTags(prev => 
                                                    isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                                                );
                                            }}
                                            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-serif italic transition-all border flex items-center gap-2 ${
                                                isSelected
                                                    ? 'bg-amber-950/90 text-amber-200 border-amber-600 shadow-[0_0_12px_rgba(217,119,6,0.25)] font-semibold'
                                                    : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border-stone-800'
                                            }`}
                                        >
                                            <span>{tag}</span>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between pt-5 mt-4 border-t border-stone-800/80">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTags([])}
                                    disabled={selectedTags.length === 0}
                                    className="text-xs text-stone-400 hover:text-amber-300 disabled:opacity-40 disabled:hover:text-stone-400 transition-colors"
                                >
                                    Reset Selection
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsThemePickerOpen(false)}
                                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
                                >
                                    Confirm Themes {selectedTags.length > 0 && `(${selectedTags.length})`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="pt-2">
                <Button 
                    type="submit" 
                    disabled={isLoading || !isTitleValid || !isDescriptionValid}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-cinzel font-bold tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-40"
                >
                    <Send className="mr-2 h-4 w-4" /> {isLoading ? 'Submitting...' : 'Submit Poem'}
                </Button>
            </div>
        </form>
    );
};

const SubmitPage = () => {
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-black text-white"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-10"
            >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400 mb-2 tracking-wide">
                    Share Your Verse
                </h1>
                
                {/* Decorative rule */}
                <div className="flex items-center justify-center gap-3 mt-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-700/60" />
                    <span className="text-amber-500/60 text-xs">✦</span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-700/60" />
                </div>
            </motion.div>

            <div className="bg-stone-950/70 border border-stone-800/90 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
                <PoemSubmissionForm />
            </div>
        </motion.div>
    );
};

export default SubmitPage;

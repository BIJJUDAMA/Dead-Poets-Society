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
import { Send, CheckCircle } from 'lucide-react';
import { POEM_TAGS } from '@/lib/constants.js';
import MultiSelectDropdown from '@/components/common/MultiSelectDropdown';
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

    const isTitleValid = title.length <= 50;
    const isDescriptionValid = description.length <= 150;

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
                <Label className="block text-xs font-cinzel tracking-wider text-amber-200/90 font-semibold mb-1.5">
                    Themes & Tags
                </Label>
                <MultiSelectDropdown
                    options={POEM_TAGS}
                    selectedOptions={selectedTags}
                    onSelectionChange={setSelectedTags}
                    title="Select Poetic Themes"
                />
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

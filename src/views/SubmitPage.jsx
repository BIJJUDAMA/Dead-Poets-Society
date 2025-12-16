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
        <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
                <div className="bg-green-900/50 border border-green-700 text-green-300 p-4 rounded-md flex items-center gap-3">
                    <CheckCircle />
                    <p>{message}</p>
                </div>
            )}
            <div>
                <Label className="flex justify-between"><span>Poem Title</span><span className={isTitleValid ? 'text-gray-400' : 'text-red-500'}>{title.length}/50</span></Label>
                <Input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
                <Label className="flex justify-between"><span>Description / Preview</span><span className={isDescriptionValid ? 'text-gray-400' : 'text-red-500'}>{description.length}/150</span></Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} required rows="3" />
            </div>
            <div>
                <Label>Full Poem Content</Label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} required rows="10" />
            </div>
            <div>
                <Label>Tags</Label>

                <MultiSelectDropdown
                    options={POEM_TAGS}
                    selectedOptions={selectedTags}
                    onSelectionChange={setSelectedTags}
                    title="Select Tags"
                />
            </div>
            <Button type="submit" disabled={isLoading || !isTitleValid || !isDescriptionValid}>
                <Send className="mr-2 h-4 w-4" /> {isLoading ? 'Submitting...' : 'Submit Poem'}
            </Button>
        </form>
    );
};

const SubmitPage = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold text-center mb-8 text-white">Share Your Verse</h1>
            <div className="bg-gray-900 p-8 rounded-lg">
                <PoemSubmissionForm />
            </div>
        </motion.div>
    );
};

export default SubmitPage;

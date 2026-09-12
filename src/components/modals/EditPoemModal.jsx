/*
 * A dialog form for editing an existing poem
 * 
 * Purpose:
 * - Allows authors to modify Title, Content, Preview, and Themes
 * - Styled in Dark Academia theme with pinned actions and responsive scrolling
 * - Handles the update operation via Supabase
 * 
 * Used In:
 * - `src/views/NotePage.jsx`
 */

"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/config.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RichTextEditor from '@/components/common/RichTextEditor';
import { SlidersHorizontal, Search, Check, X, Loader2 } from 'lucide-react';
import { POEM_TAGS } from '@/lib/constants.js';

const EditPoemModal = ({ note, isOpen, onClose, onPoemUpdated }) => {
    const [formData, setFormData] = useState({
        ...note,
        tags: note?.tags || []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
    const [tagSearch, setTagSearch] = useState('');

    useEffect(() => {
        if (note) {
            setFormData({
                ...note,
                tags: note.tags || []
            });
        }
    }, [note]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const filteredTagsList = POEM_TAGS.filter(tag => 
        tag.toLowerCase().includes(tagSearch.toLowerCase())
    );

    // Updates the poem data to Supabase
    const handleSaveChanges = async () => {
        setIsLoading(true);
        const { id, ...dataToUpdate } = formData;

        const updatePayload = {
            title: dataToUpdate.title,
            preview: dataToUpdate.preview,
            content: dataToUpdate.content,
            tags: dataToUpdate.tags || [],
        };

        const { data, error } = await supabase
            .from('notes')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating poem:", error);
            alert("Failed to update poem.");
        } else {
            onPoemUpdated(data);
            onClose();
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[96vw] sm:w-[90vw] max-w-3xl rounded-2xl bg-stone-950 border border-stone-800 text-stone-100 p-4 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
                <DialogHeader className="pb-3 border-b border-stone-800/80 flex-shrink-0">
                    <DialogTitle className="font-cinzel text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400">
                        Edit Your Poem
                    </DialogTitle>
                </DialogHeader>

                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto px-1 pr-2 py-2 space-y-4">
                    {/* Title */}
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="title" className="text-xs font-cinzel text-amber-200/90 font-semibold tracking-wider">Title</Label>
                        <Input 
                            id="title" 
                            name="title" 
                            value={formData.title || ''} 
                            onChange={handleChange} 
                            className="bg-stone-900/90 border-stone-800 text-stone-100 rounded-xl h-11 focus:border-amber-600/70" 
                        />
                    </div>

                    {/* Themes Selection */}
                    <div className="grid w-full gap-1.5">
                        <Label className="text-xs font-cinzel text-amber-200/90 font-semibold tracking-wider">Themes</Label>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsThemePickerOpen(true)}
                                className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/50 text-stone-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                                <span>Select Themes</span>
                                {formData.tags?.length > 0 && (
                                    <span className="bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                                        {formData.tags.length}
                                    </span>
                                )}
                            </button>
                            {formData.tags?.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-serif italic bg-amber-950/60 border border-amber-600/40 text-amber-300">
                                    <span>#{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                                        className="hover:text-white p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Preview / Excerpt */}
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="preview" className="text-xs font-cinzel text-amber-200/90 font-semibold tracking-wider">Preview / Excerpt</Label>
                        <Textarea 
                            id="preview" 
                            name="preview" 
                            value={formData.preview || ''} 
                            onChange={handleChange} 
                            className="bg-stone-900/90 border-stone-800 text-stone-100 rounded-xl font-serif italic resize-none focus:border-amber-600/70" 
                            rows="2"
                        />
                    </div>

                    {/* Full Poem Content */}
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="content" className="text-xs font-cinzel text-amber-200/90 font-semibold tracking-wider">Full Content</Label>
                        <RichTextEditor
                            content={formData.content || ''}
                            onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                            minHeight="min-h-[160px]"
                            maxHeight="max-h-[260px]"
                        />
                    </div>
                </div>

                {/* Pinned Action Footer */}
                <div className="pt-3 pb-1 border-t border-stone-900 mt-2 flex items-center justify-end gap-2.5 flex-shrink-0">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-stone-400 hover:text-white rounded-xl h-10 px-4">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSaveChanges} 
                        disabled={isLoading}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold rounded-xl px-6 h-10 shadow-md active:scale-95 flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                </div>

                {/* Theme Selector Modal inside EditPoemModal */}
                {isThemePickerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div 
                            className="relative w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden p-5 animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-3">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                                    <h3 className="text-base font-cinzel font-bold text-amber-100">Select Themes</h3>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setIsThemePickerOpen(false)}
                                    className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="relative mb-3">
                                <Input
                                    type="text"
                                    placeholder="Search theme..."
                                    value={tagSearch}
                                    onChange={(e) => setTagSearch(e.target.value)}
                                    className="pl-9 h-9 bg-stone-900 border-stone-800 text-stone-200 text-xs placeholder:text-stone-500 rounded-xl"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500 pointer-events-none" />
                            </div>

                            <div className="max-h-56 overflow-y-auto pr-1 flex flex-wrap gap-1.5 py-1 select-none">
                                {filteredTagsList.map((tag) => {
                                    const isSelected = formData.tags?.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    tags: isSelected 
                                                        ? prev.tags.filter(t => t !== tag)
                                                        : [...(prev.tags || []), tag]
                                                }));
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-serif italic transition-all border flex items-center gap-1.5 ${
                                                isSelected
                                                    ? 'bg-amber-950/90 text-amber-200 border-amber-600 font-semibold'
                                                    : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border-stone-800'
                                            }`}
                                        >
                                            <span>{tag}</span>
                                            {isSelected && <Check className="w-3 h-3 text-amber-300" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-800/80">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, tags: [] }))}
                                    disabled={!formData.tags || formData.tags.length === 0}
                                    className="text-xs text-stone-400 hover:text-amber-300 disabled:opacity-40 transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsThemePickerOpen(false)}
                                    className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                                >
                                    Done ({formData.tags?.length || 0})
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EditPoemModal;

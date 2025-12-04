"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/config.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const EditPoemModal = ({ note, isOpen, onClose, onPoemUpdated }) => {
    const [formData, setFormData] = useState(note);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setFormData(note);
    }, [note]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = async () => {
        setIsLoading(true);
        const { id, ...dataToUpdate } = formData;

        const updatePayload = {
            title: dataToUpdate.title,
            preview: dataToUpdate.preview,
            content: dataToUpdate.content,
            tags: dataToUpdate.tags,
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
            <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                    <DialogTitle>Edit Your Poem</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right text-gray-400">Title</Label>
                        <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3 bg-gray-700" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="preview" className="text-right pt-2 text-gray-400">Preview</Label>
                        <Textarea id="preview" name="preview" value={formData.preview} onChange={handleChange} className="col-span-3 bg-gray-700" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="content" className="text-right pt-2 text-gray-400">Content</Label>
                        <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={8} className="col-span-3 bg-gray-700" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditPoemModal;

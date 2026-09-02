/**
 * AdminPage View
 * 
 * A comprehensive dashboard for administrators to manage the application
 * 
 * Purpose:
 * - Manage Poems: Edit details, delete poems
 * - Review Submissions: Approve or Reject pending poems
 * - Manage Users: View users, toggle 'semi-admin'(admin's who can't promote other users to admin) roles, delete users
 * 
 * Authorization:
 * - Protected Route checking for `isMainAdmin` or `isAdmin` from src/context/AuthContext
 * - Specific actions (like promoting users) are restricted to the Main Admin (The email id mentioned in enviroment variables)
 * 
 * Architecture:
 * - Uses Shadcn UI `Tabs` to separate concerns (Poems, Submissions, Users)
 * - Implements complex state management for pagination, search, and optimistic updates across multiple tabs
 */
"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase/config.js';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Inbox, Users, Trash, Shield, ShieldOff, Edit, X, Eye, Check, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import '@/css/Admin.css';
import DOMPurify from 'dompurify';
import RichTextEditor from '@/components/common/RichTextEditor';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const PAGE_SIZE = 20;

const ConfirmationDialog = ({ open, onOpenChange, onConfirm, title, description }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] rounded-2xl sm:max-w-md bg-stone-950 border border-stone-800 text-stone-100 p-6 shadow-2xl">
            <DialogHeader>
                <DialogTitle className="font-cinzel text-lg font-bold text-amber-100">{title}</DialogTitle>
                <DialogDescription className="text-stone-400 font-serif italic text-sm mt-1">{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
                <DialogClose asChild>
                    <Button variant="ghost" className="text-stone-400 hover:text-white rounded-xl">Cancel</Button>
                </DialogClose>
                <Button 
                    variant="destructive" 
                    onClick={onConfirm}
                    className="bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-xl"
                >
                    Confirm Delete
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

const EditPoemForm = ({ note, onSave, onCancel, isSaving }) => {
    const [formData, setFormData] = useState(note);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    return (
        <div className="flex flex-col space-y-4 py-2">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="title" className="text-xs font-cinzel text-amber-200/90 font-semibold tracking-wider">Title</Label>
                <Input 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    className="bg-stone-900/90 border-stone-800 text-stone-100 rounded-xl h-11 focus:border-amber-600/70" 
                />
            </div>

            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="poet_name" className="text-xs font-cinzel text-amber-200/90 font-semibold tracking-wider">Poet Name</Label>
                <Input 
                    id="poet_name" 
                    name="poet_name" 
                    value={formData.poet_name} 
                    onChange={handleChange} 
                    className="bg-stone-900/90 border-stone-800 text-stone-100 rounded-xl h-11 focus:border-amber-600/70" 
                />
            </div>

            <div className="grid w-full gap-1.5">
                <Label htmlFor="preview" className="text-xs font-cinzel text-amber-200/90 font-semibold tracking-wider">Preview / Excerpt</Label>
                <Textarea 
                    id="preview" 
                    name="preview" 
                    value={formData.preview} 
                    onChange={handleChange} 
                    className="bg-stone-900/90 border-stone-800 text-stone-100 rounded-xl font-serif italic resize-none focus:border-amber-600/70" 
                    rows="2"
                />
            </div>

            <div className="grid w-full gap-1.5">
                <Label htmlFor="content" className="text-xs font-cinzel text-amber-200/90 font-semibold tracking-wider">Full Content</Label>
                <RichTextEditor
                    content={formData.content}
                    onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                />
            </div>

            <DialogFooter className="!mt-6 gap-2">
                <Button variant="ghost" onClick={onCancel} disabled={isSaving} className="text-stone-400 hover:text-white rounded-xl">Cancel</Button>
                <Button 
                    onClick={() => onSave(formData)} 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold rounded-xl px-6"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
        </div>
    );
};



const AdminPage = () => {
    const { isMainAdmin, loading: authLoading } = useAuth();
    const { ref, inView } = useInView({ threshold: 0.5 });

    const [poems, setPoems] = useState([]);
    const [users, setUsers] = useState([]);
    const [poemSubmissions, setPoemSubmissions] = useState([]);

    const [page, setPage] = useState({ poems: 0, users: 0, submissions: 0 });
    const [hasMore, setHasMore] = useState({ poems: true, users: true, submissions: true });

    const [loading, setLoading] = useState({ initial: true, more: false });

    const [activeTab, setActiveTab] = useState('poems');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [selectedPoems, setSelectedPoems] = useState([]);
    const [deleteAction, setDeleteAction] = useState(null);
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [updateSuccessUserId, setUpdateSuccessUserId] = useState(null);
    const [counts, setCounts] = useState({ poems: 0, users: 0, submissions: 0 });
    const [savingPoemId, setSavingPoemId] = useState(null);
    const [submissionActionId, setSubmissionActionId] = useState(null);

    /**
     * Retreives data based on the active tab (poems, users, or submissions).
     * Doesn't fetch data for all tab's at once
     * @param {string} tab - The current active tab.
     * @param {number} currentPage - Pagination page index.
     * @param {string} search - Search term filter.
     */
    // Fetches items for the active tab (poems, users, or submissions) with pagination and search
    const fetchPaginatedData = useCallback(async (tab, currentPage, search = '') => {
        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query;
        let countQuery;
        const baseOptions = { count: 'exact' };

        switch (tab) {
            case 'poems':
                query = supabase.from('notes').select('*', baseOptions);
                if (search) query = query.or(`title.ilike.%${search}%,poet_name.ilike.%${search}%`);
                query = query.order('created_at', { ascending: false }).range(from, to);
                break;
            case 'users':
                query = supabase.from('profiles').select('*', baseOptions);
                if (search) query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);

                query = query.range(from, to);
                break;
            case 'submissions':
                query = supabase.from('poem_submissions').select('*', baseOptions).eq('status', 'pending');
                countQuery = supabase.from('poem_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending');
                query = query.order('submitted_at', { ascending: false }).range(from, to);
                break;
            default: return { data: [], hasMore: false, count: 0 };
        }

        const { data, error, count } = await query;
        if (error) { console.error(`Failed to fetch ${tab}:`, error); return { data: [], hasMore: false, count: 0 }; }

        let finalCount = count;
        if (tab === 'submissions' && countQuery) {
            const { count: subCount, error: countError } = await countQuery;
            if (!countError) finalCount = subCount;
        }

        return {
            data: data || [],
            hasMore: (data || []).length === PAGE_SIZE,
            count: finalCount || 0
        };
    }, []);

    // Initial load of total counts for the tabs
    const loadInitialCounts = useCallback(async () => {
        const poemsCount = await supabase.from('notes').select('*', { count: 'exact', head: true });
        const usersCount = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const submissionsCount = await supabase.from('poem_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        setCounts({
            poems: poemsCount.count || 0,
            users: usersCount.count || 0,
            submissions: submissionsCount.count || 0
        });
    }, []);

    useEffect(() => {
        if (!authLoading) loadInitialCounts();
    }, [authLoading, loadInitialCounts]);


    useEffect(() => {
        // Handles active search with debounce
        const handleSearch = async () => {
            if (authLoading) return;
            setLoading(prev => ({ ...prev, initial: true }));
            const { data, hasMore: newHasMore, count } = await fetchPaginatedData(activeTab, 0, searchTerm);

            switch (activeTab) {
                case 'poems': setPoems(data); break;
                case 'users': setUsers(data); break;
                case 'submissions': setPoemSubmissions(data); break;
            }
            setHasMore(prev => ({ ...prev, [activeTab]: newHasMore }));
            setCounts(prev => ({ ...prev, [activeTab]: count }));
            setPage(prev => ({ ...prev, [activeTab]: 1 }));
            setLoading(prev => ({ ...prev, initial: false }));
        };

        const timer = setTimeout(() => { handleSearch(); }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, activeTab, authLoading, fetchPaginatedData]);


    // Loads more data when the user scrolls to the bottom
    const loadMoreData = useCallback(async () => {
        if (loading.more || !hasMore[activeTab]) return;
        setLoading(prev => ({ ...prev, more: true }));

        const currentPage = page[activeTab];
        const { data, hasMore: newHasMore } = await fetchPaginatedData(activeTab, currentPage, searchTerm);

        if (data.length > 0) {
            switch (activeTab) {
                case 'poems': setPoems(prev => [...prev, ...data]); break;
                case 'users': setUsers(prev => [...prev, ...data]); break;
                case 'submissions': setPoemSubmissions(prev => [...prev, ...data]); break;
            }
            setPage(prev => ({ ...prev, [activeTab]: currentPage + 1 }));
        }
        setHasMore(prev => ({ ...prev, [activeTab]: newHasMore }));
        setLoading(prev => ({ ...prev, more: false }));
    }, [activeTab, fetchPaginatedData, hasMore, loading.more, page, searchTerm]);


    useEffect(() => {
        if (inView) {
            loadMoreData();
        }
    }, [inView, loadMoreData]);


    useEffect(() => {
        if (updateSuccessUserId) {
            const timer = setTimeout(() => setUpdateSuccessUserId(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [updateSuccessUserId]);

    const refreshDataForTab = async (tab) => {
        setLoading(prev => ({ ...prev, initial: true }));
        const { data, hasMore: newHasMore, count } = await fetchPaginatedData(tab, 0, tab === activeTab ? searchTerm : '');
        switch (tab) {
            case 'poems': setPoems(data); break;
            case 'users': setUsers(data); break;
            case 'submissions': setPoemSubmissions(data); break;
        }
        setHasMore(prev => ({ ...prev, [tab]: newHasMore }));
        setCounts(prev => ({ ...prev, [tab]: count }));
        setPage(prev => ({ ...prev, [tab]: 1 }));
        setLoading(prev => ({ ...prev, initial: false }));
    };

    // Executes deletion after confirmation
    const confirmDelete = async () => {
        if (!deleteAction) return;
        const { type, ids, userId } = deleteAction;

        if (type === 'user') {
            const { error } = await supabase.functions.invoke('delete-user', {
                body: { userId }
            });

            if (error) {
                console.error('Error deleting user account:', error);
                alert(`Failed to delete user account: ${error.message}`);
                return;
            }

            await refreshDataForTab('users');
            setDeleteAction(null);
            return;
        }

        const { error } = await supabase.from(type).delete().in('id', ids);
        if (error) {
            console.error(`Error deleting from ${type}:`, error);
            return;
        }

        const tabToRefresh = type === 'notes' ? 'poems' : '';
        if (tabToRefresh) refreshDataForTab(tabToRefresh);
        if (type === 'notes') setSelectedPoems([]);
        setDeleteAction(null);
    };

    const handleUpdate = async (tableName, item) => {
        setSavingPoemId(item.id);
        const { id, ...dataToUpdate } = item;
        const { error } = await supabase.from(tableName).update(dataToUpdate).eq('id', id);

        if (error) {
            console.error(`Error updating ${tableName}:`, error);
            alert(`Failed to update poem: ${error.message}`);
            setSavingPoemId(null);
            return;
        }

        setEditingItem(null);
        await refreshDataForTab('poems');
        setSavingPoemId(null);
    };

    /**
     * Submission Approval Logic:
     * 1. Inserts the submission into the main 'notes' table.
     * 2. If successful, deletes the entry from 'poem_submissions'.
     * Legacy poems still exist in poem_submissions table before delete feature was implemented (Keep or delete them from Supabase, won't effect storage space much)
     */
    // Approves a poem submission: moves it to 'notes' and deletes from 'poem_submissions'
    const handleApprove = async (submission) => {
        if (submissionActionId) return;
        setSubmissionActionId(submission.id);

        const { data: insertedNote, error: insertError } = await supabase.from('notes').insert([{
            title: submission.title, content: submission.content,
            preview: submission.description || '', tags: submission.tags || [],
            user_id: submission.user_id, poet_name: submission.poet_name,
        }]).select('id').single();

        if (insertError) {
            console.error("Error approving submission:", insertError);
            alert(`Failed to approve submission: ${insertError.message}`);
            setSubmissionActionId(null);
            return;
        }

        const { error: deleteError } = await supabase.from('poem_submissions').delete().eq('id', submission.id);
        if (deleteError) {
            console.error("Error removing approved submission:", deleteError);

            if (insertedNote?.id) {
                const { error: rollbackError } = await supabase.from('notes').delete().eq('id', insertedNote.id);
                if (rollbackError) {
                    console.error("Error rolling back approved note:", rollbackError);
                }
            }

            alert(`Failed to finalize approval: ${deleteError.message}`);
            setSubmissionActionId(null);
            return;
        }

        await Promise.all([
            refreshDataForTab('submissions'),
            refreshDataForTab('poems')
        ]);
        setSubmissionActionId(null);
    };

    const handleReject = async (id) => {
        if (submissionActionId) return;
        setSubmissionActionId(id);

        const { error } = await supabase.from('poem_submissions').delete().eq('id', id);
        if (error) {
            console.error("Error rejecting submission:", error);
            alert(`Failed to reject submission: ${error.message}`);
            setSubmissionActionId(null);
            return;
        }

        await refreshDataForTab('submissions');
        setSubmissionActionId(null);
    };

    // Toggles the semi-admin role for a user (Semi-admin's can only be made by the user whose email is given in the env file)
    const handleToggleSemiAdmin = async (userId, currentStatus) => {
        setUpdatingUserId(userId);
        const newRole = currentStatus === 'semi-admin' ? 'user' : 'semi-admin';
        const { error } = await supabase.from("profiles").update({ role: newRole }).eq('id', userId);
        if (error) {
            console.error("Error toggling admin status:", error);
            alert("Failed to update user role due to database security policies.");
            refreshDataForTab('users');
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setUpdateSuccessUserId(userId);
        }
        setUpdatingUserId(null);
    };

    const handleSelectPoem = (id) => setSelectedPoems(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
    const handleSelectAllPoems = () => setSelectedPoems(selectedPoems.length === poems.length ? [] : poems.map(p => p.id));

    if (authLoading) return <div className="text-center py-20">Verifying Admin Status...</div>;

    const renderLoader = () => (
        <div className="flex justify-center items-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-8 sm:py-12 px-3 sm:px-6 lg:px-8 text-white min-h-screen bg-black">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400 mb-2 tracking-wide">
                    Admin Dashboard
                </h1>
                
                {/* Decorative rule */}
                <div className="flex items-center justify-center gap-3 mt-3 sm:mt-4">
                    <div className="h-[1px] w-10 sm:w-12 bg-gradient-to-r from-transparent to-amber-700/60" />
                    <span className="text-amber-500/60 text-xs">✦</span>
                    <div className="h-[1px] w-10 sm:w-12 bg-gradient-to-l from-transparent to-amber-700/60" />
                </div>
            </div>

            {/* Edit Poem Dialog */}
            <Dialog open={!!editingItem} onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}>
                <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg rounded-2xl bg-stone-950 border border-stone-800 text-stone-100 p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-cinzel text-lg sm:text-xl font-bold text-amber-100">Edit Poem</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <EditPoemForm 
                            note={editingItem} 
                            onCancel={() => setEditingItem(null)} 
                            onSave={(updated) => handleUpdate('notes', updated)} 
                            isSaving={savingPoemId === editingItem.id} 
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* View Submission Dialog */}
            <Dialog open={!!viewingItem} onOpenChange={(isOpen) => !isOpen && setViewingItem(null)}>
                <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg rounded-2xl bg-stone-950 border border-stone-800 text-stone-100 p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-cinzel text-xl sm:text-2xl font-bold text-amber-100">{viewingItem?.title}</DialogTitle>
                        <p className="text-stone-400 font-serif italic text-xs sm:text-sm">by {viewingItem?.poet_name}</p>
                    </DialogHeader>
                    <div className="max-h-[55vh] overflow-y-auto mt-4 pr-2 border-t border-stone-900 pt-4">
                        <div
                            className="prose prose-sm sm:prose-base max-w-none text-stone-200 prose-headings:text-amber-100 prose-strong:text-amber-200 font-serif leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(viewingItem?.content) }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog 
                open={!!deleteAction} 
                onOpenChange={() => setDeleteAction(null)} 
                onConfirm={confirmDelete} 
                title="Are you absolutely sure?" 
                description="This action cannot be undone and will permanently delete the selected item(s) from the archive." 
            />

            {/* Navigation Tabs */}
            <Tabs defaultValue="poems" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-stone-950 border border-stone-800 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl h-auto mb-6 sm:mb-8 shadow-md">
                    <TabsTrigger 
                        value="poems" 
                        onClick={() => setSearchTerm('')}
                        className="data-[state=active]:bg-stone-900 data-[state=active]:text-amber-200 data-[state=active]:border-stone-700/80 border border-transparent rounded-lg sm:rounded-xl py-2 sm:py-2.5 px-1 sm:px-4 text-xs sm:text-sm font-cinzel font-medium transition-all"
                    >
                        <FileText className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400/80 inline" />
                        <span>Poems ({counts.poems})</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                        value="submissions" 
                        onClick={() => setSearchTerm('')}
                        className="data-[state=active]:bg-stone-900 data-[state=active]:text-amber-200 data-[state=active]:border-stone-700/80 border border-transparent rounded-lg sm:rounded-xl py-2 sm:py-2.5 px-1 sm:px-4 text-xs sm:text-sm font-cinzel font-medium transition-all"
                    >
                        <Inbox className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400/80 inline" />
                        <span>Inbox</span>
                        {counts.submissions > 0 && (
                            <span className="ml-1 sm:ml-2 bg-amber-500 text-stone-950 text-[10px] sm:text-xs font-bold rounded-full h-4 sm:h-5 px-1.5 sm:px-2 inline-flex items-center justify-center">
                                {counts.submissions}
                            </span>
                        )}
                    </TabsTrigger>
                    
                    <TabsTrigger 
                        value="users" 
                        onClick={() => setSearchTerm('')}
                        className="data-[state=active]:bg-stone-900 data-[state=active]:text-amber-200 data-[state=active]:border-stone-700/80 border border-transparent rounded-lg sm:rounded-xl py-2 sm:py-2.5 px-1 sm:px-4 text-xs sm:text-sm font-cinzel font-medium transition-all"
                    >
                        <Users className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400/80 inline" />
                        <span>Users ({counts.users})</span>
                    </TabsTrigger>
                </TabsList>

                {/* Poems Tab */}
                <TabsContent value="poems">
                    <Card className="bg-stone-950/70 border-stone-800/90 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden">
                        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-stone-900">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <div>
                                    <CardTitle className="font-cinzel text-lg sm:text-xl text-stone-100">Archived Poems ({counts.poems})</CardTitle>
                                    <p className="text-xs font-serif italic text-stone-400 mt-0.5">Manage and curate published works</p>
                                </div>
                                {selectedPoems.length > 0 && (
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => setDeleteAction({ type: 'notes', ids: selectedPoems })}
                                        className="w-full sm:w-auto bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 rounded-xl h-9"
                                    >
                                        <Trash className="mr-1.5 h-4 w-4" />Delete Selected ({selectedPoems.length})
                                    </Button>
                                )}
                            </div>
                            <div className="relative mt-3 sm:mt-4">
                                <Input 
                                    placeholder="Search poems or poets..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="pl-10 bg-stone-900/90 hover:bg-stone-900 border-stone-800 focus:border-amber-600/70 focus:ring-amber-500/20 h-11 rounded-xl text-stone-100 placeholder:text-stone-500 text-sm shadow-inner" 
                                />
                                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4 pointer-events-none" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4">
                            <div className="border-b border-stone-800/80 py-2.5 px-2 sm:px-3 flex items-center gap-3 text-xs font-cinzel text-stone-400">
                                <input 
                                    type="checkbox" 
                                    checked={selectedPoems.length === poems.length && poems.length > 0} 
                                    onChange={handleSelectAllPoems} 
                                    className="custom-checkbox" 
                                />
                                <label className="cursor-pointer">Select All Visible ({poems.length})</label>
                            </div>
                            
                            <div className="divide-y divide-stone-900 mt-1">
                                {loading.initial ? renderLoader() : poems.map(note => (
                                    <div key={note.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-2 sm:px-3 hover:bg-stone-900/40 rounded-xl transition-colors gap-2.5">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedPoems.includes(note.id)} 
                                                onChange={() => handleSelectPoem(note.id)} 
                                                className="custom-checkbox flex-shrink-0" 
                                            />
                                            <div className="min-w-0">
                                                <h4 className="font-cinzel text-sm sm:text-base font-semibold text-stone-100 truncate">{note.title}</h4>
                                                <p className="text-xs font-serif italic text-stone-400 truncate">by {note.poet_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0 pt-1 sm:pt-0 border-t border-stone-900/60 sm:border-0 w-full sm:w-auto justify-end">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setEditingItem(note)}
                                                className="text-stone-400 hover:text-amber-200 hover:bg-stone-900 rounded-xl h-8 sm:h-9 px-2.5 sm:px-3 text-xs"
                                            >
                                                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setDeleteAction({ type: 'notes', ids: [note.id] })}
                                                className="text-stone-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl h-8 sm:h-9 px-2.5 sm:px-3 text-xs"
                                            >
                                                <Trash className="h-3.5 w-3.5 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div ref={ref}>{loading.more && renderLoader()}</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Submissions Tab */}
                <TabsContent value="submissions">
                    <Card className="bg-stone-950/70 border-stone-800/90 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden">
                        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-stone-900">
                            <CardTitle className="font-cinzel text-lg sm:text-xl text-stone-100">Review Submissions ({counts.submissions})</CardTitle>
                            <p className="text-xs font-serif italic text-stone-400 mt-0.5">Pending poems awaiting approval</p>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4">
                            {loading.initial ? renderLoader() : poemSubmissions.length > 0 ? (
                                <div className="space-y-3">
                                    {poemSubmissions.map(sub => (
                                        <div key={sub.id} className="p-3.5 sm:p-4 bg-stone-900/60 border border-stone-800/80 rounded-xl hover:border-amber-700/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-cinzel text-sm sm:text-base font-bold text-amber-100">{sub.title}</h4>
                                                <p className="text-xs font-serif italic text-stone-400 mt-0.5">by {sub.poet_name}</p>
                                                {sub.description && (
                                                    <p className="text-xs text-stone-400 line-clamp-1 italic mt-1 font-serif">{sub.description}</p>
                                                )}
                                                {sub.tags && sub.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {sub.tags.map(t => (
                                                            <span key={t} className="text-[10px] font-serif italic px-2 py-0.5 rounded-full bg-amber-950/50 border border-amber-600/40 text-amber-300">
                                                                #{t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 flex-shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-stone-800/60 sm:border-0">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => setViewingItem(sub)} 
                                                    disabled={submissionActionId === sub.id}
                                                    className="bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-700 rounded-xl h-8 sm:h-9 text-xs justify-center"
                                                >
                                                    <Eye className="mr-1 h-3.5 w-3.5 text-stone-400" /> Read
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleApprove(sub)} 
                                                    disabled={submissionActionId !== null}
                                                    className="bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-200 border border-emerald-600/50 rounded-xl h-8 sm:h-9 px-2 sm:px-3.5 shadow-sm text-xs justify-center"
                                                >
                                                    {submissionActionId === sub.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1 h-3.5 w-3.5" />}
                                                    {submissionActionId === sub.id ? '...' : 'Approve'}
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleReject(sub.id)} 
                                                    disabled={submissionActionId !== null}
                                                    className="bg-red-950/70 hover:bg-red-900/90 text-red-200 border border-red-700/50 rounded-xl h-8 sm:h-9 px-2 sm:px-3.5 shadow-sm text-xs justify-center"
                                                >
                                                    {submissionActionId === sub.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <X className="mr-1 h-3.5 w-3.5" />}
                                                    {submissionActionId === sub.id ? '...' : 'Reject'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-12 text-stone-500 font-serif italic text-sm">
                                    No pending submissions awaiting review.
                                </p>
                            )}
                            <div ref={ref}>{loading.more && renderLoader()}</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users">
                    <Card className="bg-stone-950/70 border-stone-800/90 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden">
                        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-stone-900">
                            <CardTitle className="font-cinzel text-lg sm:text-xl text-stone-100">Society Directory ({counts.users})</CardTitle>
                            <p className="text-xs font-serif italic text-stone-400 mt-0.5">Manage user privileges and accounts</p>
                            <div className="relative mt-3 sm:mt-4">
                                <Input 
                                    placeholder="Search users by name or email..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="pl-10 bg-stone-900/90 hover:bg-stone-900 border-stone-800 focus:border-amber-600/70 focus:ring-amber-500/20 h-11 rounded-xl text-stone-100 placeholder:text-stone-500 text-sm shadow-inner" 
                                />
                                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 w-4 h-4 pointer-events-none" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4">
                            <div className="divide-y divide-stone-900">
                                {loading.initial ? renderLoader() : users.map(user => (
                                    <div key={user.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-2 sm:px-3 hover:bg-stone-900/40 rounded-xl transition-colors gap-2.5 sm:gap-3">
                                        <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                                            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-stone-700 group-hover:border-amber-500/60 transition-colors flex-shrink-0">
                                                <Image src={user.photo_url || '/defaultPfp.png'} alt={user.display_name} fill className="object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <p className="font-cinzel font-bold text-xs sm:text-sm text-stone-100 group-hover:text-amber-200 transition-colors truncate">{user.display_name}</p>
                                                    {user.role === 'semi-admin' && (
                                                        <span className="text-[9px] sm:text-[10px] font-sans px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/50 text-amber-300 font-semibold">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] sm:text-xs text-stone-500 font-mono truncate">{user.email}</p>
                                            </div>
                                        </Link>
                                        {isMainAdmin && user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                                            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-1 sm:pt-0 border-t border-stone-900/60 sm:border-0 w-full sm:w-auto justify-end">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleToggleSemiAdmin(user.id, user.role)} 
                                                    disabled={updatingUserId === user.id}
                                                    className={`rounded-xl h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-medium border transition-all ${
                                                        user.role === 'semi-admin'
                                                            ? 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-700'
                                                            : 'bg-amber-950/50 hover:bg-amber-900/70 text-amber-200 border-amber-600/50 shadow-sm'
                                                    }`}
                                                >
                                                    {updatingUserId === user.id ? (
                                                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                                    ) : user.role === 'semi-admin' ? (
                                                        <ShieldOff className="mr-1 h-3.5 w-3.5 text-stone-400" />
                                                    ) : (
                                                        <Shield className="mr-1 h-3.5 w-3.5 text-amber-400" />
                                                    )}
                                                    {updatingUserId === user.id ? '...' : (user.role === 'semi-admin' ? 'Demote' : 'Promote')}
                                                </Button>
                                                {updateSuccessUserId === user.id && <Check className="h-4 w-4 text-emerald-400 animate-in zoom-in" />}
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setDeleteAction({ type: 'user', userId: user.id })}
                                                    className="text-stone-500 hover:text-red-300 hover:bg-red-950/40 rounded-xl h-8 w-8 sm:h-9 sm:w-9"
                                                >
                                                    <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div ref={ref}>{loading.more && renderLoader()}</div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPage;

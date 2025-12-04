"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase/config.js';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Inbox, Users, Trash, Shield, ShieldOff, Edit, X, Eye, Check, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import '@/css/Admin.css';

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
        <DialogContent className="w-[90vw] rounded-lg sm:max-w-md bg-gray-900 border-gray-700">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

const EditPoemForm = ({ note, onSave, onCancel }) => {
    const [formData, setFormData] = useState(note);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    return (
        // Changed to a flex column layout for a clean, vertical form structure on all screen sizes.
        <div className="flex flex-col space-y-4 py-4">
            {/* Title Field */}
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="title" className="text-gray-400">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} className="bg-gray-700 border-gray-600" />
            </div>

            {/* Poet Name Field */}
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="poet_name" className="text-gray-400">Poet Name</Label>
                <Input id="poet_name" name="poet_name" value={formData.poet_name} onChange={handleChange} className="bg-gray-700 border-gray-600" />
            </div>

            {/* Preview Field */}
            <div className="grid w-full gap-1.5">
                <Label htmlFor="preview" className="text-gray-400">Preview</Label>
                <Textarea id="preview" name="preview" value={formData.preview} onChange={handleChange} className="bg-gray-700 border-gray-600" />
            </div>

            {/* Content Field */}
            <div className="grid w-full gap-1.5">
                <Label htmlFor="content" className="text-gray-400">Content</Label>
                <Textarea id="content" name="content" value={formData.content} rows={8} className="bg-gray-700 border-gray-600" />
            </div>

            {/* Action Buttons */}
            <DialogFooter className="!mt-6">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSave(formData)}>Save Changes</Button>
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
                // FIX: Removed ordering by 'created_at' as the column  doesn't exist on the 'profiles' table.
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

    const confirmDelete = async () => {
        if (!deleteAction) return;
        const { tableName, ids } = deleteAction;

        const { error } = await supabase.from(tableName).delete().in('id', ids);
        if (error) { console.error(`Error deleting from ${tableName}:`, error); return; }

        const tabToRefresh = tableName === 'notes' ? 'poems' : tableName === 'profiles' ? 'users' : '';
        if (tabToRefresh) refreshDataForTab(tabToRefresh);
        if (tableName === 'notes') setSelectedPoems([]);
        setDeleteAction(null);
    };

    const handleUpdate = async (tableName, item) => {
        const { id, ...dataToUpdate } = item;
        await supabase.from(tableName).update(dataToUpdate).eq('id', id);
        setEditingItem(null);
        refreshDataForTab('poems');
    };

    const handleApprove = async (submission) => {
        const { error: insertError } = await supabase.from('notes').insert([{
            title: submission.title, content: submission.content,
            preview: submission.description || '', tags: submission.tags || [],
            user_id: submission.user_id, poet_name: submission.poet_name,
        }]);

        if (!insertError) {
            await supabase.from('poem_submissions').delete().eq('id', submission.id);
        } else { console.error("Error approving submission:", insertError); }
        refreshDataForTab('submissions');
        refreshDataForTab('poems');
    };

    const handleReject = async (id) => {
        await supabase.from('poem_submissions').delete().eq('id', id);
        refreshDataForTab('submissions');
    };

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
        <div className="max-w-6xl mx-auto py-12 px-4 text-white">
            <h1 className="text-4xl font-bold text-center mb-8 font-cinzel">Admin Dashboard</h1>

            <Dialog open={!!editingItem} onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}>
                <DialogContent className="w-[90vw] rounded-lg sm:max-w-lg bg-gray-900 border-gray-700">
                    <DialogHeader><DialogTitle>Edit Poem</DialogTitle></DialogHeader>
                    {editingItem && <EditPoemForm note={editingItem} onCancel={() => setEditingItem(null)} onSave={(updated) => handleUpdate('notes', updated)} />}
                </DialogContent>
            </Dialog>
            <Dialog open={!!viewingItem} onOpenChange={(isOpen) => !isOpen && setViewingItem(null)}>
                <DialogContent className="w-[90vw] rounded-lg sm:max-w-lg bg-gray-900 border-gray-700">
                    <DialogHeader><DialogTitle>{viewingItem?.title}</DialogTitle></DialogHeader>
                    <p className="text-gray-400">by {viewingItem?.poet_name}</p>
                    <div className="max-h-[60vh] overflow-y-auto mt-4 pr-2">
                        <p className="whitespace-pre-wrap">{viewingItem?.content}</p>
                    </div>
                </DialogContent>
            </Dialog>
            <ConfirmationDialog open={!!deleteAction} onOpenChange={() => setDeleteAction(null)} onConfirm={confirmDelete} title="Are you absolutely sure?" description="This action cannot be undone and will permanently delete the selected item(s)." />

            <Tabs defaultValue="poems" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                    <TabsTrigger value="poems" onClick={() => setSearchTerm('')}><FileText className="mr-2 h-4 w-4" />Poems ({counts.poems})</TabsTrigger>
                    <TabsTrigger value="submissions" onClick={() => setSearchTerm('')}>
                        <Inbox className="mr-2 h-4 w-4" />Submissions
                        {counts.submissions > 0 && <span className="ml-2 bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{counts.submissions}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="users" onClick={() => setSearchTerm('')}><Users className="mr-2 h-4 w-4" />Users ({counts.users})</TabsTrigger>
                </TabsList>

                <TabsContent value="poems">
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <CardTitle>Manage Poems ({counts.poems})</CardTitle>
                                {selectedPoems.length > 0 && <Button variant="destructive" onClick={() => setDeleteAction({ tableName: 'notes', ids: selectedPoems })}><Trash className="mr-2 h-4 w-4" />Delete ({selectedPoems.length})</Button>}
                            </div>
                            <Input placeholder="Search poems or poets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#1f2937] mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="border-b border-gray-700 p-2 flex items-center gap-4"><input type="checkbox" checked={selectedPoems.length === poems.length && poems.length > 0} onChange={handleSelectAllPoems} className="custom-checkbox" /><label>Select All Visible</label></div>
                            {loading.initial ? renderLoader() : poems.map(note => (
                                <div key={note.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 border-b border-gray-700 gap-2 sm:gap-0">
                                    <div className="flex items-center gap-4 w-full">
                                        <input type="checkbox" checked={selectedPoems.includes(note.id)} onChange={() => handleSelectPoem(note.id)} className="custom-checkbox" />
                                        <span>{note.title} by {note.poet_name}</span>
                                    </div>
                                    <div className="flex space-x-2 self-end sm:self-center">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingItem(note)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="icon" onClick={() => setDeleteAction({ tableName: 'notes', ids: [note.id] })}><Trash className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                            <div ref={ref}>{loading.more && renderLoader()}</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="submissions">
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader><CardTitle>Review Submissions</CardTitle></CardHeader>
                        <CardContent>
                            {loading.initial ? renderLoader() : poemSubmissions.map(sub => (
                                <div key={sub.id} className="p-3 border-b border-gray-700">
                                    <p><strong>{sub.title}</strong> by {sub.poet_name}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Button variant="outline" size="sm" onClick={() => setViewingItem(sub)}><Eye className="mr-2 h-4 w-4" />View</Button>
                                        <Button variant="secondary" size="sm" onClick={() => handleApprove(sub)}><Check className="mr-2 h-4 w-4" />Approve</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleReject(sub.id)}><X className="mr-2 h-4 w-4" />Reject</Button>
                                    </div>
                                </div>
                            ))}
                            <div ref={ref}>{loading.more && renderLoader()}</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users">
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader><CardTitle>Manage Users</CardTitle><Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#1f2937]" /></CardHeader>
                        <CardContent>
                            {loading.initial ? renderLoader() : users.map(user => (
                                <div key={user.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 border-b border-gray-700 gap-2 sm:gap-0">
                                    <Link href={`/profile/${user.id}`} className="flex items-center gap-2 w-full hover:bg-gray-800 p-2 rounded-md transition-colors">
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                            <Image src={user.photo_url || '/defaultPfp.png'} alt={user.display_name} fill className="object-cover" />
                                        </div>
                                        <div><p>{user.display_name}</p><p className="text-xs text-gray-400">{user.email}</p></div>
                                    </Link>
                                    {isMainAdmin && user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <Button size="sm" onClick={() => handleToggleSemiAdmin(user.id, user.role)} disabled={updatingUserId === user.id}>{updatingUserId === user.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (user.role === 'semi-admin' ? <ShieldOff className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />)}{updatingUserId === user.id ? 'Updating...' : (user.role === 'semi-admin' ? 'Demote' : 'Promote')}</Button>
                                            {updateSuccessUserId === user.id && <Check className="h-5 w-5 text-green-500" />}
                                            <Button variant="destructive" size="icon" onClick={() => setDeleteAction({ tableName: 'profiles', ids: [user.id] })}><Trash className="h-4 w-4" /></Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={ref}>{loading.more && renderLoader()}</div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPage;

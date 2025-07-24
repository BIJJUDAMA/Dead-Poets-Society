import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/supabase/config.js';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { FileText, Inbox, Users, Trash, Shield, ShieldOff, Edit, X, Eye, Check } from 'lucide-react';
import '@/css/Admin.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ConfirmationDialog = ({ open, onOpenChange, onConfirm, title, description }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-900 border-gray-700">
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
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right text-gray-400">Title</Label><Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3 bg-gray-700" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="poet_name" className="text-right text-gray-400">Poet Name</Label><Input id="poet_name" name="poet_name" value={formData.poet_name} onChange={handleChange} className="col-span-3 bg-gray-700" /></div>
            <div className="grid grid-cols-4 items-start gap-4"><Label htmlFor="preview" className="text-right pt-2 text-gray-400">Preview</Label><Textarea id="preview" name="preview" value={formData.preview} onChange={handleChange} className="col-span-3 bg-gray-700" /></div>
            <div className="grid grid-cols-4 items-start gap-4"><Label htmlFor="content" className="text-right pt-2 text-gray-400">Content</Label><Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={8} className="col-span-3 bg-gray-700" /></div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSave(formData)}>Save Changes</Button>
            </DialogFooter>
        </div>
    );
};

const AdminPage = () => {
    const { isMainAdmin, loading: authLoading } = useAuth();
    const [data, setData] = useState({ poems: [], users: [], poemSubmissions: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('poems');
    const [selectedPoems, setSelectedPoems] = useState([]);
    const [deleteAction, setDeleteAction] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [poemsRes, usersRes, submissionsRes] = await Promise.all([
                supabase.from('notes').select('*').order('created_at', { ascending: false }),
                supabase.from('profiles').select('*'),
                supabase.from('poem_submissions').select('*').order('submitted_at', { ascending: false })
            ]);

            if (poemsRes.error) throw poemsRes.error;
            if (usersRes.error) throw usersRes.error;
            if (submissionsRes.error) throw submissionsRes.error;

            setData({
                poems: poemsRes.data || [],
                users: usersRes.data || [],
                poemSubmissions: submissionsRes.data || [],
            });
        } catch (error) { console.error("Failed to fetch data:", error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { if (!authLoading) fetchData(); }, [authLoading, fetchData]);

    const confirmDelete = async () => {
        if (!deleteAction) return;
        const { tableName, ids } = deleteAction;

        const { error } = await supabase.from(tableName).delete().in('id', ids);
        if (error) console.error(`Error deleting from ${tableName}:`, error);

        if (tableName === 'notes') setSelectedPoems([]);
        setDeleteAction(null);
        fetchData();
    };

    const handleUpdate = async (tableName, item) => {
        const { id, ...dataToUpdate } = item;
        await supabase.from(tableName).update(dataToUpdate).eq('id', id);
        setEditingItem(null);
        fetchData();
    };

    const handleApprove = async (submission) => {
        const { error: insertError } = await supabase.from('notes').insert([{
            title: submission.title,
            content: submission.content,
            preview: submission.description || '',
            tags: submission.tags || [],
            user_id: submission.user_id,
            poet_name: submission.poet_name,
        }]);

        if (!insertError) {
            await supabase.from('poem_submissions').update({ status: 'approved' }).eq('id', submission.id);
        } else {
            console.error("Error approving submission:", insertError);
        }
        fetchData();
    };

    const handleReject = async (id) => {
        await supabase.from('poem_submissions').delete().eq('id', id);
        fetchData();
    };

    const handleToggleSemiAdmin = async (userId, currentStatus) => {
        const newRole = currentStatus === 'semi-admin' ? 'user' : 'semi-admin';
        try {
            const { error } = await supabase.from("profiles").update({ role: newRole }).eq('id', userId);
            if (error) {

            }

            setData(prevData => ({
                ...prevData,
                users: prevData.users.map(u => u.id === userId ? { ...u, role: newRole } : u)
            }));
        } catch (error) {
            console.error("Error toggling admin status:", error);
            alert("Failed to update user role. Please ensure your database's Row Level Security policies allow admins to update user profiles.");
        }
    };

    const filteredPoems = useMemo(() => data.poems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.poet_name.toLowerCase().includes(searchTerm.toLowerCase())), [data.poems, searchTerm]);
    const filteredUsers = useMemo(() => data.users.filter(u => u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())), [data.users, searchTerm]);

    const handleSelectPoem = (id) => setSelectedPoems(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
    const handleSelectAllPoems = () => setSelectedPoems(selectedPoems.length === filteredPoems.length ? [] : filteredPoems.map(p => p.id));

    if (authLoading) return <div className="text-center py-20">Verifying Admin Status...</div>;

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 text-white">
            <h1 className="text-4xl font-bold text-center mb-8 font-cinzel">Admin Dashboard</h1>

            <Dialog open={!!editingItem} onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}>
                <DialogContent className="bg-gray-900 border-gray-700"><DialogHeader><DialogTitle>Edit Poem</DialogTitle></DialogHeader>{editingItem && <EditPoemForm note={editingItem} onCancel={() => setEditingItem(null)} onSave={(updated) => handleUpdate('notes', updated)} />}</DialogContent>
            </Dialog>
            <Dialog open={!!viewingItem} onOpenChange={(isOpen) => !isOpen && setViewingItem(null)}>
                <DialogContent className="bg-gray-900 border-gray-700"><DialogHeader><DialogTitle>{viewingItem?.title}</DialogTitle></DialogHeader><p className="text-gray-400">by {viewingItem?.poet_name}</p><p className="whitespace-pre-wrap mt-4">{viewingItem?.content}</p></DialogContent>
            </Dialog>
            <ConfirmationDialog open={!!deleteAction} onOpenChange={() => setDeleteAction(null)} onConfirm={confirmDelete} title="Are you absolutely sure?" description="This action cannot be undone and will permanently delete the selected item(s)." />

            <Tabs defaultValue="poems" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                    <TabsTrigger value="poems" onClick={() => setSearchTerm('')}><FileText className="mr-2 h-4 w-4" />Poems</TabsTrigger>
                    <TabsTrigger value="submissions" onClick={() => setSearchTerm('')}><Inbox className="mr-2 h-4 w-4" />Submissions</TabsTrigger>
                    <TabsTrigger value="users" onClick={() => setSearchTerm('')}><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
                </TabsList>

                <TabsContent value="poems">
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Manage Poems ({filteredPoems.length})</CardTitle>
                                {selectedPoems.length > 0 && <Button variant="destructive" onClick={() => setDeleteAction({ tableName: 'notes', ids: selectedPoems })}><Trash className="mr-2 h-4 w-4" />Delete ({selectedPoems.length})</Button>}
                            </div>
                            <Input placeholder="Search poems or poets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#1f2937]" />
                        </CardHeader>
                        <CardContent>
                            <div className="border-b border-gray-700 p-2 flex items-center gap-4"><input type="checkbox" checked={selectedPoems.length === filteredPoems.length && filteredPoems.length > 0} onChange={handleSelectAllPoems} className="custom-checkbox" /><label>Select All</label></div>
                            {loading ? <p>Loading...</p> : filteredPoems.map(note => (
                                <div key={note.id} className="flex justify-between items-center p-2 border-b border-gray-700">
                                    <div className="flex items-center gap-4"><input type="checkbox" checked={selectedPoems.includes(note.id)} onChange={() => handleSelectPoem(note.id)} className="custom-checkbox" /><span>{note.title} by {note.poet_name}</span></div>
                                    <div className="space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingItem(note)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="destructive" size="icon" onClick={() => setDeleteAction({ tableName: 'notes', ids: [note.id] })}><Trash className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="submissions">
                    <Card className="bg-gray-900 border-gray-700"><CardHeader><CardTitle>Review Submissions</CardTitle></CardHeader><CardContent>{loading ? <p>Loading...</p> : data.poemSubmissions.filter(s => s.status === 'pending').map(sub => (<div key={sub.id} className="p-3 border-b border-gray-700"><p><strong>{sub.title}</strong> by {sub.poet_name}</p><div className="space-x-2 mt-2"><Button variant="outline" size="sm" onClick={() => setViewingItem(sub)}><Eye className="mr-2 h-4 w-4" />View</Button><Button variant="secondary" size="sm" onClick={() => handleApprove(sub)}><Check className="mr-2 h-4 w-4" />Approve</Button><Button variant="destructive" size="sm" onClick={() => handleReject(sub.id)}><X className="mr-2 h-4 w-4" />Reject</Button></div></div>))}</CardContent></Card>
                </TabsContent>

                <TabsContent value="users">
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader><CardTitle>Manage Users</CardTitle><Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#1f2937]" /></CardHeader>
                        <CardContent>
                            {loading ? <p>Loading...</p> : filteredUsers.map(user => (
                                <div key={user.id} className="flex justify-between items-center p-2 border-b border-gray-700">
                                    {/* **FIX:** Wrap user info in a Link component to make it clickable */}
                                    <Link to={`/profile/${user.id}`} className="flex items-center gap-2 flex-grow hover:bg-gray-800 p-2 rounded-md transition-colors">
                                        <img src={user.photo_url || '/defaultPfp.png'} alt={user.display_name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p>{user.display_name}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                    </Link>
                                    {isMainAdmin && user.email !== import.meta.env.VITE_ADMIN_EMAIL && (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Button size="sm" onClick={() => handleToggleSemiAdmin(user.id, user.role)}>{user.role === 'semi-admin' ? <ShieldOff className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}{user.role === 'semi-admin' ? 'Demote' : 'Promote'}</Button>
                                            <Button variant="destructive" size="icon" onClick={() => setDeleteAction({ tableName: 'profiles', ids: [user.id] })}><Trash className="h-4 w-4" /></Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPage;

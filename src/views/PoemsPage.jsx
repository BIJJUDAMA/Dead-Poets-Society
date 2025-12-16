/**
 * The primary browsing interface, displaying a library of poems
 * 
 * Purpose:
 * - Lists all poems with advanced filtering and sorting
 * - Supports Infinite Scrolling for seamless navigation
 * - Provides Search (by title/author) and Filtering (by tags)
 * 
 * Data Strategy:
 * - Uses Supabase `range()` for pagination
 * - Implements debounced search to minimize database queries
 * - Syncs URL state (implied by typical patterns, though currently component state)
 * 
 * Component Architecture:
 * - Parent: `PoemsPage` (manages state & fetching)
 * - Children: `NotesGrid` (display), `MultiSelectDropdown` (filtering), `SkeletonCard` (loading)
 * 
 */

"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/supabase/config.js';
import NotesGrid from '@/components/poems/NotesGrid';
import SkeletonCard from '@/components/common/SkeletonCard.jsx';
import { useInView } from 'react-intersection-observer';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { POEM_TAGS } from '@/lib/constants.js';
import MultiSelectDropdown from '@/components/common/MultiSelectDropdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 8;


const PoemsPage = ({ initialNotes }) => {
    const [notes, setNotes] = useState(initialNotes || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('created_at_desc');
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(!initialNotes);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    // Infinite Scroll Ref
    const { ref, inView } = useInView({ threshold: 0.5 });


    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    /**
     * Core Fetching Logic:
     * Retrieves filtered and sorted notes from Supabase.
     * 
     * @param {boolean} isInitial - Reset list if true (new filter applied), append if false (pagination).
     */
    // Fetches notes with pagination, sorting, search, and tag filtering
    const fetchNotes = useCallback(async (isInitial = false) => {
        if (!hasMore && !isInitial) return;

        setLoading(true);

        try {
            const lastUnderscoreIndex = sortBy.lastIndexOf('_');
            const field = sortBy.substring(0, lastUnderscoreIndex);
            const order = sortBy.substring(lastUnderscoreIndex + 1);

            const from = isInitial ? 0 : (page + 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            let query = supabase.from('notes').select('*');


            // Apply search filter (title or poet name)
            if (debouncedSearch) {
                query = query.or(`title.ilike.%${debouncedSearch}%,poet_name.ilike.%${debouncedSearch}%`);
            }
            // Apply tag filter (array contains check)
            if (selectedTags.length > 0) {
                query = query.contains('tags', selectedTags);
            }

            // Apply sorting dynamic construction
            query = query.order(field, { ascending: order === 'asc' }).range(from, to);

            const { data: newNotes, error } = await query;

            if (error) throw error;

            setNotes(prev => {
                if (isInitial) return newNotes;
                // Deduplicate to prevent key errors
                const existingIds = new Set(prev.map(n => n.id));
                const uniqueNewNotes = newNotes.filter(n => !existingIds.has(n.id));
                return [...prev, ...uniqueNewNotes];
            });

            if (isInitial) setPage(0); else setPage(prev => prev + 1);
            setHasMore(newNotes.length === PAGE_SIZE);
        } catch (error) {
            console.error("Error fetching poems: ", error);
        } finally {
            setLoading(false);
        }
    }, [sortBy, page, hasMore, debouncedSearch, selectedTags]);

    useEffect(() => {

        if (initialNotes && notes.length > 0 && sortBy === 'created_at_desc' && !debouncedSearch && selectedTags.length === 0 && page === 0) {
            return;
        }
        // Reset state when filters change
        setHasMore(true);
        setPage(0);
        fetchNotes(true);
    }, [sortBy, debouncedSearch, selectedTags]);

    useEffect(() => {
        // Infinite scroll trigger
        if (inView && !loading && hasMore) {
            fetchNotes();
        }
    }, [inView, loading, hasMore, fetchNotes]);



    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-12 pb-20 bg-black text-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-5xl font-bold text-white text-center md:text-left">The Collection</h1>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Input
                                type="text"
                                placeholder="Search poems..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-[#1f2937] border-gray-700"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <Select onValueChange={setSortBy} defaultValue={sortBy}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_at_desc">Latest</SelectItem>
                                <SelectItem value="created_at_asc">Oldest</SelectItem>
                                <SelectItem value="applause_count_desc">Most Applauded</SelectItem>
                            </SelectContent>
                        </Select>
                        <MultiSelectDropdown
                            options={POEM_TAGS}
                            selectedOptions={selectedTags}
                            onSelectionChange={setSelectedTags}
                            title="Filter by Tag"
                        />
                    </div>
                </div>

                {/* Loading State Skeletons */}
                {loading && notes.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <NotesGrid notes={notes} />
                )}

                {/* Intersection Observer target for infinite scrolling */}
                <div ref={ref} className="h-10" />
                {loading && notes.length > 0 && <p className="text-center text-gray-500 mt-8">Loading more...</p>}
                {!hasMore && !loading && notes.length > 0 && <p className="text-center text-gray-500 mt-8">You have reached the end of the verses.</p>}
            </div>
        </motion.div>
    );
};

export default PoemsPage;

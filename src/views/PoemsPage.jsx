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
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase/config.js';
import NotesGrid from '@/components/poems/NotesGrid';

import { useInView } from 'react-intersection-observer';
import { Search, X, SlidersHorizontal, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { POEM_TAGS } from '@/lib/constants.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 12;


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

            console.log('Fetching notes from:', from, 'to:', to, 'Sort:', sortBy);
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



    const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
    const [tagSearch, setTagSearch] = useState('');

    const filteredTagsList = POEM_TAGS.filter(tag => 
        tag.toLowerCase().includes(tagSearch.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-12 pb-20 bg-black text-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Title & Organization Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400 mb-2 tracking-wide">
                        Society's Collection
                    </h1>
                    
                    {/* Decorative rule */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-700/60" />
                        <span className="text-amber-500/60 text-xs">✦</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-700/60" />
                    </div>
                </motion.div>

                {/* Search & Filter Toolbar */}
                <div className="max-w-4xl mx-auto mb-10">
                    <div className="flex flex-col md:flex-row items-stretch gap-3">
                        {/* Hero Search Bar */}
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                placeholder="Search verses, titles, or poet names..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-10 bg-stone-900/90 hover:bg-stone-900 border-stone-800 focus:border-amber-600/70 focus:ring-amber-500/20 h-12 rounded-xl text-stone-100 placeholder:text-stone-500 text-sm sm:text-base transition-all shadow-inner w-full"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500/70 w-5 h-5 pointer-events-none" />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Controls Row on Mobile / Inline on Desktop */}
                        <div className="flex items-center gap-2.5">
                            {/* Theme Filter Trigger Button */}
                            <button
                                onClick={() => setIsThemePickerOpen(true)}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 h-12 rounded-xl text-sm font-medium border transition-all ${
                                    selectedTags.length > 0
                                        ? 'bg-amber-950/70 border-amber-600/70 text-amber-200 shadow-[0_0_15px_rgba(217,119,6,0.2)]'
                                        : 'bg-stone-900/90 hover:bg-stone-800 border-stone-800 text-stone-300 hover:text-white'
                                }`}
                            >
                                <SlidersHorizontal className="w-4 h-4 text-amber-400/90" />
                                <span>Themes</span>
                                {selectedTags.length > 0 && (
                                    <span className="ml-0.5 px-2 py-0.5 text-xs rounded-full bg-amber-500 text-stone-950 font-bold">
                                        {selectedTags.length}
                                    </span>
                                )}
                            </button>

                            {/* Sort Dropdown */}
                            <div className="flex-1 md:flex-none min-w-[140px] sm:min-w-[170px]">
                                <Select onValueChange={setSortBy} defaultValue={sortBy}>
                                    <SelectTrigger className="w-full h-12 bg-stone-900/90 hover:bg-stone-800 border-stone-800 rounded-xl text-stone-200 text-sm font-sans focus:ring-amber-500/20">
                                        <SelectValue placeholder="Sort by..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-stone-900 border-stone-800 text-stone-200">
                                        <SelectItem value="created_at_desc">Latest Verses</SelectItem>
                                        <SelectItem value="created_at_asc">Oldest Verses</SelectItem>
                                        <SelectItem value="applause_count_desc">Most Applauded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Active Filter Chips Tray (Visible only when tags are filtered) */}
                    {selectedTags.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3.5 flex flex-wrap items-center gap-2 pt-1"
                        >
                            <span className="text-xs text-stone-500 font-sans tracking-wide mr-1">Filtered by:</span>
                            {selectedTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif italic bg-amber-950/60 border border-amber-600/50 text-amber-200 hover:bg-amber-900/70 transition-colors shadow-sm group"
                                >
                                    <span>{tag}</span>
                                    <X className="w-3 h-3 text-amber-400/70 group-hover:text-amber-200" />
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedTags([])}
                                className="text-xs text-stone-400 hover:text-amber-300 underline underline-offset-4 ml-1.5 transition-colors"
                            >
                                Clear all
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Theme Selector Modal / Bottom Sheet */}
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
                                    <h3 className="text-lg font-cinzel font-bold text-amber-100">Filter by Theme</h3>
                                </div>
                                <button 
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
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                            </div>

                            {/* Tags Grid / Chips */}
                            <div className="max-h-64 overflow-y-auto pr-1 flex flex-wrap gap-2 py-1 select-none">
                                {filteredTagsList.map((tag) => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
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
                                    onClick={() => setSelectedTags([])}
                                    disabled={selectedTags.length === 0}
                                    className="text-xs text-stone-400 hover:text-amber-300 disabled:opacity-40 disabled:hover:text-stone-400 transition-colors"
                                >
                                    Reset Selection
                                </button>
                                <button
                                    onClick={() => setIsThemePickerOpen(false)}
                                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
                                >
                                    View Verses {selectedTags.length > 0 && `(${selectedTags.length})`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State Skeletons */}
                {loading && notes.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-72 bg-white/5 animate-pulse rounded-xl" />
                        ))}
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

/**
 * The landing page of the Dead Poets Society AVV
 * 
 * Purpose:
 * - Showcases "Most Applauded" poems to highlight popular content (Depending on number of applauds)
 * - Displays "Recent Additions"
 * 
 * Key Logic:
 * - Fetches the top 4 most applauded poems server-side (via Supabase client)
 * - Uses `NotesGrid` component to render lists of poems
 * - Implements a loading state with `SkeletonCard` for better UX
*/
"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/config.js';
import HeroSection from '@/components/layout/HeroSection';
import Slideshow from '@/components/common/Slideshow';
import NotesGrid from '@/components/poems/NotesGrid';
import SkeletonCard from '@/components/common/SkeletonCard.jsx';


const HomePage = () => {

    // State to store the list of most applauded poems
    const [mostApplauded, setMostApplauded] = useState([]);
    // Loading state for the async fetch operation
    const [loading, setLoading] = useState(true);

    // Fetch the 4 most applauded poems for the Hero/Highlights section
    useEffect(() => {
        const fetchMostApplauded = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('notes')
                    .select('*')
                    .order('applause_count', { ascending: false })
                    .limit(4);

                if (error) throw error;
                setMostApplauded(data);
            } catch (error) {
                console.error("Error fetching most applauded poems:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMostApplauded();
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HeroSection />
            <Slideshow />
            <section className="py-16 px-4 bg-black">
                <h2 className="text-4xl font-bold text-center mb-12 text-white font-cinzel">Most Applauded</h2>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    // Displays the most applauded notes in a grid
                    <NotesGrid notes={mostApplauded} />
                )}
            </section>


            <section className="py-16 px-4 bg-black-900">
                <h2 className="text-4xl font-bold text-center mb-12 text-white font-cinzel">Recent Additions</h2>

                {/* Displays the latest 8 notes via internal fetching in NotesGrid */}
                <NotesGrid count={8} />
            </section>

        </motion.div >
    );
};

export default HomePage;

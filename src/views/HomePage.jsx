"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/config.js';
import HeroSection from '../components/HeroSection';
import Slideshow from '../components/Slideshow';
import NotesGrid from '../components/NotesGrid';
import SkeletonCard from '../components/SkeletonCard.jsx';

const HomePage = () => {
    const [mostApplauded, setMostApplauded] = useState([]);
    const [loading, setLoading] = useState(true);

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

            {/* Most Applauded Section */}
            <section className="py-16 px-4 bg-black">
                <h2 className="text-4xl font-bold text-center mb-12 text-white font-cinzel">Most Applauded</h2>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <NotesGrid notes={mostApplauded} />
                )}
            </section>

            {/* Recent Additions Section */}
            <section className="py-16 px-4 bg-black-900">
                <h2 className="text-4xl font-bold text-center mb-12 text-white font-cinzel">Recent Additions</h2>
                {/* This NotesGrid will fetch the 8 most recent poems on its own */}
                <NotesGrid count={8} />
            </section>

        </motion.div>
    );
};

export default HomePage;

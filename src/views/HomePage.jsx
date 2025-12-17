/**
 * The landing page of the Dead Poets Society AVV
 * 
 * Purpose:
 * - Showcases "Most Applauded" poems to highlight popular content (Depending on number of applauds)
 * - Displays "Recent Additions"
 * 
 * Key Logic:
 * - Receives data via props from ISR (src/app/page.js)
 * - Uses `NotesGrid` component to render lists of poems
 */
"use client";
import { motion } from 'framer-motion';
import HeroSection from '@/components/layout/HeroSection';
import Slideshow from '@/components/common/Slideshow';
import NotesGrid from '@/components/poems/NotesGrid';


const HomePage = ({ initialMostApplauded = [], initialRecentPoems = [] }) => {

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HeroSection />
            <Slideshow />
            <section className="py-16 px-4 bg-black">
                <h2 className="text-4xl font-bold text-center mb-12 text-white font-cinzel">Most Applauded</h2>
                <NotesGrid notes={initialMostApplauded} />
            </section>


            <section className="py-16 px-4 bg-black-900">
                <h2 className="text-4xl font-bold text-center mb-12 text-white font-cinzel">Recent Additions</h2>

                <NotesGrid notes={initialRecentPoems} />
            </section>

        </motion.div >
    );
};

export default HomePage;

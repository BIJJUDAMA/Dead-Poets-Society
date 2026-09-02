"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';

const AboutUsPage = () => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen bg-black text-white py-12 sm:py-16 px-4 relative overflow-hidden selection:bg-amber-900/40 selection:text-amber-100"
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-yellow-600/5 blur-[140px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
                
                {/* Title & Organization Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-8 sm:mb-10"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-amber-100/90 to-stone-400 mb-2 tracking-wide">
                        Dead Poets Society
                    </h1>
                    <h2 className="text-xs sm:text-sm md:text-base text-stone-400 font-sans tracking-[0.25em] uppercase font-light">
                        Amrita Vishwa Vidyapeetham
                    </h2>
                    
                    {/* Decorative rule */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-700/60" />
                        <span className="text-amber-500/60 text-xs">✦</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-700/60" />
                    </div>
                </motion.div>

                {/* Hero Showcase Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
                    className="w-full max-w-3xl mb-10 sm:mb-12 rounded-2xl overflow-hidden h-60 sm:h-72 md:h-[360px] relative border border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group"
                >
                    <Image
                        src="/aboutUs.jpg"
                        alt="About Us"
                        fill
                        priority
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                </motion.div>

                {/* Narrative & Manifesto Section */}
                <div className="w-full max-w-2xl space-y-6 sm:space-y-7 text-center">

                    {/* Section Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="flex flex-col items-center"
                    >
                        <h3 className="text-2xl sm:text-3xl italic font-serif text-amber-100/90 mb-2 tracking-wide">
                            Who We Are
                        </h3>
                        <div className="w-10 h-[1px] bg-amber-600/40 rounded-full mb-5" />

                        {/* Lead statement */}
                        <p className="text-lg sm:text-xl font-serif italic text-stone-200 leading-relaxed max-w-xl [text-wrap:balance]">
                            We are a collective of <span className="text-amber-200 font-normal underline decoration-amber-500/40 decoration-1 underline-offset-4">poets</span> who believe that words can change the world.
                        </p>
                    </motion.div>

                    {/* Mission Paragraph */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-stone-300 text-sm sm:text-base md:text-lg leading-relaxed font-sans font-light max-w-2xl mx-auto [text-wrap:balance] px-2"
                    >
                        <p>
                            Inspired by the spirit of <span className="italic text-amber-200 font-serif font-medium">carpe diem</span>, we gather here to celebrate poetry and prose that stirs the soul.
                            Our society is built on the voices of the unheard, the verses scribbled in margins, and the belief that beauty lies in vulnerability.
                        </p>
                    </motion.div>

                    {/* Poetic Creed / Manifesto Stanza */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="py-2 my-2 text-center"
                    >
                        <div className="space-y-2.5 text-stone-300 font-serif text-base sm:text-lg leading-relaxed italic">
                            <p className="font-semibold text-amber-100 not-italic text-lg sm:text-xl tracking-wide mb-3">
                                This is not just a website.
                            </p>
                            <p className="text-stone-200">
                                This is a place to remember those who came before us,
                            </p>
                            <p className="text-stone-300">
                                to give breath to those who have yet to speak,
                            </p>
                            <p className="text-amber-200/90 font-medium pt-0.5">
                                and to make our lives and our words extraordinary.
                            </p>
                        </div>
                    </motion.div>

                    {/* Closing Climax / Welcome Callout */}
                    <div className="pt-2 pb-4 space-y-2">
                        <motion.p 
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="font-cinzel font-bold text-xl sm:text-2xl md:text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 drop-shadow-[0_2px_12px_rgba(245,158,11,0.2)]"
                        >
                            Welcome to the fire.
                        </motion.p>
                        <motion.p 
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.85, ease: "easeOut" }}
                            className="font-cinzel font-bold text-xl sm:text-2xl md:text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 drop-shadow-[0_2px_12px_rgba(245,158,11,0.2)]"
                        >
                            Welcome to the Society.
                        </motion.p>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default AboutUsPage;

"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';

const AboutUsPage = () => {
    return (
        <div className="max-w-5xl mx-auto py-24 px-4 text-center text-white flex flex-col items-center min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4">
                    Dead Poets Society
                </h1>
                <h2 className="text-xl md:text-2xl text-gray-400 font-light tracking-wider">
                    Amrita Vishwa Vidyapeetham
                </h2>
            </motion.div>


            {/* Animated Image Section */}
            <motion.div
                className="w-full max-w-4xl mb-16 rounded-xl shadow-2xl overflow-hidden h-64 md:h-96 relative border border-white/10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <Image
                    src="/aboutUs.jpg"
                    alt="About Us"
                    fill
                    className="object-cover transition-transform duration-700"
                />
            </motion.div>


            {/* Text Content Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-gray-300 max-w-4xl mx-auto text-lg md:text-xl leading-relaxed space-y-10"
            >
                <h3 className="text-3xl italic font-serif text-white mb-6 text-center">Who We Are</h3>

                <p className="text-gray-200">
                    We are a collective of <span className="text-white font-medium">poets</span> who believe that words can change the world.
                </p>

                <p className="text-gray-200">
                    Inspired by the spirit of <span className="italic text-white">carpe diem</span>, we gather here to celebrate poetry and prose that stirs the soul.
                    Our society is built on the voices of the unheard, the verses scribbled in margins, and the belief that beauty lies in vulnerability.
                </p>


                <div className="space-y-3 text-gray-200 text-center font-serif text-xl border-y border-white/10 py-8 my-8">
                    <p className="font-medium text-white">This is not just a website.</p>
                    <p>This is a place to remember those who came before us,</p>
                    <p>to give breath to those who have yet to speak,</p>
                    <p>and to make our lives and our words extraordinary.</p>
                </div>

                <p className="text-white font-semibold tracking-wide text-2xl mt-8 text-center bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Welcome to the fire. Welcome to the Society.
                </p>
            </motion.div>

        </div>
    );
};

export default AboutUsPage;

"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';

const AboutUsPage = () => {
    return (
        <div className="max-w-5xl mx-auto py-20 px-4 text-center text-white flex flex-col items-center">
            {/* About Us Image */}
            <motion.div
                className="w-full md:w-2/3 mb-12 rounded-lg shadow-lg overflow-hidden h-80 relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <Image
                    src="/aboutUs.jpg"
                    alt="About Us"
                    fill
                    className="object-cover"
                />
            </motion.div>

            {/* About Us Text */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-gray-400 max-w-2xl mx-auto text-lg leading-8 space-y-8 [text-align:justify]"
            >
                <h2 className="text-4xl italic font-serif text-white mb-8 text-center">Who We Are</h2>

                <p className="text-gray-300">
                    We are a collective of <span className="text-white font-medium">poets</span> who believe that words can change the world.
                </p>

                <p>
                    Inspired by the spirit of <span className="italic text-white">carpe diem</span>, we gather here to celebrate poetry and prose that stirs the soul.
                    Our society is built on the voices of the unheard, the verses scribbled in margins, and the belief that beauty lies in vulnerability.
                </p>

                {/* Center-aligned poetic section */}
                <div className="space-y-2 text-gray-300 text-center">
                    <p className="font-medium text-white">This is not just a website.</p>
                    <p>This is a place to remember those who came before us,</p>
                    <p>to give breath to those who have yet to speak,</p>
                    <p>and to make our lives and our words extraordinary.</p>
                </div>

                <p className="text-white font-semibold tracking-wide text-xl mt-6 text-center">
                    Welcome to the fire. Welcome to the Society.
                </p>
            </motion.div>

        </div>
    );
};

export default AboutUsPage;

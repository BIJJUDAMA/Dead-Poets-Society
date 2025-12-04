import { motion } from 'framer-motion';
import Image from 'next/image';
import '../css/Candle.css';

const CandleAnimation = () => (
    <div className="candle-holder">
        <div className="candle">
            <div className="blinking-glow" />
            <div className="thread" />
            <div className="glow" />
            <div className="flame" />
        </div>
    </div>
);

const HeroSection = () => (
    <section className="relative bg-black flex flex-col items-center justify-center pt-10 pb-20 px-4 min-h-screen">

        {/* This container is now responsive. It stacks vertically by default and becomes a row on medium screens and up. */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* The candle animation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
            >
                <CandleAnimation />
            </motion.div>

            {/* The logo image */}
            <motion.div

                className="mt-[-100px] md:mt-0 z-10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
            >
                <Image src="/DPS1.webp" alt="Logo" width={0} height={0} sizes="100vw" style={{ width: 'auto', height: '192px' }} />
            </motion.div>
        </div>

    </section>
);

export default HeroSection;

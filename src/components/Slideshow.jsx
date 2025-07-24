import { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const slides = [
    {
        desktopImage: "/slideshow1.jpg",
        mobileImage: "/slideshow1-mobile.jpg",
        quote: "No matter what anybody tells you, words and ideas can change the world."
    },
    {
        desktopImage: "/slideshow2.jpg",
        mobileImage: "/slideshow2-mobile.jpg",
        quote: "Carpe diem. Seize the day, boys. Make your lives extraordinary."
    },
    {
        desktopImage: "/slideshow3.jpg",
        mobileImage: "/slideshow3-mobile.jpg",
        quote: "We don't read and write poetry because it's cute. We read and write poetry because we are members of the human race."
    },
    {
        desktopImage: "/slideshow4.jpg",
        mobileImage: "/slideshow4-mobile.jpg",
        quote: "Only in their dreams can men be truly free. 'Twas always thus, and always thus will be."
    },
    {
        desktopImage: "/slideshow5.jpg",
        mobileImage: "/slideshow5-mobile.jpg",
        quote: "This is a battle, a war, and the casualties could be your hearts and souls."
    },
    {
        desktopImage: "/slideshow6.jpg",
        mobileImage: "/slideshow6-mobile.jpg",
        quote: "Sucking the marrow out of life doesn’t mean choking on the bone."
    }
];


const useWindowSize = () => {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
};


const Slideshow = () => {
    const [index, setIndex] = useState(0);
    const [width] = useWindowSize();

    const isMobile = width < 768;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIndex(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearTimeout(timer);
    }, [index]);

    const currentImage = isMobile ? slides[index].mobileImage : slides[index].desktopImage;

    return (
        <div className="w-full h-[60vh] relative overflow-hidden bg-black flex items-center justify-center">
            <AnimatePresence>
                <motion.div
                    key={index}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${currentImage})` }}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/50" />
            <motion.p
                key={slides[index].quote}
                className="relative z-10 text-white text-2xl md:text-3xl text-center italic max-w-4xl px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                "{slides[index].quote}"
            </motion.p>
        </div>
    );
};

export default Slideshow;

import { Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black py-16 px-4 mt-auto flex items-center justify-center">
            <div className="max-w-7xl mx-auto text-center text-gray-400 flex flex-col items-center gap-8">

                <p className="text-lg italic font-serif">"Carpe Diem. Seize the day."</p>

                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-8 sm:gap-16">

                    <div className="flex flex-col items-center text-center gap-2">
                        <p className="font-semibold text-sm text-gray-300">Dead Poets Society</p>
                        <a
                            href="https://www.instagram.com/dead_poets_society_poetree/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-pink-500 transition-colors duration-300"
                            aria-label="Dead Poets Society on Instagram"
                        >
                            <Instagram size={28} />
                        </a>
                        <p className="text-xs text-gray-500 mt-1">@dead_poets_society_poetree</p>
                    </div>

                    <div className="flex flex-col items-center text-center gap-2">
                        <p className="font-semibold text-sm text-gray-300">Srishti</p>
                        <a
                            href="https://www.instagram.com/srishti_amrita/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-pink-500 transition-colors duration-300"
                            aria-label="Srishti on Instagram"
                        >
                            <Instagram size={28} />
                        </a>
                        <p className="text-xs text-gray-500 mt-1">@srishti_amrita</p>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;

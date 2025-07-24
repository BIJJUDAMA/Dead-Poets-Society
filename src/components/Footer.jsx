import { Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black py-10 px-4 mt-auto">
            <div className="max-w-7xl mx-auto text-center text-gray-400 flex flex-col items-center gap-4">

                {/* Carpe Diem Quote */}
                <p className="text-lg italic font-serif">"Carpe Diem. Seize the day."</p>

                {/* Social Links */}
                <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">Find us on</p>
                    <a
                        href="https://www.instagram.com/dead_poets_society_poetree/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-pink-500 transition-colors"
                        aria-label="Instagram"
                    >
                        <Instagram size={24} />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
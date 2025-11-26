import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase/config.js';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, LogIn, Instagram, Github } from 'lucide-react';

const Navbar = () => {
    const { user, userProfile, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    const photoSrc = userProfile?.photo_url || user?.user_metadata?.avatar_url || '/defaultPfp.png';
    const location = useLocation();
    const isEventPage = location.pathname === '/event';

    if (isEventPage) {
        return (
            <nav className="bg-black/80 backdrop-blur-sm sticky top-0 z-50 text-white shadow-lg py-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-32">
                    <div className="flex items-center justify-center h-12">
                        <Link to="/" onClick={closeMenu}>
                            <img src="/DPS.webp" alt="Logo" className="h-10 w-auto" />
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-black/80 backdrop-blur-sm sticky top-0 z-50 text-white shadow-lg py-2">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-64">
                <div className="relative flex items-center justify-between h-20 md:h-24">
                    <Link to="/" onClick={closeMenu} className="md:ml-16 ml-4">
                        <img src="/DPS.webp" alt="Logo" className="h-14 md:h-20 w-auto" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-10 text-xl font-medium">
                        <Link to="/" className="hover:text-yellow-300 transition-colors">Home</Link>
                        <Link to="/poems" className="hover:text-yellow-300 transition-colors">Poems</Link>
                        <Link to="/poets" className="hover:text-yellow-300 transition-colors">Poets</Link>
                        <Link to="/about" className="hover:text-yellow-300 transition-colors">About Us</Link>
                        {user && <Link to="/submit" className="hover:text-yellow-300 transition-colors">Submit</Link>}
                    </div>

                    {/* User/Admin Links on Desktop */}
                    <div className="hidden md:flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                {isAdmin && <Link to="/admin" className="text-sm hover:text-yellow-300 transition-colors">Admin</Link>}
                                <Link to={`/profile/${user.id}`}>
                                    <img src={photoSrc} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-yellow-400" />
                                </Link>
                                <button onClick={handleLogout} title="Logout" className="bg-red-800 p-2 rounded-full hover:bg-red-700">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 bg-[#111827] px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                                <LogIn size={16} /> Login
                            </Link>
                        )}
                        {/* Social Links */}
                        <div className="flex items-center gap-6 ml-4 border-l border-gray-700 pl-6">
                            <a
                                href="https://www.instagram.com/dead_poets_society_poetree/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-pink-500 transition-colors"
                                title="Dead Poets Society Instagram"
                            >
                                <Instagram size={20} />
                                <span className="text-sm font-medium">DPS</span>
                            </a>
                            <a
                                href="https://www.instagram.com/srishti_amrita/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-pink-500 transition-colors"
                                title="Srishti Instagram"
                            >
                                <Instagram size={20} />
                                <span className="text-sm font-medium">Srishti</span>
                            </a>
                            <a
                                href="https://github.com/BIJJUDAMA/Dead-Poets-Society"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-pink-500 transition-colors"
                                title="GitHub Repository"
                            >
                                <Github size={22} />
                            </a>
                        </div>
                    </div>

                    {/* Mobile: Profile Icon + Hamburger Menu Icon */}
                    <div className="md:hidden flex items-center space-x-4">

                        {user && (
                            <Link to={`/profile/${user.id}`} onClick={closeMenu}>
                                <img src={photoSrc} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-yellow-400" />
                            </Link>
                        )}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Hamburger Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-black/95 flex flex-col items-center space-y-6 py-8">
                    <Link to="/" onClick={closeMenu} className="text-xl hover:text-yellow-300">Home</Link>
                    <Link to="/poems" onClick={closeMenu} className="text-xl hover:text-yellow-300">Poems</Link>
                    <Link to="/poets" onClick={closeMenu} className="text-xl hover:text-yellow-300">Poets</Link>
                    <Link to="/about" onClick={closeMenu} className="text-xl hover:text-yellow-300">About Us</Link>

                    <div className="border-t border-gray-700 pt-6 w-full flex flex-col items-center space-y-6">
                        {user ? (
                            <>
                                <Link to="/submit" onClick={closeMenu} className="text-xl hover:text-yellow-300">Submit Poem</Link>
                                {isAdmin && (
                                    <Link to="/admin" onClick={closeMenu} className="text-xl hover:text-yellow-300">Admin</Link>
                                )}
                                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-800 px-4 py-2 rounded-md">
                                    <LogOut size={16} /> Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" onClick={closeMenu} className="flex items-center gap-2 bg-[#111827] px-4 py-2 rounded-md">
                                <LogIn size={16} /> Login
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-6 w-full pb-4">
                        <a
                            href="https://www.instagram.com/dead_poets_society_poetree/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-300 hover:text-pink-500 transition-colors"
                        >
                            <Instagram size={24} />
                            <span className="text-sm font-medium">DPS</span>
                        </a>
                        <a
                            href="https://www.instagram.com/srishti_amrita/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-300 hover:text-pink-500 transition-colors"
                        >
                            <Instagram size={24} />
                            <span className="text-sm font-medium">Srishti</span>
                        </a>
                        <a
                            href="https://github.com/BIJJUDAMA/Dead-Poets-Society"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-pink-500 transition-colors"
                        >
                            <Github size={24} />
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

/**
 * The main navigation bar 
 * 
 * Purpose:
 * - Provides global navigation links
 * - Manages authentication state display (Login vs. User Profile)
 * - Implements a responsive mobile menu
 * - Handles special "PrPage" rendering logic (simplified view)
 * 
 * Used In:
 * - `app/layout.js` (Globally included)
 */

"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../supabase/config.js';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, LogIn, Instagram, Github } from 'lucide-react';

const Navbar = () => {
    const { user, userProfile, isAdmin } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Handles user logout via Supabase
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    const photoSrc = userProfile?.photo_url || user?.user_metadata?.avatar_url || '/defaultPfp.png';
    // Conditional rendering for the dedicated Puzzle (PR) page navbar
    const pathname = usePathname();
    const isPrPage = pathname === '/pr';

    if (isPrPage) {
        return (
            <nav className="bg-black/80 backdrop-blur-sm sticky top-0 z-50 text-white shadow-lg py-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-32">
                    <div className="flex items-center justify-center h-12">
                        <Link href="/" onClick={closeMenu}>
                            <Image src="/DPS.webp" alt="Logo" width={40} height={40} className="h-10 w-auto" />
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    /**
     * Standard Navbar Render:
     * Includes Logo, Desktop Links, Auth Controls, and Mobile Toggle
     */

    return (
        <nav className="bg-black/80 backdrop-blur-sm sticky top-0 z-50 text-white shadow-lg py-2">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-32 xl:px-64">
                <div className="relative flex items-center justify-between h-20 md:h-24">
                    <Link href="/" onClick={closeMenu} className="md:ml-16 ml-4">
                        <Image src="/DPS.webp" alt="Logo" width={80} height={80} className="h-14 md:h-20 w-auto" />
                    </Link>


                    {/* Desktop Navigation Links */}
                    {/* Doesn't include the insteagram and github links due to cramping*/}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-10 text-xl font-medium">
                        <Link href="/" className="hover:text-yellow-300 transition-colors">Home</Link>
                        <Link href="/poems" className="hover:text-yellow-300 transition-colors">Poems</Link>
                        <Link href="/poets" className="hover:text-yellow-300 transition-colors">Poets</Link>
                        <Link href="/event" className="hover:text-yellow-300 transition-colors">Events</Link>
                        <Link href="/about" className="hover:text-yellow-300 transition-colors">About Us</Link>
                        {user && <Link href="/submit" className="hover:text-yellow-300 transition-colors">Submit</Link>}
                    </div>


                    <div className="hidden md:flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-3">
                                {isAdmin && <Link href="/admin" className="text-sm hover:text-yellow-300 transition-colors">Admin</Link>}
                                <Link href={`/profile/${user.id}`}>
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-yellow-400">
                                        <Image src={photoSrc} alt="Profile" fill className="object-cover" />
                                    </div>
                                </Link>
                                <button onClick={handleLogout} title="Logout" className="bg-red-800 p-2 rounded-full hover:bg-red-700">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 bg-[#111827] px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                                <LogIn size={16} /> Login
                            </Link>
                        )}

                    </div>


                    {/* Mobile Menu Button & Profile Icon */}
                    <div className="md:hidden flex items-center space-x-4">

                        {user && (
                            <Link href={`/profile/${user.id}`} onClick={closeMenu}>
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-yellow-400">
                                    <Image src={photoSrc} alt="Profile" fill className="object-cover" />
                                </div>
                            </Link>
                        )}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navbar */}
            {/* Includes and instagram and github links */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-black/95 flex flex-col items-center space-y-6 py-8">
                    <Link href="/" onClick={closeMenu} className="text-xl hover:text-yellow-300">Home</Link>
                    <Link href="/poems" onClick={closeMenu} className="text-xl hover:text-yellow-300">Poems</Link>
                    <Link href="/poets" onClick={closeMenu} className="text-xl hover:text-yellow-300">Poets</Link>
                    <Link href="/event" onClick={closeMenu} className="text-xl hover:text-yellow-300">Events</Link>
                    <Link href="/about" onClick={closeMenu} className="text-xl hover:text-yellow-300">About Us</Link>

                    <div className="border-t border-gray-700 pt-6 w-full flex flex-col items-center space-y-6">
                        {user ? (
                            <>
                                <Link href="/submit" onClick={closeMenu} className="text-xl hover:text-yellow-300">Submit Poem</Link>
                                {isAdmin && (
                                    <Link href="/admin" onClick={closeMenu} className="text-xl hover:text-yellow-300">Admin</Link>
                                )}
                                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-800 px-4 py-2 rounded-md">
                                    <LogOut size={16} /> Logout
                                </button>
                            </>
                        ) : (
                            <Link href="/login" onClick={closeMenu} className="flex items-center gap-2 bg-[#111827] px-4 py-2 rounded-md">
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

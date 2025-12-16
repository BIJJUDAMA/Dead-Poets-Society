import { Cinzel, Homemade_Apple } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProfileGuard from '@/components/auth/ProfileGuard';
import { SpeedInsights } from "@vercel/speed-insights/next";

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '500', '600', '700', '800', '900'] });
const homemadeApple = Homemade_Apple({ weight: '400', subsets: ['latin'], variable: '--font-homemade-apple' });

export const metadata = {
    title: "Dead Poet's Society",
    description: "Carpe Diem. Seize the day.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${cinzel.variable} ${homemadeApple.variable} font-serif bg-black text-gray-200 flex flex-col min-h-screen`}>
                <AuthProvider>
                    <ProfileGuard />
                    <Navbar />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                    <SpeedInsights />
                </AuthProvider>
            </body>
        </html>
    );
}

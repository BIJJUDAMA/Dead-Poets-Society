"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-black text-white text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl"
      >
        <span className="text-sm uppercase tracking-[0.3em] text-yellow-500/80 mb-4 block font-serif">
          Verse Not Found
        </span>

        <h1 className="text-8xl md:text-9xl font-bold font-cinzel mb-8 text-white/90">
          404
        </h1>

        <div className="mb-12 relative">
          <p className="text-2xl md:text-3xl font-homemade-apple text-gray-400 italic leading-relaxed">
            "Not all those who wander are lost."
          </p>
          <span className="text-xs uppercase tracking-widest text-gray-500 mt-4 block">
            — J.R.R. Tolkien
          </span>
        </div>

        <p className="text-gray-400 mb-12 max-w-md mx-auto leading-relaxed">
          It seems you have strayed from the path. This corner of the society is yet to be written.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/poems">
            <motion.div
              whileHover={{ scale: 1.0 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-medium transition-colors hover:bg-yellow-400"
            >
              <ArrowLeft size={18} />
              Return to Collection
            </motion.div>
          </Link>

          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.0 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 border border-white/20 px-8 py-3 rounded-full font-medium transition-colors hover:bg-white/10"
            >
              <Home size={18} />
              Home
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Decorative "ink drop" effect or subtle background element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  )
}

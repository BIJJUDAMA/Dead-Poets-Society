import SkeletonCard from '@/components/common/SkeletonCard';

export default function Loading() {
    return (
        <div className="pt-12 pb-20 bg-black text-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-5xl font-bold text-white text-center md:text-left">The Collection</h1>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="h-10 w-full sm:w-64 rounded-md bg-white/10 animate-pulse" />
                        <div className="h-10 w-full sm:w-[180px] rounded-md bg-white/10 animate-pulse" />
                        <div className="h-10 w-full sm:w-40 rounded-md bg-white/10 animate-pulse" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}
                </div>
            </div>
        </div>
    );
}

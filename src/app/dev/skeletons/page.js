import { notFound } from 'next/navigation';
import NoteCard from '@/components/poems/NoteCard';
import { mockNote, mockNotes } from '@/lib/boneyard-fixtures';

export const metadata = {
    title: 'Skeleton Preview | Dead Poets Society',
};

export default function SkeletonPreviewPage() {
    if (process.env.NODE_ENV === 'production') {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white px-4 py-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-3">Development Only</p>
                    <h1 className="text-4xl md:text-5xl font-bold font-cinzel">Boneyard Skeleton Preview</h1>
                    <p className="text-white/70 mt-3 max-w-2xl">
                        This route is intentionally disabled in production. Use it to inspect the generated note-card skeleton without racing the real loading state.
                    </p>
                </div>

                <section className="mb-14">
                    <h2 className="text-2xl font-semibold mb-6">Single Card</h2>
                    <div className="max-w-[280px]">
                        <NoteCard note={mockNote} loading={true} />
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-6">Grid Preview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {mockNotes.map((note) => (
                            <NoteCard key={note.id} note={note} loading={true} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

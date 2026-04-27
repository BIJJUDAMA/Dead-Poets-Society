import { supabase } from '@/supabase/config';
import NotePage from '@/views/NotePage';

export const revalidate = 60;

export async function generateMetadata({ params }) {
    const { id } = await params;
    const { data: note } = await supabase
        .from('notes')
        .select('title, preview, poet_name')
        .eq('id', id)
        .single();

    if (!note) {
        return {
            title: 'Poem Not Found | Dead Poets Society',
            description: 'The requested poem could not be found.',
        };
    }

    const title = `${note.title} by ${note.poet_name || 'Anonymous'} | Dead Poets Society`;
    const description = note.preview ? `"${note.preview}" - Read the full poem on Dead Poets Society.` : 'Read this poem on Dead Poets Society.';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default async function Page({ params }) {
    const { id } = await params;

    let note = null;
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .single();

        if (!error) {
            note = data;
        }
    } catch (error) {
        console.error("Error fetching note:", error);
    }

    return <NotePage initialNote={note} />;
}

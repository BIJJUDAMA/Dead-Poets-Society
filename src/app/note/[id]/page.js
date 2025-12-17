import { supabase } from '@/supabase/config';
import NotePage from '@/views/NotePage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const { data: note } = await supabase
        .from('notes')
        .select('title, preview')
        .eq('id', id)
        .single();

    if (!note) {
        return {
            title: 'Poem Not Found | Dead Poets Society',
            description: 'The requested poem could not be found.',
        };
    }

    return {
        title: `${note.title} | Dead Poets Society`,
        description: note.preview || 'Read this poem on Dead Poets Society.',
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

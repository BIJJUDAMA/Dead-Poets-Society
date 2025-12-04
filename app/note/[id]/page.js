import { supabase } from '@/supabase/config';
import NotePage from '@/views/NotePage';

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

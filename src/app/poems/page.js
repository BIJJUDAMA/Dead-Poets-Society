import { supabase } from '@/supabase/config';
import PoemsPage from '@/views/PoemsPage';

export const revalidate = 0; // Disable static optimization for real-time data

export default async function Page() {
    let initialNotes = [];
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false })
            .range(0, 7); // PAGE_SIZE is 8

        if (!error) {
            initialNotes = data;
        }
    } catch (error) {
        console.error("Error fetching poems:", error);
    }

    return <PoemsPage initialNotes={initialNotes} />;
}

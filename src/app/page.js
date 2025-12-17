import HomePage from '@/views/HomePage';
import { supabase } from '@/supabase/config';

export const revalidate = 3600; // ISR: Revalidate every 1 hour

export default async function Page() {
    const [mostApplaudedResult, recentPoemsResult] = await Promise.all([
        supabase
            .from('notes')
            .select('*')
            .order('applause_count', { ascending: false })
            .limit(4),
        supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(8)
    ]);

    const mostApplauded = mostApplaudedResult.data || [];
    const recentPoems = recentPoemsResult.data || [];

    return <HomePage initialMostApplauded={mostApplauded} initialRecentPoems={recentPoems} />;
}

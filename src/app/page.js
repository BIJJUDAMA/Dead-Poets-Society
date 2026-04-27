import HomePage from '@/views/HomePage';
import { supabase } from '@/supabase/config';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Dead Poet's Society | Amrita Vishwa Vidyapeetham",
    description: "Welcome to the Dead Poet's Society at Amrita Vishwa Vidyapeetham. A safe haven for poets, writers, and dreamers. Carpe Diem. Seize the day.",
    openGraph: {
        title: "Dead Poet's Society | Amrita Vishwa Vidyapeetham",
        description: "Welcome to the Dead Poet's Society at Amrita Vishwa Vidyapeetham. A safe haven for poets, writers, and dreamers.",
    }
};

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

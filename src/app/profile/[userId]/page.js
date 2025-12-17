import { supabase } from '@/supabase/config';
import ProfilePage from '@/views/ProfilePage';

export async function generateMetadata({ params }) {
    const { userId } = await params;
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single();

    return {
        title: profile ? `${profile.display_name} | Dead Poets Society` : 'Profile Not Found',
    };
}

export default async function Page({ params }) {
    const { userId } = await params;

    // Fetch profile and poems in parallel
    const [profileResult, poemsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    const profileData = profileResult.data || null;
    const poems = poemsResult.data || [];

    return <ProfilePage initialProfile={profileData} initialPoems={poems} />;
}

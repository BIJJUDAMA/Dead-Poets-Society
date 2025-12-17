import UsersPage from '@/views/UsersPage';
import { supabase } from '@/supabase/config';

export const revalidate = 3600; // ISR: Revalidate every 1 hour

export default async function Page() {
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .not('display_name', 'is', null);

    if (error) {
        console.error("Error fetching users:", error);
    }

    return <UsersPage initialUsers={users || []} />;
}

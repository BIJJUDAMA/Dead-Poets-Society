import UsersPage from '@/views/UsersPage';
import { supabase } from '@/supabase/config';

export const dynamic = 'force-dynamic';

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

import UsersPage from '@/views/UsersPage';
import { supabase } from '@/supabase/config';

export const revalidate = 3600;

export default async function Page() {
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .not('display_name', 'is', null);

    return <UsersPage initialUsers={users || []} />;
}

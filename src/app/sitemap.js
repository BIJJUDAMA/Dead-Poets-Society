import { supabase } from '@/supabase/config';
import { eventDb } from '@/data/eventDb';

export default async function sitemap() {
    const baseUrl = 'https://dps.vercel.app';

    // 1. Static Routes
    const routes = ['', '/poems', '/events', '/about'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: route === '' ? 'weekly' : 'daily',
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Fetch dynamic Poems
    let poems = [];
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('id, created_at');
        
        if (!error && data) {
            poems = data.map((poem) => ({
                url: `${baseUrl}/note/${poem.id}`,
                lastModified: poem.created_at || new Date().toISOString(),
                changeFrequency: 'weekly',
                priority: 0.6,
            }));
        }
    } catch (e) {
        console.error("Sitemap generation error (poems):", e);
    }

    // 3. Fetch dynamic Events (from local JS object)
    const events = Object.keys(eventDb).map((slug) => ({
        url: `${baseUrl}/event/${slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [...routes, ...events, ...poems];
}

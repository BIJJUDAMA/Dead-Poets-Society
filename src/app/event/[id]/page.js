import EventDetailPage from '@/views/EventDetailPage';
import { eventDb } from '@/data/eventDb';

export async function generateStaticParams() {
    return Object.keys(eventDb).map((slug) => ({
        id: slug,
    }));
}

export default async function Page({ params }) {
    const { id } = await params;
    const event = eventDb[id];
    return <EventDetailPage event={event} />;
}

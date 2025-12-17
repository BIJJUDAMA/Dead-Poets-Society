import EventPage from '@/views/EventPage';
import { eventDb } from '@/data/eventDb';

export default function Page() {
    const eventsList = Object.entries(eventDb).map(([slug, event]) => ({
        slug,
        ...event
    }));

    return <EventPage eventsList={eventsList} />;
}

import EventDetailPage from '@/views/EventDetailPage';
import { eventDb } from '@/data/eventDb';

export async function generateStaticParams() {
    return Object.keys(eventDb).map((slug) => ({
        id: slug,
    }));
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const event = eventDb[id];

    if (!event) {
        return {
            title: 'Event Not Found | Dead Poets Society',
            description: 'The requested event could not be found.',
        };
    }

    const title = `${event.name} | Dead Poets Society`;
    const description = event.report ? event.report.substring(0, 160) + '...' : `Join us for ${event.name} at Dead Poets Society.`;
    const image = event.poster || event.mainImage || '/og-defaultpng.png';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [image],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}

export default async function Page({ params }) {
    const { id } = await params;
    const event = eventDb[id];
    return <EventDetailPage event={event} />;
}

import EventDetailPage from '@/views/EventDetailPage';

export default async function Page({ params }) {
    const { id } = await params;
    return <EventDetailPage id={id} />;
}

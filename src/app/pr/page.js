"use client";
import dynamic from 'next/dynamic';

const PrPage = dynamic(() => import('@/views/PrPage'), { ssr: false });

export default function Page() {
    return <PrPage />;
}

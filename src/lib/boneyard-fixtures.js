export const mockNote = {
    id: 'boneyard-note',
    title: 'Midnight Letters to the Rain',
    poet_name: 'A. Poet',
    preview: 'The windows keep their silver hush while the city trades its noise for a softer, slower breathing dark.',
};

export const mockNotes = Array.from({ length: 8 }, (_, index) => ({
    ...mockNote,
    id: `boneyard-note-${index + 1}`,
}));

export const mockEvent = {
    slug: 'mock-event',
    name: 'A Beautiful Poetry Event',
    displayDate: '1st January 2026',
    venue: 'The Grand Hall',
    report: 'This is a beautifully long description of a poetry event that happened once upon a time. It explores themes of existence and identity, bringing together poets from all over.',
    mainImage: '/postIt.png', 
};

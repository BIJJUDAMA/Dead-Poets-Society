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

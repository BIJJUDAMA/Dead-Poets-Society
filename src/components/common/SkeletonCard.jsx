import { mockNote } from '@/lib/boneyard-fixtures';
import NoteCard from '@/components/poems/NoteCard';

const SkeletonCard = () => (
    <NoteCard note={mockNote} loading={true} />
);

export default SkeletonCard;

/**
 * A modal dialog that displays a list of users (Followers or Following)
 * 
 * Purpose:
 * - Shows a scrollable list of user avatars and display names
 * - Fetches user details dynamically based on a passed array of `userIds`
 * - Navigates to the selected user's profile upon click
 * 
 * Used In:
 * - `src/views/ProfilePage.jsx`
 */

"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/config.js';
import Link from 'next/link';
import Image from 'next/image';
import Modal from './Modal';

const FollowListModal = ({ title, userIds, onClose }) => {
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user profiles for the list of IDs
        const fetchUsers = async () => {
            if (!userIds || userIds.length === 0) {
                setUserList([]);
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', userIds);

                if (error) throw error;
                setUserList(data);
            } catch (error) {
                console.error("Error fetching user list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [userIds]);

    return (
        <Modal onClose={onClose}>
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            {loading ? <p>Loading...</p> : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {userList.length > 0 ? userList.map(user => (
                        <Link href={`/profile/${user.id}`} onClick={onClose} key={user.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700">

                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                <Image src={user.photo_url || '/defaultPfp.png'} alt={user.display_name} fill className="object-cover" />
                            </div>
                            <span className="font-bold">{user.display_name}</span>
                        </Link>
                    )) : <p className="text-gray-400">No users to display.</p>}
                </div>
            )}
        </Modal>
    );
};

export default FollowListModal;

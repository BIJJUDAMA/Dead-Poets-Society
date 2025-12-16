/**
 * A set of buttons for sharing content. currently only supports "Copy Link"
 * 
 * Purpose:
 * - Allows users to easily copy the URL of a poem to their clipboard
 * - Provides visual feedback ("Copied!" vs "Failed!") upon action
 * 
 * Used In:
 * - `src/views/NotePage.jsx`
 */

"use client";
import { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';

const SocialShareButtons = ({ url }) => {
    const [copySuccess, setCopySuccess] = useState('');

    // Copies the standard URL to clipboard
    const handleCopy = () => {

        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="flex items-center gap-4">
            <p className="text-sm font-bold text-white">Share:</p>
            <button onClick={handleCopy} className="text-gray-400 hover:text-white" aria-label="Copy link">
                {copySuccess ? <span className="text-xs">{copySuccess}</span> : <LinkIcon />}
            </button>
        </div>
    );
};

export default SocialShareButtons;

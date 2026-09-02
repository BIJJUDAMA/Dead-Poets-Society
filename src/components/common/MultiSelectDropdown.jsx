/**
 * A versatile UI component for selecting multiple tags/options
 * 
 * Purpose:
 * - Provides a searchable dropdown interface
 * - Supports adding/removing tags via checkbox or direct click
 * - Adapts to Mobile/Desktop views (Inline dropdown vs. Bottom sheet)
 * - Closes automatically when clicking outside
 * 
 * Used In:
 * - `src/views/PoemsPage.jsx` (Filtering poems)
 * - `src/views/SubmitPage.jsx` (Tagging new submissions)
 */

"use client";
import * as React from 'react';
import { X, Check } from 'lucide-react';

// Custom hook for responsive media queries
const useMediaQuery = (query) => {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);

    return matches;
};

const MultiSelectDropdown = ({
    options,
    selectedOptions,
    onSelectionChange,
    title = 'Select Tags',
}) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const dropdownRef = React.useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Toggle selection of an option
    const handleSelect = (option) => {
        const newSelection = selectedOptions.includes(option)
            ? selectedOptions.filter((item) => item !== option)
            : [...selectedOptions, option];
        onSelectionChange(newSelection);
    };

    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const triggerButton = (
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="border border-stone-800 p-2.5 rounded-xl min-h-[44px] w-full flex items-center justify-start flex-wrap gap-2 cursor-pointer bg-stone-900/90 hover:bg-stone-900 text-stone-100 transition-colors"
        >
            {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                    <div
                        key={option}
                        className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-600/50 text-amber-200 rounded-full px-3 py-1 text-xs font-serif italic"
                    >
                        <span>{option}</span>
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(option);
                            }}
                            className="rounded-full hover:bg-red-500/20 p-0.5 cursor-pointer text-amber-400 hover:text-red-400"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    </div>
                ))
            ) : (
                <span className="text-stone-500 px-2 text-sm">{title}</span>
            )}
        </button>
    );


    const dropdownContent = (
        <div className="flex flex-col w-full bg-stone-950 border border-stone-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-stone-800/80">
                <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                />
            </div>
            <ul className="flex flex-col p-2 max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="flex items-center p-2 rounded-lg hover:bg-stone-900 cursor-pointer text-stone-200 font-serif italic text-sm transition-colors"
                        >
                            <div
                                className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${selectedOptions.includes(option)
                                    ? 'border-amber-500 bg-amber-500'
                                    : 'border-stone-700 bg-stone-900'
                                    }`}
                            >
                                {selectedOptions.includes(option) && <Check className="h-3 w-3 text-stone-950" />}
                            </div>
                            <span>{option}</span>
                        </li>
                    ))
                ) : (
                    <li className="p-2 text-stone-500 text-center text-sm font-serif italic">No tags found.</li>
                )}
            </ul>
        </div>
    );

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {triggerButton}
            {isOpen && (
                isDesktop ? (
                    <div className="absolute top-full left-0 mt-2 w-full z-50">
                        {dropdownContent}
                    </div>
                ) : (

                    <>
                        <div
                            className="fixed inset-0 bg-black/60 z-40"
                            onClick={() => setIsOpen(false)}
                        ></div>
                        <div className="fixed bottom-0 left-0 w-full p-4 z-50">
                            {dropdownContent}
                        </div>
                    </>
                )
            )}
        </div>
    );
};

export default MultiSelectDropdown;

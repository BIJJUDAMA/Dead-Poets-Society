"use client";
import * as React from 'react';
import { X, Check } from 'lucide-react';

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
            className="border border-gray-600 p-2 rounded-md min-h-[40px] w-full flex items-center justify-start flex-wrap gap-2 cursor-pointer bg-gray-900 text-white"
        >
            {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                    <div
                        key={option}
                        className="flex items-center gap-1.5 bg-gray-700 text-gray-100 rounded-full px-2.5 py-1 text-sm font-medium"
                    >
                        {option}
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(option);
                            }}
                            className="rounded-full hover:bg-red-500/20 p-0.5 cursor-pointer"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    </div>
                ))
            ) : (
                <span className="text-gray-400 px-2">{title}</span>
            )}
        </button>
    );


    const dropdownContent = (
        <div className="flex flex-col w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
            <div className="p-2">
                <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
            </div>
            <ul className="flex flex-col p-2 max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="flex items-center p-2 rounded-md hover:bg-gray-700 cursor-pointer text-white"
                        >
                            <div
                                className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border-2 ${selectedOptions.includes(option)
                                    ? 'border-yellow-500 bg-yellow-500'
                                    : 'border-gray-500'
                                    }`}
                            >
                                {selectedOptions.includes(option) && <Check className="h-3 w-3 text-black" />}
                            </div>
                            <span>{option}</span>
                        </li>
                    ))
                ) : (
                    <li className="p-2 text-gray-400 text-center">No results found.</li>
                )}
            </ul>
        </div>
    );

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {triggerButton}
            {isOpen && (
                isDesktop ? (
                    <div className="absolute top-full left-0 mt-2 w-full z-10">
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

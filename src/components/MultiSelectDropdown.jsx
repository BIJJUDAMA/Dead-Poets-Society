import * as React from 'react';
import { X, CheckIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandInput,
    CommandList,
    CommandEmpty,
} from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';


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

    const handleSelect = (option) => {
        const newSelection = selectedOptions.includes(option)
            ? selectedOptions.filter((item) => item !== option)
            : [...selectedOptions, option];
        onSelectionChange(newSelection);
    };


    const componentContent = (
        <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    {options.map((option) => (
                        <CommandItem
                            key={option}
                            onSelect={() => handleSelect(option)}
                            className="cursor-pointer"
                        >
                            <div
                                className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${selectedOptions.includes(option)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'opacity-50 [&_svg]:invisible'
                                    }`}
                            >
                                <CheckIcon className="h-4 w-4" />
                            </div>
                            <span>{option}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );


    const triggerButton = (
        <div className="border p-2 rounded-md min-h-[40px] w-full flex items-center justify-start flex-wrap gap-2 cursor-pointer">
            {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                    <Badge
                        key={option}
                        variant="secondary"
                        className="flex items-center gap-1"
                    >
                        {option}
                        <button
                            aria-label={`Remove ${option}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(option);
                            }}
                            className="rounded-full hover:bg-destructive/50 p-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))
            ) : (
                <span className="text-muted-foreground px-2">{title}</span>
            )}
        </div>
    );


    if (isDesktop) {
        return (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="h-auto w-full p-0">
                        {triggerButton}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                >
                    {componentContent}
                </PopoverContent>
            </Popover>
        );
    }


    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" className="h-auto w-full p-0">
                    {triggerButton}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">{componentContent}</div>
            </DrawerContent>
        </Drawer>
    );
};

export default MultiSelectDropdown;

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tag } from "lucide-react"

const MultiSelectDropdown = ({ options, selectedOptions, onSelectionChange, title = "Select Tags" }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Tag className="mr-2 h-4 w-4" />
                    {title} {selectedOptions.length > 0 && `(${selectedOptions.length})`}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700 text-white">
                <DropdownMenuLabel>{title}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.map(option => (
                    <DropdownMenuCheckboxItem
                        key={option}
                        checked={selectedOptions.includes(option)}
                        onCheckedChange={() => {
                            onSelectionChange(prev =>
                                prev.includes(option)
                                    ? prev.filter(item => item !== option)
                                    : [...prev, option]
                            )
                        }}

                        onSelect={(e) => e.preventDefault()}
                    >
                        {option}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default MultiSelectDropdown;

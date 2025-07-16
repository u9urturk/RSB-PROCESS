import { Search, Plus } from "lucide-react";
import { GenericSearchBarProps } from "../types";

const GenericSearchBar: React.FC<GenericSearchBarProps> = ({
    value,
    onChange,
    onAddClick,
    placeholder = "Ara...",
    addButton = { show: false, text: "Ekle", icon: <Plus size={18} /> },
    inputProps = {},
    containerClass = "",
    inputClass = "",
    buttonClass = "",
}) => {
    return (
        <div className={`flex items-center gap-2 ${containerClass}`}>
            <div className="relative flex-1">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`
                        w-full pl-9 pr-4 py-2 
                        bg-gray-100 rounded-lg
                        text-sm outline-none
                        transition-all duration-200
                        focus:bg-white focus:ring-2 focus:ring-orange-200
                        ${inputClass}
                    `}
                    {...inputProps}
                />
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
            </div>
            {addButton.show && (
                <button
                    onClick={onAddClick}
                    className={`
                        px-3 py-2 
                        bg-orange-500 
                        text-white 
                        rounded-lg 
                        flex items-center gap-1
                        text-sm font-medium
                        transition-all duration-200
                        hover:bg-orange-600
                        active:bg-orange-700
                        ${buttonClass}
                    `}
                >
                    {addButton.icon}
                    {addButton.text}
                </button>
            )}
        </div>
    );
};

export default GenericSearchBar;

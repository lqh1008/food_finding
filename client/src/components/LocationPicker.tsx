import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@heroui/react";

interface LocationPickerProps {
    onLocationSelect: (location: string) => void;
    defaultValue?: string;
}

declare global {
    interface Window {
        AMap: any;
    }
}

export default function LocationPicker({ onLocationSelect, defaultValue = '' }: LocationPickerProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const autoCompleteRef = useRef<any>(null);

    useEffect(() => {
        if (window.AMap) {
            window.AMap.plugin('AMap.Autocomplete', function () {
                autoCompleteRef.current = new window.AMap.Autocomplete({
                    // city: '全国'
                });
            });
        }
    }, []);

    const handleSearch = (value: string) => {
        setInputValue(value);
        onLocationSelect(value); // Allow manual entry

        if (value && autoCompleteRef.current) {
            autoCompleteRef.current.search(value, (status: string, result: any) => {
                if (status === 'complete' && result.tips) {
                    setSuggestions(result.tips);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            });
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelect = (item: any) => {
        const locationName = item.name;
        setInputValue(locationName);
        onLocationSelect(locationName);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <Input
                label="Location"
                placeholder="Search for a place"
                variant="bordered"
                value={inputValue}
                onValueChange={handleSearch}
                ref={inputRef}
                autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((item, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                            onClick={() => handleSelect(item)}
                        >
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.district}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import * as React from 'react';
import { useState } from 'react';
import { Check, ChevronsUpDown, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Country } from 'country-state-city';

type CountrySearchProps = {
  value?: string;
  onSelect: (country: string | null) => void;
  placeholder?: string;
};

type CountryOption = {
  value: string;
  label: string;
  name: string;
  flag: string;
};

export default function CountrySearch({
  value,
  onSelect,
  placeholder = 'Select country...',
}: CountrySearchProps) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(value || '');

  // Get all countries
  const countries: CountryOption[] = React.useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      value: country.name,
      label: `${country.flag} ${country.name}`,
      name: country.name,
      flag: country.flag,
    }));
  }, []);

  const handleSelect = (countryName: string) => {
    setSelectedCountry(countryName);
    setOpen(false);
    onSelect(countryName);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCountry('');
    onSelect(null);
  };

  const selectedCountryLabel = countries.find(
    (c) => c.name === selectedCountry
  )?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Globe className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {selectedCountryLabel || placeholder}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {selectedCountry && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.value}
                  onSelect={() => handleSelect(country.name)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedCountry === country.name
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {country.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

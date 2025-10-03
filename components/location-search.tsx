'use client';

import * as React from 'react';
import { useState } from 'react';
import { Check, ChevronsUpDown, MapPin, X } from 'lucide-react';
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
import { Country, State, City } from 'country-state-city';

type LocationSearchProps = {
  value?: string;
  onSelect: (
    location: { city?: string; country?: string; display: string } | null
  ) => void;
  placeholder?: string;
};

type LocationOption = {
  value: string;
  label: string;
  city?: string;
  country: string;
  countryCode: string;
  stateCode?: string;
};

export default function LocationSearch({
  value,
  onSelect,
  placeholder = 'Search location...',
}: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>(value || '');

  // Generate location options (countries and major cities)
  const getLocationOptions = (search: string): LocationOption[] => {
    if (!search || search.length < 2) return [];

    const searchLower = search.toLowerCase();
    const options: LocationOption[] = [];
    const maxResults = 50;

    // Get all countries
    const countries = Country.getAllCountries();

    // Search countries
    countries.forEach((country) => {
      if (options.length >= maxResults) return;

      if (country.name.toLowerCase().includes(searchLower)) {
        options.push({
          value: `country-${country.isoCode}`,
          label: `${country.flag} ${country.name}`,
          country: country.name,
          countryCode: country.isoCode,
        });
      }
    });

    // Search cities
    countries.forEach((country) => {
      if (options.length >= maxResults) return;

      const cities = City.getCitiesOfCountry(country.isoCode);

      cities?.forEach((city) => {
        if (options.length >= maxResults) return;

        if (city.name.toLowerCase().includes(searchLower)) {
          const state = city.stateCode
            ? State.getStateByCodeAndCountry(city.stateCode, country.isoCode)
            : null;
          const locationParts = [city.name];
          if (state) locationParts.push(state.name);
          locationParts.push(country.name);

          options.push({
            value: `city-${city.name}-${country.isoCode}`,
            label: `${country.flag} ${locationParts.join(', ')}`,
            city: city.name,
            country: country.name,
            countryCode: country.isoCode,
            stateCode: city.stateCode,
          });
        }
      });
    });

    return options;
  };

  const locationOptions = React.useMemo(
    () => getLocationOptions(searchValue),
    [searchValue]
  );

  const handleSelect = (option: LocationOption) => {
    setSelectedLocation(option.label);
    setOpen(false);

    onSelect({
      city: option.city,
      country: option.country,
      display: option.label,
    });
  };

  const handleClear = () => {
    setSelectedLocation('');
    setSearchValue('');
    onSelect(null);
  };

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
            <MapPin className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">{selectedLocation || placeholder}</span>
          </div>
          <div className="flex items-center gap-1">
            {selectedLocation && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {searchValue.length < 2 ? (
              <CommandEmpty>
                Type at least 2 characters to search...
              </CommandEmpty>
            ) : locationOptions.length === 0 ? (
              <CommandEmpty>No location found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {locationOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedLocation === option.label
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

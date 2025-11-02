import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  TrendingUp,
  SortAsc,
  SortDesc,
  Calendar,
  Star
} from 'lucide-react';
import { useDebounce } from '../../utils/search';

interface SearchFilter {
  field: string;
  operator: string;
  value: any;
  label: string;
}

interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

interface AdvancedSearchBarProps {
  onSearch: (query: string, filters: SearchFilter[], sort?: SortOption) => void;
  onClear?: () => void;
  placeholder?: string;
  searchHistory?: string[];
  suggestions?: string[];
  availableFilters?: {
    field: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number' | 'checkbox';
    options?: { value: string; label: string }[];
  }[];
  availableSorts?: SortOption[];
  showSearchHistory?: boolean;
  showSuggestions?: boolean;
  debounceMs?: number;
}

export function AdvancedSearchBar({
  onSearch,
  onClear,
  placeholder = "Search...",
  searchHistory = [],
  suggestions = [],
  availableFilters = [],
  availableSorts = [],
  showSearchHistory = true,
  showSuggestions = true,
  debounceMs = 300
}: AdvancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [activeSort, setActiveSort] = useState<SortOption | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (debouncedQuery || filters.length > 0 || activeSort) {
      onSearch(debouncedQuery, filters, activeSort);
    }
  }, [debouncedQuery, filters, activeSort]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowDropdown(value.length > 0);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    if (query.length > 0 || searchHistory.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for click events
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const dropdownItems = getDropdownItems();
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, dropdownItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && dropdownItems[focusedIndex]) {
        handleSelectItem(dropdownItems[focusedIndex]);
      } else {
        setShowDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setFocusedIndex(-1);
    }
  };

  const getDropdownItems = () => {
    const items = [];
    
    if (showSuggestions && suggestions.length > 0) {
      items.push(...suggestions.map(s => ({ type: 'suggestion', value: s })));
    }
    
    if (showSearchHistory && searchHistory.length > 0 && query.length === 0) {
      items.push(...searchHistory.map(h => ({ type: 'history', value: h })));
    }
    
    return items;
  };

  const handleSelectItem = (item: { type: string; value: string }) => {
    setQuery(item.value);
    setShowDropdown(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const addFilter = (field: string, operator: string, value: any, label: string) => {
    const newFilter: SearchFilter = { field, operator, value, label };
    setFilters(prev => [...prev.filter(f => f.field !== field), newFilter]);
  };

  const removeFilter = (field: string) => {
    setFilters(prev => prev.filter(f => f.field !== field));
  };

  const clearAll = () => {
    setQuery('');
    setFilters([]);
    setActiveSort(undefined);
    onClear?.();
  };

  const renderFilterControl = (filterConfig: any) => {
    const currentFilter = filters.find(f => f.field === filterConfig.field);
    
    switch (filterConfig.type) {
      case 'select':
        return (
          <Select
            value={currentFilter?.value || ''}
            onValueChange={(value) => {
              if (value) {
                const option = filterConfig.options?.find((o: any) => o.value === value);
                addFilter(filterConfig.field, 'equals', value, `${filterConfig.label}: ${option?.label}`);
              } else {
                removeFilter(filterConfig.field);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${filterConfig.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {filterConfig.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={currentFilter?.value || ''}
            onChange={(e) => {
              if (e.target.value) {
                addFilter(filterConfig.field, 'equals', e.target.value, `${filterConfig.label}: ${e.target.value}`);
              } else {
                removeFilter(filterConfig.field);
              }
            }}
          />
        );
      
      case 'number':
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={currentFilter?.value?.[0] || ''}
              onChange={(e) => {
                const min = e.target.value;
                const max = currentFilter?.value?.[1] || '';
                if (min || max) {
                  addFilter(filterConfig.field, 'between', [min, max], `${filterConfig.label}: ${min}-${max}`);
                } else {
                  removeFilter(filterConfig.field);
                }
              }}
            />
            <Input
              type="number"
              placeholder="Max"
              value={currentFilter?.value?.[1] || ''}
              onChange={(e) => {
                const max = e.target.value;
                const min = currentFilter?.value?.[0] || '';
                if (min || max) {
                  addFilter(filterConfig.field, 'between', [min, max], `${filterConfig.label}: ${min}-${max}`);
                } else {
                  removeFilter(filterConfig.field);
                }
              }}
            />
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {filterConfig.options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${filterConfig.field}-${option.value}`}
                  checked={currentFilter?.value?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = currentFilter?.value || [];
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: any) => v !== option.value);
                    
                    if (newValues.length > 0) {
                      addFilter(filterConfig.field, 'in', newValues, `${filterConfig.label}: ${newValues.join(', ')}`);
                    } else {
                      removeFilter(filterConfig.field);
                    }
                  }}
                />
                <Label htmlFor={`${filterConfig.field}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <Input
            value={currentFilter?.value || ''}
            onChange={(e) => {
              if (e.target.value) {
                addFilter(filterConfig.field, 'contains', e.target.value, `${filterConfig.label}: ${e.target.value}`);
              } else {
                removeFilter(filterConfig.field);
              }
            }}
            placeholder={`Filter by ${filterConfig.label}`}
          />
        );
    }
  };

  const dropdownItems = getDropdownItems();
  const hasActiveFilters = filters.length > 0 || activeSort;

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-9 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
              onClick={() => handleInputChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && dropdownItems.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1">
            <CardContent className="p-2">
              <div ref={dropdownRef} className="space-y-1">
                {dropdownItems.map((item, index) => (
                  <button
                    key={`${item.type}-${item.value}`}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-muted ${
                      focusedIndex === index ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectItem(item)}
                  >
                    {item.type === 'history' ? (
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="truncate">{item.value}</span>
                    {item.type === 'history' && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Recent
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filters */}
        {availableFilters.length > 0 && (
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {filters.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filters</h4>
                {availableFilters.map((filterConfig) => (
                  <div key={filterConfig.field} className="space-y-2">
                    <Label>{filterConfig.label}</Label>
                    {renderFilterControl(filterConfig)}
                  </div>
                ))}
                {filters.length > 0 && (
                  <>
                    <Separator />
                    <Button variant="outline" size="sm" onClick={() => setFilters([])}>
                      Clear Filters
                    </Button>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Sort */}
        {availableSorts.length > 0 && (
          <Select
            value={activeSort ? `${activeSort.field}-${activeSort.direction}` : ''}
            onValueChange={(value) => {
              if (value) {
                const [field, direction] = value.split('-');
                const sortOption = availableSorts.find(s => s.field === field && s.direction === direction);
                setActiveSort(sortOption);
              } else {
                setActiveSort(undefined);
              }
            }}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Sort by">
                {activeSort && (
                  <div className="flex items-center gap-1">
                    {activeSort.direction === 'asc' ? (
                      <SortAsc className="h-3 w-3" />
                    ) : (
                      <SortDesc className="h-3 w-3" />
                    )}
                    {activeSort.label}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No sorting</SelectItem>
              {availableSorts.map((sort) => (
                <SelectItem key={`${sort.field}-${sort.direction}`} value={`${sort.field}-${sort.direction}`}>
                  <div className="flex items-center gap-2">
                    {sort.direction === 'asc' ? (
                      <SortAsc className="h-3 w-3" />
                    ) : (
                      <SortDesc className="h-3 w-3" />
                    )}
                    {sort.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear All */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAll}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.map((filter) => (
            <Badge key={filter.field} variant="secondary" className="gap-1">
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 w-3 h-3"
                onClick={() => removeFilter(filter.field)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
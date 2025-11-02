// Advanced search and filtering utilities
export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
  caseSensitive?: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchOptions {
  query?: string;
  filters?: SearchFilter[];
  sort?: SortOptions;
  limit?: number;
  offset?: number;
  fuzzy?: boolean;
  highlightMatches?: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  query: string;
  executionTime: number;
  suggestions?: string[];
}

export class AdvancedSearch<T> {
  private data: T[] = [];
  private searchableFields: (keyof T)[] = [];
  private searchHistory: string[] = [];

  constructor(data: T[], searchableFields: (keyof T)[]) {
    this.data = data;
    this.searchableFields = searchableFields;
  }

  updateData(data: T[]): void {
    this.data = data;
  }

  search(options: SearchOptions): SearchResult<T> {
    const startTime = Date.now();
    let results = [...this.data];

    // Apply text search
    if (options.query && options.query.trim()) {
      const query = options.query.trim();
      this.addToHistory(query);
      
      if (options.fuzzy) {
        results = this.fuzzySearch(results, query);
      } else {
        results = this.exactSearch(results, query);
      }
    }

    // Apply filters
    if (options.filters && options.filters.length > 0) {
      results = this.applyFilters(results, options.filters);
    }

    // Apply sorting
    if (options.sort) {
      results = this.sortResults(results, options.sort);
    }

    const total = results.length;

    // Apply pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit || results.length;
      results = results.slice(offset, offset + limit);
    }

    const executionTime = Date.now() - startTime;

    return {
      items: results,
      total,
      hasMore: (options.offset || 0) + results.length < total,
      query: options.query || '',
      executionTime,
      suggestions: this.generateSuggestions(options.query || '')
    };
  }

  private exactSearch(data: T[], query: string): T[] {
    const lowercaseQuery = query.toLowerCase();
    
    return data.filter(item => {
      return this.searchableFields.some(field => {
        const value = item[field];
        if (value == null) return false;
        
        const stringValue = String(value).toLowerCase();
        return stringValue.includes(lowercaseQuery);
      });
    });
  }

  private fuzzySearch(data: T[], query: string): T[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    
    return data.filter(item => {
      return this.searchableFields.some(field => {
        const value = item[field];
        if (value == null) return false;
        
        const stringValue = String(value).toLowerCase();
        return queryWords.every(word => 
          this.calculateLevenshteinDistance(stringValue, word) <= Math.max(1, Math.floor(word.length * 0.3))
        );
      });
    });
  }

  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private applyFilters(data: T[], filters: SearchFilter[]): T[] {
    return data.filter(item => {
      return filters.every(filter => {
        const value = item[filter.field as keyof T];
        return this.evaluateFilter(value, filter);
      });
    });
  }

  private evaluateFilter(value: any, filter: SearchFilter): boolean {
    if (value == null) return false;

    const filterValue = filter.value;
    const stringValue = filter.caseSensitive ? String(value) : String(value).toLowerCase();
    const stringFilterValue = filter.caseSensitive ? String(filterValue) : String(filterValue).toLowerCase();

    switch (filter.operator) {
      case 'equals':
        return value === filterValue;
      case 'contains':
        return stringValue.includes(stringFilterValue);
      case 'startsWith':
        return stringValue.startsWith(stringFilterValue);
      case 'endsWith':
        return stringValue.endsWith(stringFilterValue);
      case 'greaterThan':
        return Number(value) > Number(filterValue);
      case 'lessThan':
        return Number(value) < Number(filterValue);
      case 'between':
        if (Array.isArray(filterValue) && filterValue.length === 2) {
          const numValue = Number(value);
          return numValue >= Number(filterValue[0]) && numValue <= Number(filterValue[1]);
        }
        return false;
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value);
      default:
        return false;
    }
  }

  private sortResults(data: T[], sort: SortOptions): T[] {
    return [...data].sort((a, b) => {
      const aValue = a[sort.field as keyof T];
      const bValue = b[sort.field as keyof T];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sort.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sort.direction === 'asc' ? -1 : 1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  private addToHistory(query: string): void {
    this.searchHistory = [query, ...this.searchHistory.filter(q => q !== query)].slice(0, 10);
  }

  private generateSuggestions(query: string): string[] {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    const lowercaseQuery = query.toLowerCase();

    // Get suggestions from search history
    this.searchHistory.forEach(historyQuery => {
      if (historyQuery.toLowerCase().includes(lowercaseQuery) && historyQuery !== query) {
        suggestions.add(historyQuery);
      }
    });

    // Get suggestions from data
    this.data.forEach(item => {
      this.searchableFields.forEach(field => {
        const value = item[field];
        if (value != null) {
          const stringValue = String(value);
          if (stringValue.toLowerCase().includes(lowercaseQuery)) {
            const words = stringValue.split(/\s+/);
            words.forEach(word => {
              if (word.toLowerCase().startsWith(lowercaseQuery) && word.length > query.length) {
                suggestions.add(word);
              }
            });
          }
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }

  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
  }
}

// Predefined search configurations
export const SubjectSearch = class extends AdvancedSearch<any> {
  constructor(subjects: any[]) {
    super(subjects, ['name', 'semester', 'grade', 'description']);
  }

  searchByGrade(grade: string): any[] {
    return this.search({
      filters: [{ field: 'grade', operator: 'equals', value: grade }]
    }).items;
  }

  searchBySemester(semester: string): any[] {
    return this.search({
      filters: [{ field: 'semester', operator: 'equals', value: semester }]
    }).items;
  }

  searchByMarksRange(min: number, max: number): any[] {
    return this.search({
      filters: [{ field: 'marks', operator: 'between', value: [min, max] }]
    }).items;
  }
};

export const ProjectSearch = class extends AdvancedSearch<any> {
  constructor(projects: any[]) {
    super(projects, ['title', 'description', 'techStack', 'status']);
  }

  searchByTechnology(tech: string): any[] {
    return this.search({
      filters: [{ field: 'techStack', operator: 'contains', value: tech }]
    }).items;
  }

  searchByStatus(status: string): any[] {
    return this.search({
      filters: [{ field: 'status', operator: 'equals', value: status }]
    }).items;
  }
};

export const CertificateSearch = class extends AdvancedSearch<any> {
  constructor(certificates: any[]) {
    super(certificates, ['title', 'issuer', 'skills', 'description']);
  }

  searchByIssuer(issuer: string): any[] {
    return this.search({
      filters: [{ field: 'issuer', operator: 'contains', value: issuer }]
    }).items;
  }

  searchBySkill(skill: string): any[] {
    return this.search({
      filters: [{ field: 'skills', operator: 'contains', value: skill }]
    }).items;
  }
};

// Search result highlighting utility
export function highlightMatches(text: string, query: string): string {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

// Debounced search hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

import React from 'react';
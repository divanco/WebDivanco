import { useState, useCallback, useMemo } from 'react';
import { 
  useLazyGlobalSearchQuery,
  useLazyGetSearchSuggestionsQuery 
} from '../features/search/searchApi';

// Hook personalizado para debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  const debouncedQuery = useDebounce(query, 300);
  
  const [triggerSearch, searchResult] = useLazyGlobalSearchQuery();
  const [triggerSuggestions] = useLazyGetSearchSuggestionsQuery();

  // Buscar sugerencias automáticamente
  const searchSuggestions = useCallback(async (searchTerm) => {
    if (searchTerm && searchTerm.length >= 1) {
      try {
        const result = await triggerSuggestions(searchTerm).unwrap();
        setSuggestions(result.suggestions || []);
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, [triggerSuggestions]);

  // Búsqueda principal
  const search = useCallback(async (searchTerm = query, options = {}) => {
    if (searchTerm.length < 2) return;
    
    setIsSearching(true);
    try {
      const result = await triggerSearch({ 
        q: searchTerm, 
        ...options 
      }).unwrap();
      setSuggestions([]); // Limpiar sugerencias después de buscar
      return result;
    } catch (error) {
      console.error('Error en búsqueda:', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  }, [query, triggerSearch]);

  // Datos computados
  const hasResults = useMemo(() => {
    return searchResult.data?.results?.totalResults > 0;
  }, [searchResult.data]);

  const totalResults = useMemo(() => {
    return searchResult.data?.results?.totalResults || 0;
  }, [searchResult.data]);

  return {
    // Estado
    query,
    suggestions,
    isSearching,
    hasResults,
    totalResults,
    results: searchResult.data?.results,
    
    // Acciones
    setQuery,
    search,
    searchSuggestions,
    clearSuggestions: () => setSuggestions([]),
    
    // Estado de RTK Query
    isLoading: searchResult.isLoading,
    error: searchResult.error,
  };
};
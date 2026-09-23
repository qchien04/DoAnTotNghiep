import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2, Command, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

export interface SearchSuggestionItem {
  id?: string | number;
  label: string;
  sublabel?: string;
  category?: string;
  icon?: React.ReactNode;
  value?: string;
}

export interface SearchBarProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'pill' | 'bordered';
  isLoading?: boolean;
  allowClear?: boolean;
  showButton?: boolean;
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline';
  shortcut?: string;
  suggestions?: SearchSuggestionItem[];
  onSelectSuggestion?: (item: SearchSuggestionItem) => void;
  recentSearches?: string[];
  onSelectRecentSearch?: (item: string) => void;
  onClearRecentSearches?: () => void;
  tags?: { label: string; value: string; count?: number }[];
  selectedTags?: string[];
  onTagToggle?: (tagValue: string) => void;
  debounceMs?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Tìm kiếm phòng trọ, khu vực, trường đại học...',
  size = 'md',
  variant = 'default',
  isLoading = false,
  allowClear = true,
  showButton = false,
  buttonText = 'Tìm kiếm',
  buttonVariant = 'primary',
  shortcut,
  suggestions,
  onSelectSuggestion,
  recentSearches,
  onSelectRecentSearch,
  onClearRecentSearches,
  tags,
  selectedTags = [],
  onTagToggle,
  debounceMs = 0,
  disabled = false,
  autoFocus = false,
  className = '',
  fullWidth = true,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchValue = controlledValue !== undefined ? controlledValue : internalValue;

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle global keyboard shortcut
  useEffect(() => {
    if (!shortcut) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut]);

  const triggerChange = useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);

      if (debounceMs > 0 && onSearch) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          onSearch(newValue);
        }, debounceMs);
      }
    },
    [controlledValue, onChange, onSearch, debounceMs]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    triggerChange(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions && suggestions[highlightedIndex]) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else {
        onSearch?.(searchValue);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions && suggestions.length > 0) {
        setIsOpen(true);
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions && suggestions.length > 0) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    }
  };

  const handleClear = () => {
    triggerChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (item: SearchSuggestionItem) => {
    const val = item.value || item.label;
    triggerChange(val);
    onSelectSuggestion?.(item);
    onSearch?.(val);
    setIsOpen(false);
  };

  const handleSelectRecent = (term: string) => {
    triggerChange(term);
    onSelectRecentSearch?.(term);
    onSearch?.(term);
    setIsOpen(false);
  };

  // Size styles
  const sizeClasses = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-3.5 text-xs sm:text-sm',
    lg: 'h-13 px-4 text-sm sm:text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Variant styles
  const variantClasses = {
    default: 'bg-stay-card-bg border border-stay-border focus-within:border-stay-primary focus-within:ring-2 focus-within:ring-stay-primary/20',
    filled: 'bg-stay-bg-app border border-transparent focus-within:bg-stay-card-bg focus-within:border-stay-primary focus-within:ring-2 focus-within:ring-stay-primary/20',
    pill: 'bg-stay-card-bg border border-stay-border rounded-full focus-within:border-stay-primary focus-within:ring-2 focus-within:ring-stay-primary/20',
    bordered: 'bg-transparent border-2 border-stay-border focus-within:border-stay-primary',
  };

  const hasSuggestions = suggestions && suggestions.length > 0;
  const hasRecent = recentSearches && recentSearches.length > 0 && !searchValue;
  const showDropdown = isOpen && (hasSuggestions || hasRecent);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <div
        className={`flex items-center gap-2 rounded-2xl transition-all duration-200 ${sizeClasses[size]} ${
          variantClasses[variant]
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
      >
        {/* Search / Loading Icon */}
        <div className="shrink-0 text-stay-text-secondary flex items-center justify-center">
          {isLoading ? (
            <Loader2 className={`${iconSizes[size]} animate-spin text-stay-primary`} />
          ) : (
            <Search className={`${iconSizes[size]} text-stay-text-secondary`} />
          )}
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full bg-transparent border-none outline-hidden text-stay-text placeholder:text-stay-text-muted focus:ring-0 p-0 font-medium"
        />

        {/* Clear Button */}
        {allowClear && searchValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 p-1 rounded-full text-stay-text-muted hover:text-stay-text hover:bg-stay-bg-app transition-colors cursor-pointer"
            title="Xóa tìm kiếm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Keyboard Shortcut Badge */}
        {shortcut && !searchValue && (
          <div className="shrink-0 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-stay-bg-app border border-stay-border text-[10px] font-mono text-stay-text-muted">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        )}

        {/* Action Button */}
        {showButton && (
          <div className="shrink-0 pl-1">
            <Button
              variant={buttonVariant}
              size={size === 'lg' ? 'md' : 'sm'}
              onClick={() => onSearch?.(searchValue)}
              disabled={disabled}
              className="rounded-xl shadow-2xs"
            >
              {buttonText}
            </Button>
          </div>
        )}
      </div>

      {/* Tags / Fast Filter Chips */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          <span className="text-[11px] font-semibold text-stay-text-muted mr-1">Gợi ý tìm nhanh:</span>
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => onTagToggle?.(tag.value)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-stay-primary-subtle text-stay-primary border-stay-primary shadow-2xs'
                    : 'bg-stay-card-bg text-stay-text-secondary border-stay-border hover:border-stay-primary/50 hover:text-stay-text'
                }`}
              >
                <span>{tag.label}</span>
                {tag.count !== undefined && (
                  <span className="text-[10px] opacity-75 font-mono">({tag.count})</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Autocomplete Suggestions / Recent Search Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-stay-card-bg border border-stay-border rounded-2xl shadow-dropdown overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {/* Suggestions List */}
          {hasSuggestions && (
            <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
              <div className="px-2.5 py-1 text-[10px] font-bold text-stay-text-muted uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-stay-primary" /> Kết quả gợi ý
                </span>
                <span className="font-mono text-[9px]">Dùng phím ↑ ↓ để duyệt</span>
              </div>
              {suggestions.map((item, index) => {
                const isHighlighted = highlightedIndex === index;
                return (
                  <div
                    key={item.id || item.value || item.label || index}
                    onClick={() => handleSelectSuggestion(item)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isHighlighted
                        ? 'bg-stay-primary-subtle text-stay-primary font-medium'
                        : 'text-stay-text hover:bg-stay-bg-app'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.icon ? (
                        <span className="text-stay-primary shrink-0">{item.icon}</span>
                      ) : (
                        <Search className="w-3.5 h-3.5 text-stay-text-muted shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="block truncate font-semibold text-stay-text">{item.label}</span>
                        {item.sublabel && (
                          <span className="block text-[11px] text-stay-text-secondary truncate">
                            {item.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {item.category && (
                        <Badge variant="neutral" size="sm">
                          {item.category}
                        </Badge>
                      )}
                      <ArrowRight className="w-3 h-3 text-stay-text-muted opacity-60" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Searches */}
          {hasRecent && (
            <div className="p-2 border-t border-stay-border-subtle first:border-t-0 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold text-stay-text-muted uppercase tracking-wider flex items-center justify-between">
                <span>Tìm kiếm gần đây</span>
                {onClearRecentSearches && (
                  <button
                    type="button"
                    onClick={onClearRecentSearches}
                    className="text-[10px] text-stay-primary hover:underline cursor-pointer"
                  >
                    Xóa lịch sử
                  </button>
                )}
              </div>
              {recentSearches.map((term, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectRecent(term)}
                  className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-stay-text hover:bg-stay-bg-app cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-stay-text-muted">🕒</span>
                    <span className="font-medium">{term}</span>
                  </div>
                  <span className="text-[10px] text-stay-text-muted">Gần đây</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

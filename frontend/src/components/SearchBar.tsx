interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onGroupBy?: () => void;
    onFilter?: () => void;
    onSortBy?: () => void;
  }
  
  const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search bar ----',
    value = '',
    onChange,
    onGroupBy,
    onFilter,
    onSortBy,
  }) => {
    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="button" onClick={onGroupBy} style={{ padding: '8px 16px' }}>
          Group by
        </button>
        <button className="button" onClick={onFilter} style={{ padding: '8px 16px' }}>
          Filter
        </button>
        <button className="button" onClick={onSortBy} style={{ padding: '8px 16px' }}>
          Sort by...
        </button>
      </div>
    );
  };
  
  export default SearchBar;
  
  
import { useState, useRef, useEffect } from 'react';
import { wilayas } from '@/data/products';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WilayaSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const WilayaSelect = ({ value, onChange, error }: WilayaSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedWilaya = wilayas.find((w) => w.name === value);

  const filteredWilayas = wilayas.filter((w) =>
    w.name.includes(searchQuery) || w.id.toString().includes(searchQuery)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (wilayaName: string) => {
    onChange(wilayaName);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full bg-background border rounded-lg px-4 py-3 text-right flex items-center justify-between transition-colors',
          error ? 'border-destructive' : 'border-border focus:border-primary',
          isOpen && 'border-primary'
        )}
      >
        <span className={selectedWilaya ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedWilaya ? `${selectedWilaya.id} - ${selectedWilaya.name}` : 'اختر الولاية'}
        </span>
        <ChevronDown
          className={cn('w-5 h-5 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن الولاية..."
                className="w-full bg-secondary border-0 rounded-lg pr-10 pl-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <ul className="max-h-60 overflow-auto">
            {filteredWilayas.length > 0 ? (
              filteredWilayas.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(w.name)}
                    className={cn(
                      'w-full px-4 py-2.5 text-right hover:bg-primary/10 transition-colors flex items-center justify-between',
                      value === w.name && 'bg-primary/10 text-primary'
                    )}
                  >
                    <span className="text-muted-foreground text-sm">{w.id}</span>
                    <span>{w.name}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-center text-muted-foreground text-sm">
                لا توجد نتائج
              </li>
            )}
          </ul>
        </div>
      )}

      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
};

export default WilayaSelect;

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ChevronRight, Users, X } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  isPrimary: boolean;
}

interface School {
  id: string;
  name: string;
  notes: string | null;
  createdAt: string;
  contacts: Contact[];
}

const API = 'http://localhost:3000';

export default function SchoolsSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const { data: schools = [] } = useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: () => fetch(`${API}/schools`).then(r => r.json()),
  });

  const filtered = query.trim()
    ? schools.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.contacts.some(c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.role.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query)
        )
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search schools, contacts, phones…"
          autoFocus
          className="w-full h-12 pl-11 pr-10 rounded-xl border border-border bg-card text-foreground text-sm
                     placeholder:text-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg
                       flex items-center justify-center text-muted-foreground
                       hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      {!query.trim() && (
        <p className="text-sm text-muted-foreground text-center py-10">
          Type to search across schools, contacts, and phone numbers.
        </p>
      )}

      {query.trim() && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">
          No results found for "{query}".
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((school) => (
          <button
            key={school.id}
            onClick={() => navigate(`/schools/${school.id}`)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border
                       hover:border-primary/30 hover:shadow-sm transition-all text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm">
                {school.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{school.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {school.contacts.length} contact{school.contacts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

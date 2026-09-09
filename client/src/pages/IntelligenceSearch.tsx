import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, MapPin, X } from 'lucide-react';
import api from '../lib/api';
import { useCampaign } from '../lib/CampaignContext';

interface Intelligence {
  id: string;
  name: string;
  source: string;
  intell: string;
  bestTimeToVisit: string;
  location: string;
  status: string;
}

export default function IntelligenceSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { campaignId } = useCampaign();
  const search = query.trim();

  const { data: records = [] } = useQuery<Intelligence[]>({
    queryKey: ['intelligence', 'search', search, { campaignId }],
    queryFn: () => api.get('/intelligence', { 
      params: { search, ...(campaignId ? { campaignId } : {}) } 
    }).then(r => r.data),
    enabled: search.length > 0,
  });

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, location, details..."
          autoFocus
          className="w-full h-12 pl-11 pr-10 rounded-xl border border-border bg-card text-foreground text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg
                       flex items-center justify-center text-muted-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!search && (
        <p className="text-sm text-muted-foreground text-center py-10">
          Type to search your intelligence records.
        </p>
      )}

      {search && records.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">
          No records found for "{query}".
        </p>
      )}

      <div className="space-y-3">
        {records.map((record) => (
          <button
            key={record.id}
            onClick={() => navigate(`/intelligence/${record.id}`)}
            className="w-full p-4 rounded-2xl bg-card border border-border text-left relative
                       hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <h3 className="text-base font-semibold text-foreground pr-16">{record.name}</h3>
            <p className="text-sm text-foreground mt-2 line-clamp-2">{record.intell}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{record.location}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

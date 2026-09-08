import { useQuery } from '@tanstack/react-query';
import { Brain, MapPin } from 'lucide-react';

interface Intelligence {
  id: string;
  name: string;
  source: string;
  intell: string;
  bestTimeToVisit: string;
  location: string;
  status: string;
}

const API = 'http://localhost:3000';

export default function IntelligenceList() {
  const { data: records = [], isLoading } = useQuery<Intelligence[]>({
    queryKey: ['intelligence'],
    queryFn: () => fetch(`${API}/intelligence`).then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Brain className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No intelligence records</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          Start building your prospect pipeline by adding new intelligence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div
          key={record.id}
          className="w-full p-4 rounded-2xl bg-card border border-border text-left relative"
        >
          <div className="absolute top-4 right-4">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
              record.status === 'VISITED' 
                ? 'bg-success/10 text-success' 
                : 'bg-primary/10 text-primary'
            }`}>
              {record.status}
            </span>
          </div>

          <h3 className="text-base font-semibold text-foreground pr-16">{record.name}</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Source: {record.source}</p>
          
          <p className="text-sm text-foreground mt-3 line-clamp-2">{record.intell}</p>
          
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{record.location}</span>
            </div>
            <div className="text-xs font-medium text-foreground bg-primary/5 border border-primary/10 px-2 py-1 rounded-lg">
              Visit: {record.bestTimeToVisit}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

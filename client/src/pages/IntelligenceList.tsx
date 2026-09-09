import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, MapPin, Calendar, Loader2 } from 'lucide-react';

interface Intelligence {
  id: string;
  name: string;
  source: string;
  intell: string;
  bestTimeToVisit: string;
  location: string;
  status: string;
  plannedVisitDate: string | null;
}

const API = 'http://localhost:3000';

export default function IntelligenceList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery<Intelligence[]>({
    queryKey: ['intelligence'],
    queryFn: () => fetch(`${API}/intelligence`).then(r => r.json()),
  });

  const scheduleMutation = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const res = await fetch(`${API}/intelligence/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannedVisitDate: new Date(date).toISOString() }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence'] });
    },
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
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{record.location}</span>
              </div>
              <div className="text-xs font-medium text-foreground bg-primary/5 border border-primary/10 px-2 py-1 rounded-lg">
                Visit: {record.bestTimeToVisit}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {record.status === 'PLANNED' && (
                <>
                  {record.plannedVisitDate ? (
                    <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1.5 rounded-lg font-medium cursor-help" title={`Scheduled for ${new Date(record.plannedVisitDate).toLocaleDateString()}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      Scheduled
                    </div>
                  ) : (
                    <div className="relative group">
                      <input
                        type="date"
                        disabled={scheduleMutation.isPending}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        onChange={(e) => {
                          if (e.target.value) {
                            scheduleMutation.mutate({ id: record.id, date: e.target.value });
                          }
                        }}
                      />
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-xs font-semibold transition-colors">
                        {scheduleMutation.isPending && scheduleMutation.variables?.id === record.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Calendar className="w-3.5 h-3.5" />
                        )}
                        Schedule
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => navigate(`/schools/new`, { state: { importId: record.id } })}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 
                               text-xs font-semibold transition-colors"
                  >
                    Record Visit
                  </button>
                </>
              )}
              
              <button
                onClick={() => navigate(`/intelligence/${record.id}`)}
                className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80
                           hover:text-foreground text-xs font-medium transition-colors"
              >
                View
              </button>

              <button
                onClick={() => navigate(`/intelligence/${record.id}/edit`)}
                className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80
                           hover:text-foreground text-xs font-medium transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

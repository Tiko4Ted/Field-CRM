import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Loader2, CheckCircle2, Bookmark } from 'lucide-react';
import api from '../lib/api';
import { useCampaign } from '../lib/CampaignContext';

interface Intelligence {
  id: string;
  name: string;
  source: string | null;
  intell: string | null;
  bestTimeToVisit: string | null;
  location: string | null;
  status: string;
}


export default function IntelligenceVisited() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { campaignId } = useCampaign();

  const { data: allRecords = [], isLoading } = useQuery<Intelligence[]>({
    queryKey: ['intelligence', { campaignId }],
    queryFn: () => api.get('/intelligence', { params: campaignId ? { campaignId } : {} }).then(r => r.data),
  });

  const records = allRecords.filter(r => r.status === 'VISITED');

  const bookMutation = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { data } = await api.patch(`/intelligence/${id}`, { status: 'BOOKED', bookedDate: new Date(date).toISOString() });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence', { campaignId }] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No visited schools yet</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          When you record a visit, the school will appear here.
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
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-success/10 text-success">
              {record.status}
            </span>
          </div>

          <h3 className="text-base font-semibold text-foreground pr-16">{record.name}</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Source: {record.source || 'Not specified'}</p>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{record.location || 'Not specified'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative group">
                <input
                  type="date"
                  disabled={bookMutation.isPending}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  onChange={(e) => {
                    if (e.target.value) {
                      bookMutation.mutate({ id: record.id, date: e.target.value });
                    }
                  }}
                />
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 text-xs font-semibold transition-colors">
                  {bookMutation.isPending && bookMutation.variables?.id === record.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
                  Book Install
                </button>
              </div>

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

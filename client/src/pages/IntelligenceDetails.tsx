import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bookmark, Calendar, CheckCircle2, Edit2, Loader2, MapPin, Trash2 } from 'lucide-react';
import api from '../lib/api';


interface Intelligence {
  id: string;
  name: string;
  source: string;
  intell: string;
  bestTimeToVisit: string;
  location: string;
  estimatedStudents: string | null;
  schoolType: string | null;
  hasSystem: string | null;
  plannedVisitDate: string | null;
  bookedDate: string | null;
  status: string;
  schoolId: string | null;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  PLANNED: 'bg-primary/10 text-primary',
  VISITED: 'bg-success/10 text-success',
  BOOKED: 'bg-indigo-500/10 text-indigo-600',
  CANCELLED: 'bg-destructive/10 text-destructive',
};

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not set';

  return new Date(value).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function IntelligenceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: record, isLoading } = useQuery<Intelligence>({
    queryKey: ['intelligence', id],
    queryFn: () => api.get(`/intelligence/${id}`).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/intelligence/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence'] });
      navigate('/intelligence');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      api.patch(`/intelligence/${id}`, { status: 'CANCELLED' }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence'] });
      queryClient.invalidateQueries({ queryKey: ['intelligence', id] });
    },
  });

  const bookMutation = useMutation({
    mutationFn: (date: string) =>
      api.patch(`/intelligence/${id}`, { status: 'BOOKED', bookedDate: new Date(date).toISOString() }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence'] });
      queryClient.invalidateQueries({ queryKey: ['intelligence', id] });
    },
  });

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground animate-pulse">Loading...</div>;
  }

  if (!record) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Intelligence record not found.</p>
        <button onClick={() => navigate('/intelligence')} className="mt-4 text-sm text-primary font-medium">
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/intelligence')}
          className="w-9 h-9 rounded-xl flex items-center justify-center
                     hover:bg-muted transition-colors text-muted-foreground hover:text-foreground mt-0.5"
          aria-label="Back to intelligence list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight truncate">{record.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">Source: {record.source}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${statusStyles[record.status] || 'bg-muted text-muted-foreground'}`}>
              {record.status}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm text-foreground whitespace-pre-line">{record.intell}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 text-primary" />
            <span>{record.location}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 mt-0.5 text-primary" />
            <span>Planned: {formatDate(record.plannedVisitDate)}</span>
          </div>
          <div className="text-muted-foreground">Best time: {record.bestTimeToVisit}</div>
          <div className="text-muted-foreground">Booked: {formatDate(record.bookedDate)}</div>
          <div className="text-muted-foreground">Students: {record.estimatedStudents || 'Unknown'}</div>
          <div className="text-muted-foreground">Type: {record.schoolType || 'Unknown'}</div>
          <div className="text-muted-foreground">Has system: {record.hasSystem || 'Unknown'}</div>
          <div className="text-muted-foreground">Created: {formatDate(record.createdAt)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {record.status === 'PLANNED' && (
          <>
            <button
              onClick={() => navigate('/schools/new', { state: { importId: record.id } })}
              className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold
                         hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Record Visit
            </button>
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="h-10 px-4 rounded-lg bg-destructive/10 text-destructive text-sm font-semibold
                         hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              Cancel Prospect
            </button>
          </>
        )}

        {record.status === 'VISITED' && (
          <div className="relative">
            <input
              type="date"
              disabled={bookMutation.isPending}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              onChange={(event) => {
                if (event.target.value) {
                  bookMutation.mutate(event.target.value);
                }
              }}
            />
            <button className="h-10 px-4 rounded-lg bg-indigo-500/10 text-indigo-600 text-sm font-semibold
                               hover:bg-indigo-500/20 transition-colors flex items-center gap-2">
              {bookMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
              Book Install
            </button>
          </div>
        )}

        <button
          onClick={() => navigate(`/intelligence/${record.id}/edit`)}
          className="h-10 px-4 rounded-lg bg-muted text-muted-foreground text-sm font-medium
                     hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>

        <button
          onClick={() => {
            if (confirm('Delete this intelligence record?')) {
              deleteMutation.mutate();
            }
          }}
          disabled={deleteMutation.isPending}
          className="h-10 px-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium
                     hover:bg-destructive/20 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>
    </div>
  );
}

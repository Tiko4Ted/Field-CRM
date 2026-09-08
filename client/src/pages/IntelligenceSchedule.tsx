import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface Intelligence {
  id: string;
  name: string;
  bestTimeToVisit: string;
  location: string;
  plannedVisitDate: string | null;
  status: string;
}

const API = 'http://localhost:3000';

export default function IntelligenceSchedule() {
  const { data: records = [], isLoading } = useQuery<Intelligence[]>({
    queryKey: ['intelligence'],
    queryFn: () => fetch(`${API}/intelligence`).then(r => r.json()),
  });

  const planned = records
    .filter(r => r.plannedVisitDate && r.status === 'PLANNED')
    .sort((a, b) => new Date(a.plannedVisitDate!).getTime() - new Date(b.plannedVisitDate!).getTime());

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-muted" />)}
      </div>
    );
  }

  if (planned.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Schedule clear</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          You don't have any intelligence records scheduled for a visit. Add a "Plan Visit Date" to a record to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Visit Schedule</h2>
        <p className="text-sm text-muted-foreground mt-1">Schools you plan to visit soon.</p>
      </div>

      <div className="space-y-4">
        {planned.map(record => {
          const date = new Date(record.plannedVisitDate!);
          const isPast = date < new Date(new Date().setHours(0,0,0,0));
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div key={record.id} className="flex gap-4">
              {/* Date Column */}
              <div className="w-14 flex flex-col items-center pt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-xl font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {date.getDate()}
                </span>
                {isPast && !isToday && (
                  <span className="mt-1 text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                    OVERDUE
                  </span>
                )}
                {isToday && (
                  <span className="mt-1 text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    TODAY
                  </span>
                )}
              </div>

              {/* Card Column */}
              <div className="flex-1 p-4 rounded-2xl bg-card border border-border shadow-sm">
                <h3 className="text-base font-semibold text-foreground">{record.name}</h3>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mt-0.5 text-primary" />
                    <span>Best time: {record.bestTimeToVisit}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                    <span>{record.location}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

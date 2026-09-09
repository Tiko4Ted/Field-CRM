import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users, MapPin } from 'lucide-react';
import api from '../lib/api';

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  notes: string | null;
  isPrimary: boolean;
}

interface School {
  id: string;
  name: string;
  notes: string | null;
  followUpDate: string | null;
  status: string;
  createdAt: string;
  contacts: Contact[];
}


export default function SchoolsList() {
  const navigate = useNavigate();

  const { data: schools = [], isLoading } = useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: () => api.get(`/schools`).then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No schools yet</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          Start by adding your first school visit record.
        </p>
        <button
          onClick={() => navigate('/schools/new')}
          className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium
                     rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
        >
          Add first school
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {schools.map((school) => {
        const primaryContact = school.contacts.find(c => c.isPrimary);
        return (
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
                  {primaryContact && ` - ${primaryContact.name}`}
                </span>
              </div>
              {school.followUpDate && (
                <p className="text-xs text-amber-700 mt-1">
                  Follow-up {new Date(school.followUpDate).toLocaleDateString('en-GB')}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
